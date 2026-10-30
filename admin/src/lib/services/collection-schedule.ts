/**
 * Finance Collections — installment schedule derivation.
 *
 * The CRM stores installments as FeePlanItem rows (name, amount or percentOfFee,
 * dueOffsetDays, sortOrder) which are snapshotted onto the admission's
 * `metadata.feePlanSnapshot` at creation time. Payments are recorded at the
 * ADMISSION level (there is no per-installment ledger), so this module:
 *
 *   1. Reconstructs each installment's amount and due date.
 *   2. Reconciles the installment sum against the authoritative `feeFinal`
 *      (a discount is distributed across later installments first).
 *   3. Allocates the admission's net-paid cashflow (COMPLETED / refunded, never
 *      PENDING / FAILED / VOIDED) to installments in chronological (FIFO) order.
 *
 * All arithmetic uses integer cents via the shared fee-calculation helpers, so
 * outstanding balances reconcile with the payment ledger exactly. Everything is
 * pure and framework-free for direct unit testing.
 */

import {
  computeDueDate,
  computeNetPaid,
  fromCents,
  roundMoney,
  toCents,
} from "@/lib/services/fee-calculation.service";
import {
  endOfISTMonth,
  startOfISTDay,
  startOfISTMonth,
} from "@/lib/time/ist";

export interface CollectionPlanItem {
  name: string;
  amount?: number | string | null;
  percentOfFee?: number | string | null;
  dueOffsetDays?: number | null;
  sortOrder?: number | null;
  /** Present on feePlanSnapshot items — already resolved against the base fee. */
  resolvedAmount?: number | string | null;
}

export interface CollectionPayment {
  amount: number | string;
  refundedAmount?: number | string | null;
  status: string;
}

export type CollectionInstallmentStatus = "PAID" | "PENDING" | "OVERDUE";

export interface CollectionInstallment {
  /** Stable reference within an admission (the item sortOrder/index). */
  key: string;
  name: string;
  amount: number;
  dueDate: Date;
  paid: number;
  pending: number;
  daysOverdue: number;
  agingBucket: string | null;
  status: CollectionInstallmentStatus;
}

export interface InstallmentScheduleInput {
  items: CollectionPlanItem[];
  baseDate: Date;
  /** Base course fee used to resolve percentOfFee items. */
  baseFee: number | null;
  /** Authoritative payable total (feeFinal). */
  feeFinal: number | null;
  payments: CollectionPayment[];
  now?: Date;
}

/** Rupee amount for one plan item — prefers the snapshot's resolved amount. */
export function resolveItemAmount(
  item: CollectionPlanItem,
  baseFee: number | null,
): number {
  if (item.resolvedAmount !== null && item.resolvedAmount !== undefined) {
    return roundMoney(Number(item.resolvedAmount));
  }
  const pct = item.percentOfFee;
  if (pct !== null && pct !== undefined) {
    if (baseFee === null || baseFee === undefined) return 0;
    return roundMoney((Number(pct) / 100) * Number(baseFee));
  }
  return roundMoney(Number(item.amount ?? 0));
}

/** Whole days between an installment's IST due day and the current IST day. */
export function daysOverdueFor(dueDate: Date, now: Date = new Date()): number {
  const dueDay = startOfISTDay(dueDate).getTime();
  const today = startOfISTDay(now).getTime();
  const diff = Math.floor((today - dueDay) / 86_400_000);
  return diff > 0 ? diff : 0;
}

/** Aging bucket for a positive day-overdue count (documented boundaries). */
export function agingBucketFor(days: number): string {
  if (days <= 7) return "1-7 days";
  if (days <= 30) return "8-30 days";
  if (days <= 60) return "31-60 days";
  return "60+ days";
}

/** Whether a due date falls inside the current IST calendar month. */
export function isDueInISTMonth(dueDate: Date, now: Date = new Date()): boolean {
  const t = dueDate.getTime();
  return t >= startOfISTMonth(now).getTime() && t <= endOfISTMonth(now).getTime();
}

/** An installment is overdue once its due DAY has passed (before today, IST). */
export function isOverdue(dueDate: Date, now: Date = new Date()): boolean {
  return dueDate.getTime() < startOfISTDay(now).getTime();
}

/**
 * Build the full installment schedule for one admission, in due-date order,
 * with payments allocated FIFO and the total reconciled to `feeFinal`.
 */
export function buildInstallmentSchedule(input: InstallmentScheduleInput): CollectionInstallment[] {
  const now = input.now ?? new Date();

  const raw = input.items
    .map((item, idx) => {
      const dueOffsetDays = item.dueOffsetDays ?? 0;
      return {
        key: String(item.sortOrder ?? idx),
        name: item.name?.trim() || `Installment ${idx + 1}`,
        amount: resolveItemAmount(item, input.baseFee),
        dueOffsetDays,
        sortOrder: item.sortOrder ?? idx,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder || a.dueOffsetDays - b.dueOffsetDays);

  // Reconcile the installment sum to the authoritative payable. A discount
  // (feeFinal < sum) is removed from the LATEST installments first, keeping the
  // down-payment / early installments at their advertised amounts.
  const rawTotal = roundMoney(raw.reduce((s, r) => s + r.amount, 0));
  const target = input.feeFinal != null ? roundMoney(input.feeFinal) : rawTotal;
  let diffCents = toCents(target) - toCents(rawTotal);
  const adjusted = raw.map((r) => ({ ...r }));
  for (let i = adjusted.length - 1; i >= 0 && diffCents !== 0; i--) {
    const curCents = toCents(adjusted[i]!.amount);
    if (diffCents < 0) {
      const reduce = Math.min(curCents, -diffCents);
      adjusted[i]!.amount = fromCents(curCents - reduce);
      diffCents += reduce;
    } else {
      adjusted[i]!.amount = fromCents(curCents + diffCents);
      diffCents = 0;
    }
  }

  // FIFO allocation of the net-paid cashflow (oldest due date paid first).
  let remainingCents = toCents(computeNetPaid(input.payments));

  return adjusted.map((r) => {
    const amountCents = toCents(r.amount);
    const paidCents = Math.min(remainingCents, amountCents);
    remainingCents -= paidCents;

    const paid = fromCents(paidCents);
    const pending = fromCents(amountCents - paidCents);
    const dueDate = computeDueDate(input.baseDate, r.dueOffsetDays);
    const overdueDays = pending > 0 ? daysOverdueFor(dueDate, now) : 0;

    return {
      key: r.key,
      name: r.name,
      amount: r.amount,
      dueDate,
      paid,
      pending,
      daysOverdue: overdueDays,
      agingBucket: pending > 0 && overdueDays > 0 ? agingBucketFor(overdueDays) : null,
      status: (pending <= 0.004
        ? "PAID"
        : overdueDays > 0
          ? "OVERDUE"
          : "PENDING") as CollectionInstallmentStatus,
    };
  });
}

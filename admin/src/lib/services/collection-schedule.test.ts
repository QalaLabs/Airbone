import test from "node:test";
import assert from "node:assert/strict";
import {
  agingBucketFor,
  buildInstallmentSchedule,
  daysOverdueFor,
  isDueInISTMonth,
  isOverdue,
  resolveItemAmount,
} from "@/lib/services/collection-schedule";
import { endOfISTMonth, startOfISTDay, startOfISTMonth } from "@/lib/time/ist";

// Fixed "now" — 15 Nov 2026, 12:00 IST = 06:30 UTC.
const NOW = new Date("2026-11-15T06:30:00.000Z");

function baseDate(): Date {
  return new Date("2026-09-01T00:00:00.000Z");
}

const twoInstallments = [
  { name: "Down payment", amount: 50000, dueOffsetDays: 0, sortOrder: 0 },
  { name: "Balance", amount: 50000, dueOffsetDays: 30, sortOrder: 1 },
];

test("buildInstallmentSchedule: FIFO allocates payments to the earliest installments", () => {
  const s = buildInstallmentSchedule({
    items: twoInstallments,
    baseDate: baseDate(),
    baseFee: null,
    feeFinal: 100000,
    payments: [{ amount: 60000, status: "COMPLETED" }],
    now: NOW,
  });

  assert.equal(s.length, 2);
  assert.equal(s[0]!.paid, 50000);
  assert.equal(s[0]!.pending, 0);
  assert.equal(s[0]!.status, "PAID");
  assert.equal(s[1]!.paid, 10000);
  assert.equal(s[1]!.pending, 40000);
  // Due +30d from 1 Sep = 1 Oct, already past by 15 Nov → overdue.
  assert.equal(s[1]!.status, "OVERDUE");
});

test("buildInstallmentSchedule: partial payment leaves a partial first installment", () => {
  const s = buildInstallmentSchedule({
    items: twoInstallments,
    baseDate: baseDate(),
    baseFee: null,
    feeFinal: 100000,
    payments: [{ amount: 25000, status: "COMPLETED" }],
    now: NOW,
  });
  assert.equal(s[0]!.paid, 25000);
  assert.equal(s[0]!.pending, 25000);
  assert.equal(s[1]!.paid, 0);
  assert.equal(s[1]!.pending, 50000);
});

test("buildInstallmentSchedule: fully paid installments carry zero pending", () => {
  const s = buildInstallmentSchedule({
    items: twoInstallments,
    baseDate: baseDate(),
    baseFee: null,
    feeFinal: 100000,
    payments: [{ amount: 100000, status: "COMPLETED" }],
    now: NOW,
  });
  assert.ok(s.every((i) => i.pending === 0 && i.status === "PAID"));
});

test("buildInstallmentSchedule: VOIDED / FAILED / PENDING payments never count toward paid", () => {
  const payments = [
    { amount: 50000, status: "COMPLETED" },
    { amount: 50000, status: "VOIDED" },
    { amount: 50000, status: "FAILED" },
    { amount: 50000, status: "PENDING" },
  ];
  const s = buildInstallmentSchedule({
    items: twoInstallments,
    baseDate: baseDate(),
    baseFee: null,
    feeFinal: 100000,
    payments,
    now: NOW,
  });
  // Only the COMPLETED 50,000 contributes.
  assert.equal(s[0]!.paid, 50000);
  assert.equal(s[0]!.pending, 0);
  assert.equal(s[1]!.pending, 50000);
});

test("buildInstallmentSchedule: a discount reduces later installments first", () => {
  const s = buildInstallmentSchedule({
    items: twoInstallments,
    baseDate: baseDate(),
    baseFee: null,
    feeFinal: 45000,
    payments: [],
    now: NOW,
  });
  // 45,000 discount vs 100,000 raw total → last installment zeroed, remainder
  // shaves the first installment to 45,000.
  assert.equal(s[1]!.amount, 0);
  assert.equal(s[0]!.amount, 45000);
  const total = s.reduce((sum, i) => sum + i.amount, 0);
  assert.equal(Math.round(total * 100) / 100, 45000);
});

test("buildInstallmentSchedule: refunds reduce the net paid contribution", () => {
  const s = buildInstallmentSchedule({
    items: twoInstallments,
    baseDate: baseDate(),
    baseFee: null,
    feeFinal: 100000,
    payments: [{ amount: 50000, refundedAmount: 20000, status: "PARTIALLY_REFUNDED" }],
    now: NOW,
  });
  assert.equal(s[0]!.paid, 30000);
  assert.equal(s[0]!.pending, 20000);
});

test("daysOverdueFor: whole IST days since the due day", () => {
  const today = NOW; // IST 15 Nov 2026 12:00
  // IST 12 Nov 00:00 = 11 Nov 18:30 UTC → three full IST days before today.
  assert.equal(daysOverdueFor(new Date("2026-11-11T18:30:00.000Z"), today), 3);
  // Due on today's IST day is not overdue.
  assert.equal(daysOverdueFor(startOfISTDay(NOW), today), 0);
  // Due tomorrow is not overdue.
  assert.equal(daysOverdueFor(new Date("2026-11-15T18:30:00.000Z"), today), 0);
});

test("agingBucketFor: documented boundaries", () => {
  assert.equal(agingBucketFor(1), "1-7 days");
  assert.equal(agingBucketFor(7), "1-7 days");
  assert.equal(agingBucketFor(8), "8-30 days");
  assert.equal(agingBucketFor(30), "8-30 days");
  assert.equal(agingBucketFor(31), "31-60 days");
  assert.equal(agingBucketFor(60), "31-60 days");
  assert.equal(agingBucketFor(61), "60+ days");
});

test("isOverdue: due DAY strictly before today (IST)", () => {
  // IST 14 Nov 00:00 = 13 Nov 18:30 UTC → yesterday → overdue.
  assert.equal(isOverdue(new Date("2026-11-13T18:30:00.000Z"), NOW), true);
  // Due "today" (IST day) is not overdue.
  assert.equal(isOverdue(startOfISTDay(NOW), NOW), false);
  // IST 16 Nov 00:00 → tomorrow → not overdue.
  assert.equal(isOverdue(new Date("2026-11-15T18:30:00.000Z"), NOW), false);
});

test("isDueInISTMonth: IST calendar month boundaries", () => {
  // Nov 2026 IST month = 2026-10-31T18:30Z .. 2026-11-30T18:29:59.999Z
  assert.equal(isDueInISTMonth(startOfISTMonth(NOW), NOW), true);
  assert.equal(isDueInISTMonth(endOfISTMonth(NOW), NOW), true);
  assert.equal(isDueInISTMonth(new Date("2026-11-30T18:29:59.999Z"), NOW), true);
  // One millisecond into December IST.
  assert.equal(isDueInISTMonth(new Date("2026-11-30T18:30:00.000Z"), NOW), false);
  // Last millisecond of October IST.
  assert.equal(isDueInISTMonth(new Date("2026-10-31T18:29:59.999Z"), NOW), false);
});

test("resolveItemAmount: snapshot resolvedAmount wins, then percent, then fixed", () => {
  assert.equal(resolveItemAmount({ name: "a", resolvedAmount: 123.45 }, 100000), 123.45);
  assert.equal(resolveItemAmount({ name: "a", percentOfFee: 25 }, 100000), 25000);
  assert.equal(resolveItemAmount({ name: "a", amount: 7000 }, 100000), 7000);
  assert.equal(resolveItemAmount({ name: "a", amount: 0 }, null), 0);
});

test("IST month helpers agree for a known instant", () => {
  const nov1 = startOfISTMonth(NOW);
  assert.equal(nov1.toISOString(), "2026-10-31T18:30:00.000Z");
  assert.equal(endOfISTMonth(NOW).toISOString(), "2026-11-30T18:29:59.999Z");
});

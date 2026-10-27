import test from "node:test";
import assert from "node:assert/strict";
import {
  canDeletePayment,
  canDeletePaymentAs,
  canRefundPayment,
  canVoidPayment,
} from "./reversal-policy";
import { reconcileDerivedFields, computeNetPaid } from "@/lib/services/fee-calculation.service";

test("CRM-11: a completed receipt can be voided but never hard-deleted", () => {
  assert.equal(canVoidPayment("COMPLETED").allowed, true);
  const del = canDeletePayment("COMPLETED");
  assert.equal(del.allowed, false);
  assert.match(del.reason ?? "", /Void \/ Reverse/);
});

test("CRM-11: repeated void is rejected", () => {
  const decision = canVoidPayment("VOIDED");
  assert.equal(decision.allowed, false);
  assert.match(decision.reason ?? "", /already voided/i);
});

test("CRM-11: a refunded receipt cannot be voided and vice versa", () => {
  assert.equal(canVoidPayment("REFUNDED").allowed, false);
  assert.match(canVoidPayment("REFUNDED").reason ?? "", /fully refunded/i);
  assert.equal(canRefundPayment("VOIDED").allowed, false);
  assert.match(canRefundPayment("VOIDED").reason ?? "", /voided receipt/i);
});

test("CRM-11: pending and failed payments cannot be refunded but can be deleted", () => {
  for (const status of ["PENDING", "FAILED"]) {
    assert.equal(canRefundPayment(status).allowed, false);
    assert.match(canRefundPayment(status).reason ?? "", new RegExp(status));
  }
  assert.equal(canDeletePayment("PENDING").allowed, true);
  assert.equal(canDeletePayment("FAILED").allowed, true);
});

test("CRM-11: partially refunded and fully refunded receipts are financial documents", () => {
  assert.equal(canRefundPayment("PARTIALLY_REFUNDED").allowed, true);
  assert.equal(canDeletePayment("PARTIALLY_REFUNDED").allowed, false);
  assert.equal(canDeletePayment("REFUNDED").allowed, false);
  assert.equal(canRefundPayment("REFUNDED").allowed, false);
});

test("CRM-11: ledger deletion is gated to SUPER_ADMIN", () => {
  assert.equal(canDeletePaymentAs("SUPER_ADMIN").allowed, true);
  for (const role of ["ADMIN", "COUNSELOR", "FINANCE", "VIEWER"]) {
    assert.equal(canDeletePaymentAs(role).allowed, false, role);
  }
});

test("CRM-11: VOIDED receipts contribute zero to paid totals and balance", () => {
  const payments = [
    { amount: 50_000, refundedAmount: 0, status: "COMPLETED" },
    { amount: 25_000, refundedAmount: 0, status: "VOIDED" },
  ];
  assert.equal(computeNetPaid(payments.map((p) => ({ ...p }))), 50_000);
  assert.deepEqual(reconcileDerivedFields(payments.map((p) => ({ ...p })), 75_000), {
    feePaid: 50_000,
    feeBalance: 25_000,
  });
});

test("CRM-11: a refunded receipt reduces paid by the refund, never below the fee credit", () => {
  const reconciled = reconcileDerivedFields(
    [{ amount: 50_000, refundedAmount: 20_000, status: "PARTIALLY_REFUNDED" }],
    50_000,
  );
  assert.deepEqual(reconciled, { feePaid: 30_000, feeBalance: 20_000 });
});

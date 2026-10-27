/**
 * CRM-11 — canonical reversal policy for ledger receipts.
 *
 * The rules live here (not inline in the service) so they can be unit-tested
 * without a database and are applied identically by every entry point:
 *   - a completed/refunded receipt is a financial document, never hard-deleted;
 *   - VOIDED and REFUNDED are distinct end states and cannot be reversed into
 *     each other;
 *   - a repeated void is rejected rather than silently re-applied.
 */
export interface PolicyDecision {
  allowed: boolean;
  reason?: string;
}

const COMPLETED_LIKE = new Set(["COMPLETED", "PARTIALLY_REFUNDED", "REFUNDED"]);

export function canVoidPayment(status: string): PolicyDecision {
  if (status === "VOIDED") return { allowed: false, reason: "This receipt is already voided" };
  if (status === "REFUNDED") {
    return { allowed: false, reason: "This receipt is already fully refunded and cannot be voided" };
  }
  return { allowed: true };
}

export function canRefundPayment(status: string): PolicyDecision {
  if (status === "REFUNDED") return { allowed: false, reason: "This payment is already fully refunded" };
  if (status === "VOIDED") return { allowed: false, reason: "A voided receipt cannot be refunded" };
  if (status === "PENDING" || status === "FAILED") {
    return { allowed: false, reason: `Cannot refund a ${status} payment` };
  }
  return { allowed: true };
}

export function canDeletePayment(status: string): PolicyDecision {
  if (COMPLETED_LIKE.has(status)) {
    return {
      allowed: false,
      reason: "Completed receipts cannot be deleted. Use Void / Reverse to preserve the audit trail.",
    };
  }
  return { allowed: true };
}

export function canDeletePaymentAs(role: string): PolicyDecision {
  if (role === "SUPER_ADMIN") return { allowed: true };
  return { allowed: false, reason: "Deleting ledger entries requires the SUPER_ADMIN role" };
}

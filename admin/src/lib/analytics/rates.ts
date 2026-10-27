/**
 * SMS-03 — shared, clamped conversion-rate maths.
 *
 * Rates used to be computed inline and could exceed 100% (the reported 167%
 * outreach reply rate) because a single delivered message can attract several
 * inbound replies, and legacy rows counted only `SENT` while newer rows are
 * `DELIVERED`. Both helpers clamp to a sane 0–1 / 0–100 range and return null
 * when the denominator is zero, so the UI renders "—" instead of a fake 0%.
 */

export function computeReplyRate(
  sent: number,
  delivered: number,
  replies: number,
): number | null {
  const totalDelivered = Math.max(0, sent) + Math.max(0, delivered);
  if (totalDelivered === 0) return null;
  if (replies <= 0) return null;
  return Math.min(1, replies / totalDelivered);
}

export function percentRate(replied: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.min(100, Math.round((replied / total) * 100));
}

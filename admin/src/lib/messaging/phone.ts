// ─── Phone normalization for Interakt (+91) ──────────────────────────────────
//
// Interakt User/Event Track and Template Send require:
//   countryCode: "+91"
//   phoneNumber: national number WITHOUT country code or a leading 0
// Storage / matching across the admin app stays digits-only.

export interface SplitPhone {
  /** E.164-ish country prefix including plus, currently always +91. */
  countryCode: "+91";
  /** National number, no country code, no leading 0. */
  phoneNumber: string;
  /** Digits only including country code, no plus. Example: 919876543210 */
  digits: string;
}

/** Digits only — canonical storage/matching form used across the app. */
export function normalizePhone(raw: string): string {
  return raw.replace(/\D+/g, "");
}

/**
 * Split a raw Indian mobile into Interakt's countryCode + phoneNumber.
 * Returns null when the national number is not 10 digits after stripping.
 */
export function splitIndianPhone(raw: string): SplitPhone | null {
  let digits = normalizePhone(raw);
  if (!digits) return null;

  if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.slice(2);
  }
  // After stripping country code / trunk prefix, national number is 10 digits.
  if (digits.length !== 10) return null;

  return {
    countryCode: "+91",
    phoneNumber: digits,
    digits: `91${digits}`,
  };
}

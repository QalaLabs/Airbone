/** Parse API / form feesDate (YYYY-MM-DD or ISO datetime). */
export function parseFeesDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00.000Z`);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function readFeesDateFromMetadata(metadata: unknown, paidAt?: Date | null): string | null {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const raw = (metadata as Record<string, unknown>).feesDate;
    if (typeof raw === "string" && raw.trim()) return raw;
  }
  return paidAt?.toISOString() ?? null;
}

export function mergeFeesDateIntoMetadata(
  metadata: unknown,
  feesDate?: string | null,
): Record<string, unknown> {
  const base =
    metadata && typeof metadata === "object" && !Array.isArray(metadata)
      ? { ...(metadata as Record<string, unknown>) }
      : {};
  const parsed = parseFeesDate(feesDate);
  if (parsed) base.feesDate = parsed.toISOString();
  else if (feesDate === null) delete base.feesDate;
  return base;
}

export function attachFeesDateField<T extends { metadata?: unknown; paidAt?: Date | null }>(
  row: T,
): T & { feesDate: string | null } {
  return {
    ...row,
    feesDate: readFeesDateFromMetadata(row.metadata, row.paidAt),
  };
}

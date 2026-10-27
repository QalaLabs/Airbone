/**
 * CRM-07: walk a paginated API until every qualifying row is collected.
 * The admin lead list caps `limit` at 100, so the pipeline must request
 * explicit pages instead of assuming the first page is the whole dataset.
 */
export type PageFetcher<T> = (page: number, limit: number) => Promise<T[]>;

export async function collectAllPages<T>(
  fetchPage: PageFetcher<T>,
  pageSize = 100,
  maxPages = 100,
): Promise<T[]> {
  if (pageSize <= 0 || maxPages <= 0) return [];
  const collected: T[] = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const batch = await fetchPage(page, pageSize);
    if (!Array.isArray(batch) || batch.length === 0) break;
    collected.push(...batch);
    if (batch.length < pageSize) break;
  }
  return collected;
}

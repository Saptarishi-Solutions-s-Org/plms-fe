export interface FetchAllPagesOptions<TResponse, TItem> {
  fetchFirstPage: () => Promise<TResponse>;
  fetchPage: (page: number) => Promise<TResponse>;
  getItems: (response: TResponse) => TItem[];
  getTotalPages: (response: TResponse) => number;
}

export async function fetchAllPages<TResponse, TItem>({
  fetchFirstPage,
  fetchPage,
  getItems,
  getTotalPages,
}: FetchAllPagesOptions<TResponse, TItem>): Promise<TItem[]> {
  const firstResponse = await fetchFirstPage();
  const totalPages = getTotalPages(firstResponse);
  let items = getItems(firstResponse);

  if (totalPages > 1) {
    const remainingResponses = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => fetchPage(index + 2)),
    );

    items = [...items, ...remainingResponses.flatMap(getItems)];
  }

  return items;
}

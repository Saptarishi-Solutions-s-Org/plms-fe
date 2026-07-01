export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LIMIT = 25;
export const PAGE_LIMIT_OPTIONS = [25, 50, 75, 100] as const;

export type TablePaginationPlacement = "top" | "bottom";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginationProps = {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  placement?: TablePaginationPlacement;
  totalLabel?: string;
};

export function createPaginationMeta({
  page,
  limit,
  total,
}: {
  page: number;
  limit: number;
  total: number;
}): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function emptyPagination(limit = DEFAULT_PAGE_LIMIT): PaginationMeta {
  return createPaginationMeta({
    page: DEFAULT_PAGE,
    limit,
    total: 0,
  });
}

export function normalizePagination(
  pagination: PaginationMeta | undefined,
  total: number,
  fallbackLimit = DEFAULT_PAGE_LIMIT,
) {
  return (
    pagination ??
    createPaginationMeta({
      page: DEFAULT_PAGE,
      limit: fallbackLimit,
      total,
    })
  );
}

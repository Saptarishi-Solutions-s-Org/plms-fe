"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } from "@/types/pagination";

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function useUrlPagination() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const limit = parsePositiveInt(
    searchParams.get("limit"),
    DEFAULT_PAGE_LIMIT,
  );

  const replacePagination = useCallback(
    (nextPage: number, nextLimit: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      params.set("limit", String(nextLimit));

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!searchParams.get("page") || !searchParams.get("limit")) {
      replacePagination(page, limit);
    }
  }, [limit, page, replacePagination, searchParams]);

  const setPage = useCallback(
    (nextPage: number) => {
      replacePagination(nextPage, limit);
    },
    [limit, replacePagination],
  );

  const setLimit = useCallback(
    (nextLimit: number) => {
      replacePagination(DEFAULT_PAGE, nextLimit);
    },
    [replacePagination],
  );

  return {
    page,
    limit,
    setPage,
    setLimit,
  };
}

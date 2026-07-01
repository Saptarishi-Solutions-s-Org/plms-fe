"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { LeadFilters } from "@/types/leadtypes";
import { DEFAULT_PAGE } from "@/types/pagination";

function parseList(value: string | null) {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}

function setListParam(
  params: URLSearchParams,
  key: string,
  values: string[],
) {
  if (values.length) {
    params.set(key, values.join(","));
    return;
  }

  params.delete(key);
}

export function useUrlLeadFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<LeadFilters>(
    () => ({
      search: searchParams.get("search") ?? "",
      sources: parseList(searchParams.get("leadSource")),
      statuses: parseList(searchParams.get("status")),
      priorities: parseList(searchParams.get("priority")),
      assignedTo: parseList(searchParams.get("assignedTo")),
    }),
    [searchParams],
  );

  const setFilters = useCallback(
    (nextFilters: LeadFilters) => {
      const params = new URLSearchParams(searchParams.toString());
      const search = nextFilters.search.trim();

      if (search) {
        params.set("search", search);
      } else {
        params.delete("search");
      }

      setListParam(params, "status", nextFilters.statuses);
      setListParam(params, "priority", nextFilters.priorities);
      setListParam(params, "leadSource", nextFilters.sources ?? []);
      setListParam(params, "assignedTo", nextFilters.assignedTo);
      params.set("page", String(DEFAULT_PAGE));

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { filters, setFilters };
}

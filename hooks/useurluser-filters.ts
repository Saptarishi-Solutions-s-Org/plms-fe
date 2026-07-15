"use client";

import { useUrlFilters, type FilterConfig } from "./useurlfilters";

export type UserFilters = {
  status: string[];
  role: string[];
};

const userFilterConfig: FilterConfig<UserFilters> = {
  status: { type: "list", urlKey: "status" },
  role: { type: "list", urlKey: "role" },
};

export function useUrlUserFilters() {
  return useUrlFilters<UserFilters>(userFilterConfig);
}

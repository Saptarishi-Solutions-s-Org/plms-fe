"use client";

import { useUrlFilters, type FilterConfig } from "./useurlfilters";
import type { LeadFilters } from "@/types/leadtypes";

const leadFilterConfig: FilterConfig<LeadFilters> = {
  search: { type: "string", urlKey: "search" },
  sources: { type: "list", urlKey: "leadSource" },
  statuses: { type: "list", urlKey: "status" },
  priorities: { type: "list", urlKey: "priority" },
  assignedTo: { type: "list", urlKey: "assignedTo" },
};

export function useUrlLeadFilters() {
  return useUrlFilters<LeadFilters>(leadFilterConfig);
}

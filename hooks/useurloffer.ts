"use client";

import { useUrlFilters, type FilterConfig } from "./useurlfilters";
import type { OfferFilters } from "@/types/Createoffer";

const offerFilterConfig: FilterConfig<OfferFilters> = {
  search: { type: "string", urlKey: "search" },
  status: { type: "list", urlKey: "status" },
  discountType: { type: "list", urlKey: "discountType" },
  scope: { type: "list", urlKey: "scope" },
};

export function useUrlOfferFilters() {
  return useUrlFilters<OfferFilters>(offerFilterConfig);
}

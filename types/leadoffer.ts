import type { PaginationMeta } from "@/types/pagination";
import type { ExecutiveOfferItem } from "./org-manager";

export type ExecutiveOffersResponse =
  | {
      offers?: ExecutiveOfferItem[];
      value?:
        | ExecutiveOfferItem[]
        | {
            offers?: ExecutiveOfferItem[];
            value?: ExecutiveOfferItem[];
            pagination?: PaginationMeta;
          };
      pagination?: PaginationMeta;
    }
  | ExecutiveOfferItem[];

export const getOfferItems = (response: ExecutiveOffersResponse) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response.offers)) return response.offers;
  if (Array.isArray(response.value)) return response.value;
  if (response.value && typeof response.value === "object") {
    return response.value.offers ?? response.value.value ?? [];
  }

  return [];
};

export const getOfferPagination = (response: ExecutiveOffersResponse) => {
  if (Array.isArray(response)) return undefined;

  if (response.pagination) return response.pagination;
  if (response.value && !Array.isArray(response.value)) {
    return response.value.pagination;
  }

  return undefined;
};

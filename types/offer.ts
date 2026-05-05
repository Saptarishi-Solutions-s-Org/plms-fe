// types/offer.ts

// ─── Discount ──────────────────────────────────────────────────────────────────

export const DISCOUNT_TYPES = [
  "fixed",
  "percentage",
  "combo",
  "bogo",
  "conditional",
  "flag",
] as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[number];



export type OfferStatus = "active" | "inactive" | "expired";

// ─── Refs ──────────────────────────────────────────────────────────────────────

export interface OrganizationRef {
  id:   string;
  name: string;
}

// ─── API Offer (response from getOffers) ──────────────────────────────────────

export interface Offer {
  id:                        string;
  title:                     string;
  code:                      string;
  description?:              string;
  isGlobal:                  boolean;
  status:                    OfferStatus;
  discountType:              DiscountType | "";

  // fixed
  discountAmount?:           number;

  // percentage
  discountPercentage?:       number;
  maxDiscountAmount?:        number;

  // combo
  comboDescription?:         string;

  // bogo
  buyQuantity?:              number;
  getQuantity?:              number;

  // conditional
  minPurchaseAmount?:        number;
  conditionalDiscountValue?: number;

  // flag
  flagDiscountAmount?:       number;

  validFrom:                 string;
  validTo:                   string;
  createdAt:                 string;
  createdBy:                 string;
  organization?:             OrganizationRef | null;
}


export interface OfferFilters {
  search: string;
  status: "all" | OfferStatus;
}



export interface OfferSummary {
  totalCount:    number;
  activeCount:   number;
  inactiveCount: number;
  expiredCount:  number;
  globalCount:   number;
}

// ─── Form data (all strings — controlled inputs) ───────────────────────────────

export interface OfferFormData {
  offerName:                string;
  description:              string;
  discountType:             DiscountType | "";

  // fixed
  discountAmount:           string;

  // percentage
  discountPercentage:       string;
  maxDiscountAmount:        string;

  // combo
  comboDescription:         string;

  // bogo
  buyQuantity:              string;
  getQuantity:              string;

  // conditional
  minPurchaseAmount:        string;
  conditionalDiscountValue: string;

  // flag
  flagDiscountAmount:       string;

  validFrom:                string;
  validTo:                  string;
}

export type OfferFormErrors = Partial<Record<keyof OfferFormData | "dateRange", string>>;

// ─── API wrappers ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data:    T;
  message: string;
  success: boolean;
}

export interface CreateOfferResponse {
  id: string;
}

export interface ToggleOfferStatusResponse {
  status: OfferStatus;
}

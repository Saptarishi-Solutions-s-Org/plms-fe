// ─── Discount ─────────────────────────────────────────────────────────────────

export const DISCOUNT_TYPES = [
  "Fixed_Amount",
  "Percentage",
  "Combo_Offer",
  "Buy_One_Get_One_Free",
  "Conditional_Discount",
  "Flag_Discount",
] as const;

export type DiscountType = (typeof DISCOUNT_TYPES)[number] | "";

export type OfferStatus = "active" | "inactive" | "expired";

// ─── Refs ─────────────────────────────────────────────────────────────────────

export interface OfferManager {
  id: string;
  name: string;
}

export interface OrganizationRef {
  id: string;
  name: string;
}

// ─── Offer ────────────────────────────────────────────────────────────────────

export interface Offer {
  id: string;
  title: string;
  code: string;
  description: string;
  assignedUsers: string;
  isGlobal: boolean;
  status: OfferStatus;
  discountType: DiscountType;
  discountAmount?: number;
  discountPercentage?: number;
  maxDiscountAmount?: number;
  comboDescription?: string;
  buyQuantity?: number;
  getQuantity?: number;
  minPurchaseAmount?: number;
  conditionalDiscountValue?: number;
  flagDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  createdAt: string;
  createdBy: string;
  organization: OrganizationRef | null;
  managers?: OfferManager[];
}

export interface OfferFilters {
  search: string;
  status: "all" | OfferStatus;
}

export interface OfferSummary {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  expiredCount: number;
  globalCount: number;
}

// ─── API wrappers ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface CreateOfferResponse {
  id: string;
}

export interface ToggleOfferStatusResponse {
  status: OfferStatus;
}
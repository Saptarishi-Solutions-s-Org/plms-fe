import type { DateRange } from "@/components/commoncomponents/react-day-picker";

export const DISCOUNT_TYPES = [
  "Fixed_Amount",
  "Percentage",
  "Combo_Offer",
  "Buy_One_Get_One_Free",
  "Conditional_Discount",
  "Flag_Discount",
] as const;

export type DiscountType =
  (typeof DISCOUNT_TYPES)[number];

export type OfferStatus =
  | "active"
  | "inactive"
  | "expired";

export interface OfferManager {
  id: string;
  name: string;
}

export interface Offer {
  id: string;

  title: string;

  code: string;

  description: string;

  discountType: DiscountType;

  validFrom: string;

  validTo: string;

  isGlobal: boolean;

  status: OfferStatus;

  discountAmount?: number;

  discountPercentage?: number;

  maxDiscountAmount?: number;

  comboDescription?: string;

  buyQuantity?: number;

  getQuantity?: number;

  minPurchaseAmount?: number;

  conditionalDiscountValue?: number;

  flagDiscountAmount?: number;

  managers?: OfferManager[];

  assignedUsers?: string;

  createdAt?: string;

  createdBy?: string;

  organization?: {
    id: string;
    name: string;
  } | null;
}

export interface OfferFormData {
  offerName: string;

  description: string;

  discountType: DiscountType | "";

  isGlobal: boolean;

  managerIds: string[];

  dateRange: DateRange | undefined;

  discountAmount: string;

  discountPercentage: string;

  maxDiscountAmount: string;

  comboDescription: string;

  buyQuantity: string;

  getQuantity: string;

  minPurchaseAmount: string;

  conditionalDiscountValue: string;

  flagDiscountAmount: string;
}

export interface OfferPayload {
  title: string;

  description: string;

  discount_type: DiscountType;

  is_global: boolean;

  manager_ids: string[];

  valid_from: string;

  valid_to: string;

  discount_amount?: number;

  discount_percentage?: number;

  max_discount_amount?: number;

  combo_description?: string;

  buy_quantity?: number;

  get_quantity?: number;

  min_purchase_amount?: number;

  discount_value?: number;

  flag_discount_amount?: number;
}
export interface OfferFilters {
  search: string;
  status: "all" | OfferStatus;
  discountType:
    | "all"
    | DiscountType;
}

export const OFFER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "expired", label: "Expired" },
] as const;
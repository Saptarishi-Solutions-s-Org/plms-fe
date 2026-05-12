// types/offer.ts

export type OfferStatus = "active" | "inactive" | "expired"

export type DiscountType =
  | "fixed"
  | "Fixed_Amount"
  | "percentage"
  | "Percentage"
  | "combo"
  | "Combo_Offer"
  | "bogo"
  | "Buy_One_Get_One_Free"
  | "conditional"
  | "Conditional_Discount"
  | "flag"
  | "Flag_Discount"
  | ""

// ─── Manager (from /odata/v4/offer/getManagers()) ────────────────────────────

export interface OfferManager {
  id: string
  name: string
}

// ─── Core Offer type ──────────────────────────────────────────────────────────

export interface Offer {
  id: string
  title: string
  code: string
  description: string
  validFrom: string
  validTo: string
  isGlobal: boolean
  status: OfferStatus
  discountType: DiscountType
  createdAt: string
  createdBy: string
  organization: null

  // snake_case fallbacks (API response)
  valid_from?: string
  valid_to?: string
  is_global?: boolean
  discount_type?: string

  // Discount fields (camelCase)
  discountAmount?: number
  discountPercentage?: number
  maxDiscountAmount?: number
  comboDescription?: string
  buyQuantity?: number
  getQuantity?: number
  minPurchaseAmount?: number
  conditionalDiscountValue?: number
  flagDiscountAmount?: number

  // Discount fields (snake_case fallbacks)
  discount_amount?: string | number
  discount_percentage?: string | number
  max_discount_amount?: string | number
  combo_description?: string
  buy_quantity?: number
  get_quantity?: number
  min_purchase_amount?: string | number
  discount_value?: string | number
  flag_discount_amount?: string | number

  // ── Managers assigned to this offer ────────────────────────────────────────
  managers?: OfferManager[]
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface OfferFilters {
  search: string
  status: "all" | OfferStatus
}
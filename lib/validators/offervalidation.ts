import { z } from "zod";
import { format } from "date-fns";
import { DISCOUNT_TYPES, type DiscountType, type OfferManager as Manager } from "@/types/offer";
import type { DateRange } from "@/components/commoncomponents/react-day-picker";

export type { DiscountType, Manager, DateRange };
export { DISCOUNT_TYPES };

// ─── Discount options ──────────────────────────────────────────────────────

export const DISCOUNT_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: "Fixed_Amount",         label: "Fixed Amount" },
  { value: "Percentage",           label: "Percentage" },
  { value: "Combo_Offer",          label: "Combo Offer" },
  { value: "Buy_One_Get_One_Free", label: "Buy One Get One Free" },
  { value: "Conditional_Discount", label: "Conditional Discount" },
  { value: "Flag_Discount",        label: "Flag Discount" },
];

// ─── Form data ─────────────────────────────────────────────────────────────

export interface OfferFormData {
  offerName: string;
  description: string;
  discountType: DiscountType;
  isGlobal: boolean;
  managerIds: string[];
  discountAmount: string;
  discountPercentage: string;
  maxDiscountAmount: string;
  comboDescription: string;
  buyQuantity: string;
  getQuantity: string;
  minPurchaseAmount: string;
  conditionalDiscountValue: string;
  flagDiscountAmount: string;
  dateRange: DateRange | undefined;
}

export type OfferFormErrors = Partial<Record<keyof OfferFormData, string>>;

// ─── API payload ───────────────────────────────────────────────────────────

export interface OfferPayload {
  title: string;
  description: string;
  discount_type: string;
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
  conditional_discount_value?: number;
  flag_discount_amount?: number;
}

// ─── Default form values ───────────────────────────────────────────────────

export const EMPTY_FORM: OfferFormData = {
  offerName: "",
  description: "",
  discountType: "",
  isGlobal: false,
  managerIds: [],
  discountAmount: "",
  discountPercentage: "",
  maxDiscountAmount: "",
  comboDescription: "",
  buyQuantity: "",
  getQuantity: "",
  minPurchaseAmount: "",
  conditionalDiscountValue: "",
  flagDiscountAmount: "",
  dateRange: undefined,
};

// ─── Zod schema ────────────────────────────────────────────────────────────

export const offerFormSchema = z
  .object({
    offerName:                z.string().trim().min(1, "Offer name is required.").max(100),
    description:              z.string().trim().min(1, "Description is required."),
    discountType:             z.union([z.literal(""), z.enum(DISCOUNT_TYPES)]),
    isGlobal:                 z.boolean(),
    managerIds:               z.array(z.string()),
    discountAmount:           z.string(),
    discountPercentage:       z.string(),
    maxDiscountAmount:        z.string(),
    comboDescription:         z.string(),
    buyQuantity:              z.string(),
    getQuantity:              z.string(),
    minPurchaseAmount:        z.string(),
    conditionalDiscountValue: z.string(),
    flagDiscountAmount:       z.string(),
    dateRange:                z.any().optional(),
  })
  .superRefine((data, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (!data.discountType)
      issue("discountType", "Please select a discount type.");

    if (!data.isGlobal && data.managerIds.length === 0)
      issue("managerIds", "Please select at least one manager.");

    if (!data.dateRange?.from || !data.dateRange?.to)
      issue("dateRange", "Please select a valid date range.");
    else if (data.dateRange.to < data.dateRange.from)
      issue("dateRange", "End date must be after start date.");

    const positiveNum = (field: keyof OfferFormData, msg: string) => {
      const raw = String(data[field] ?? "").trim();
      if (!raw) { issue(field, msg); return; }
      const v = Number(raw);
      if (!Number.isFinite(v) || v <= 0) issue(field, "Enter a valid positive amount.");
    };

    const percent = (field: keyof OfferFormData, msg: string) => {
      const raw = String(data[field] ?? "").trim();
      if (!raw) { issue(field, msg); return; }
      const v = Number(raw);
      if (!Number.isFinite(v) || v < 1 || v > 100) issue(field, "Must be between 1 and 100.");
    };

    const positiveInt = (field: keyof OfferFormData, msg: string) => {
      const raw = String(data[field] ?? "").trim();
      if (!raw) { issue(field, msg); return; }
      if (!/^[0-9]+$/.test(raw) || Number(raw) < 1) issue(field, "Enter a valid quantity (min 1).");
    };

    const validators: Record<string, () => void> = {
      Fixed_Amount:         () => positiveNum("discountAmount", "Discount amount is required."),
      Percentage:           () => {
        percent("discountPercentage", "Discount percentage is required.");
        positiveNum("maxDiscountAmount", "Max discount amount is required.");
      },
      Combo_Offer:          () => {
        if (!String(data.comboDescription ?? "").trim())
          issue("comboDescription", "Combo description is required.");
      },
      Buy_One_Get_One_Free: () => {
        positiveInt("buyQuantity", "Buy quantity is required.");
        positiveInt("getQuantity", "Get quantity is required.");
      },
      Conditional_Discount: () => {
        positiveNum("minPurchaseAmount", "Minimum purchase amount is required.");
        positiveNum("conditionalDiscountValue", "Discount value is required.");
      },
      Flag_Discount:        () => positiveNum("flagDiscountAmount", "Discount amount is required."),
    };

    validators[data.discountType]?.();
  });

// ─── Validation helper ─────────────────────────────────────────────────────

export function validateOfferForm(data: OfferFormData): OfferFormErrors {
  const result = offerFormSchema.safeParse(data);
  if (result.success) return {};
  return result.error.issues.reduce<OfferFormErrors>((acc, issue) => {
    const key = issue.path[0] as string;
    if (key && !(key in acc)) (acc as Record<string, string>)[key] = issue.message;
    return acc;
  }, {});
}

// ─── Payload builder ───────────────────────────────────────────────────────

export function buildOfferPayload(data: OfferFormData): OfferPayload {
  const base: OfferPayload = {
    title:         data.offerName.trim(),
    description:   data.description.trim(),
    discount_type: data.discountType,
    is_global:     data.isGlobal,
    manager_ids:   data.isGlobal ? [] : data.managerIds,
    valid_from:    data.dateRange?.from ? format(data.dateRange.from, "yyyy-MM-dd") : "",
    valid_to:      data.dateRange?.to   ? format(data.dateRange.to,   "yyyy-MM-dd") : "",
  };

  const n = (f: keyof OfferFormData) => Number(data[f]);

  const map: Record<string, () => void> = {
    Fixed_Amount:         () => { base.discount_amount            = n("discountAmount"); },
    Percentage:           () => { base.discount_percentage        = n("discountPercentage");
                                  base.max_discount_amount        = n("maxDiscountAmount"); },
    Combo_Offer:          () => { base.combo_description          = data.comboDescription.trim(); },
    Buy_One_Get_One_Free: () => { base.buy_quantity               = n("buyQuantity");
                                  base.get_quantity               = n("getQuantity"); },
    Conditional_Discount: () => { base.min_purchase_amount        = n("minPurchaseAmount");
                                  base.conditional_discount_value = n("conditionalDiscountValue"); },
    Flag_Discount:        () => { base.flag_discount_amount       = n("flagDiscountAmount"); },
  };

  map[data.discountType]?.();
  return base;
}

// ─── Date helpers ──────────────────────────────────────────────────────────

export function getTodayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
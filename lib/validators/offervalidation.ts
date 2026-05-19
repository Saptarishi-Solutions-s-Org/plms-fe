import { z } from "zod";
import { format } from "date-fns";
import type { DateRange } from "@/components/commoncomponents/react-day-picker";

import {
  DISCOUNT_TYPES,
  type OfferManager,
} from "@/types/offer";

export type Manager = OfferManager;
export const DISCOUNT_OPTIONS = [
  { value: "Fixed_Amount", label: "Fixed Amount" },
  { value: "Percentage", label: "Percentage" },
  { value: "Combo_Offer", label: "Combo Offer" },
  {
    value: "Buy_One_Get_One_Free",
    label: "Buy One Get One Free",
  },
  {
    value: "Conditional_Discount",
    label: "Conditional Discount",
  },
  { value: "Flag_Discount", label: "Flag Discount" },
] as const;

export const offerFormSchema = z
  .object({
    offerName: z
      .string()
      .trim()
      .min(1, "Offer name is required")
      .max(100),

    description: z
      .string()
      .trim()
      .min(1, "Description is required"),

    discountType: z.union([
      z.literal(""),
      z.enum(DISCOUNT_TYPES),
    ]),

    isGlobal: z.boolean(),

    managerIds: z.array(z.string()),

    dateRange:
      z.custom<DateRange | undefined>(),

    discountAmount: z.string(),

    discountPercentage: z.string(),

    maxDiscountAmount: z.string(),

    comboDescription: z.string(),

    buyQuantity: z.string(),

    getQuantity: z.string(),

    minPurchaseAmount: z.string(),

    conditionalDiscountValue:
      z.string(),

    flagDiscountAmount: z.string(),
  })

  .superRefine((data, ctx) => {
     if (!data.discountType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["discountType"],
        message:
          "Please select a discount type",
      });
    }

    if (
      !data.isGlobal &&
      data.managerIds.length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["managerIds"],
        message:
          "Please select at least one manager",
      });
    }
     if (
      !data.dateRange?.from ||
      !data.dateRange?.to
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dateRange"],
        message:
          "Please select valid date range",
      });
    }

    switch (data.discountType) {
      case "Fixed_Amount":
        if (!data.discountAmount.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["discountAmount"],
            message:
              "Discount amount is required",
          });
        }
        break;

      case "Percentage":
        if (
          !data.discountPercentage.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["discountPercentage"],
            message:
              "Discount percentage is required",
          });
        }

        if (
          !data.maxDiscountAmount.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["maxDiscountAmount"],
            message:
              "Max discount amount is required",
          });
        }
        break;

      case "Combo_Offer":
        if (
          !data.comboDescription.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["comboDescription"],
            message:
              "Combo description is required",
          });
        }
        break;

      case "Buy_One_Get_One_Free":
        if (!data.buyQuantity.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["buyQuantity"],
            message:
              "Buy quantity is required",
          });
        }

        if (!data.getQuantity.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["getQuantity"],
            message:
              "Get quantity is required",
          });
        }
        break;

      case "Conditional_Discount":
        if (
          !data.minPurchaseAmount.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["minPurchaseAmount"],
            message:
              "Minimum purchase amount is required",
          });
        }

        if (
          !data.conditionalDiscountValue.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [
              "conditionalDiscountValue",
            ],
            message:
              "Discount value is required",
          });
        }
        break;

      case "Flag_Discount":
        if (
          !data.flagDiscountAmount.trim()
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["flagDiscountAmount"],
            message:
              "Flag discount amount is required",
          });
        }
        break;
    }
  });

export type OfferFormData = z.infer<
  typeof offerFormSchema
>;

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

  discount_value?: number;

  flag_discount_amount?: number;
}

export function buildOfferPayload(
  data: OfferFormData
): OfferPayload {
  const base: OfferPayload = {
    title: data.offerName.trim(),

    description:
      data.description.trim(),

    discount_type:
      data.discountType,

    is_global: data.isGlobal,

    manager_ids: data.isGlobal
      ? []
      : data.managerIds,

    valid_from: data.dateRange?.from
      ? format(
          data.dateRange.from,
          "yyyy-MM-dd"
        )
      : "",

    valid_to: data.dateRange?.to
      ? format(
          data.dateRange.to,
          "yyyy-MM-dd"
        )
      : "",
  };

  switch (data.discountType) {
    case "Fixed_Amount":
      base.discount_amount = Number(
        data.discountAmount
      );
      break;

    case "Percentage":
      base.discount_percentage =
        Number(
          data.discountPercentage
        );

      base.max_discount_amount =
        Number(
          data.maxDiscountAmount
        );
      break;

    case "Combo_Offer":
      base.combo_description =
        data.comboDescription.trim();
      break;

    case "Buy_One_Get_One_Free":
      base.buy_quantity = Number(
        data.buyQuantity
      );

      base.get_quantity = Number(
        data.getQuantity
      );
      break;

    case "Conditional_Discount":
      base.min_purchase_amount =
        Number(
          data.minPurchaseAmount
        );

      base.discount_value = Number(
        data.conditionalDiscountValue
      );
      break;

    case "Flag_Discount":
      base.flag_discount_amount =
        Number(
          data.flagDiscountAmount
        );
      break;
  }

  return base;
}
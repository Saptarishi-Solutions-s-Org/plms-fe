"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GlobeIcon, TagIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getManagers } from "@/services/offers";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DateRangeFilter } from "@/components/commoncomponents/daterange";
import type { DateRange } from "@/components/commoncomponents/react-day-picker";

import {
  offerFormSchema,
  buildOfferPayload,
  DISCOUNT_OPTIONS,
  type Manager,
  type OfferPayload,
  type OfferFormData,
} from "@/lib/validators/offervalidation";

const EMPTY_FORM: OfferFormData = {
  offerName: "",
  description: "",
  discountType: "",
  isGlobal: false,
  managerIds: [],
  dateRange: undefined,
  discountAmount: "",
  discountPercentage: "",
  maxDiscountAmount: "",
  comboDescription: "",
  buyQuantity: "",
  getQuantity: "",
  minPurchaseAmount: "",
  conditionalDiscountValue: "",
  flagDiscountAmount: "",
};

async function fetchManagers(): Promise<Manager[]> {
  try {
    const res = await getManagers();
    const rows: any[] = Array.isArray(res)
      ? res
      : Array.isArray(res?.value)
        ? res.value
        : [];
    return rows
      .map((m: any) => ({ id: String(m.id ?? ""), name: String(m.name ?? "") }))
      .filter((m) => m.id && m.name);
  } catch (error) {
    console.error("Error fetching managers:", error);
    return [];
  }
}

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required} className="text-sm font-normal text-gray-700">
        {label}
      </Label>
      <div
        className={
          error
            ? "[&_input]:border-red-500 [&_textarea]:border-red-500 [&_[role=combobox]]:border-red-500"
            : ""
        }
      >
        {children}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: OfferPayload,
  ) => Promise<{ success: boolean; error?: string }>;
}

export function CreateOfferDialog({
  open,
  onOpenChange,
  onSubmit,
}: CreateOfferDialogProps) {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const isGlobal = watch("isGlobal");
  const selectedManagerIds = watch("managerIds");
  const discountType = watch("discountType");
  const managerNameById = useMemo(
    () => new Map(managers.map((manager) => [manager.id, manager.name])),
    [managers],
  );
  const managerIdByName = useMemo(
    () => new Map(managers.map((manager) => [manager.name, manager.id])),
    [managers],
  );
  const managerOptions = useMemo(
    () => managers.map((manager) => manager.name),
    [managers],
  );

  useEffect(() => {
    if (managers.length === 0) return;

    const allManagersSelected = selectedManagerIds.length === managers.length;

    if (allManagersSelected && !isGlobal) {
      setValue("isGlobal", true);
    }
    
  }, [selectedManagerIds, managers, isGlobal, setValue]);

  // Fetch managers when dialog opens
  useEffect(() => {
    let isMounted = true;

    const loadManagers = async () => {
      if (!open) return;
      const managerList = await fetchManagers();
      if (isMounted) {
        setManagers(managerList);
      }
    };

    loadManagers();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next && isSubmitting) return;
    if (!next) {
      reset(EMPTY_FORM);
      setSubmitError("");
      setManagers([]);
    }
    onOpenChange(next);
  };

  const handleDiscountTypeChange = (
    value: string,
    onChange: (v: string) => void,
  ) => {
    onChange(value);
    setValue("discountAmount", "");
    setValue("discountPercentage", "");
    setValue("maxDiscountAmount", "");
    setValue("comboDescription", "");
    setValue("buyQuantity", "");
    setValue("getQuantity", "");
    setValue("minPurchaseAmount", "");
    setValue("conditionalDiscountValue", "");
    setValue("flagDiscountAmount", "");
  };

  const onValid = async (data: OfferFormData) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const result = await onSubmit(buildOfferPayload(data));
      if (result.success) {
        toast.success("Offer created");
        handleOpenChange(false);
      } else {
        setSubmitError(
          result.error || "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background text-foreground w-[min(52rem,calc(100%-2rem))] max-w-none gap-0 overflow-hidden rounded-2xl border p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <TagIcon className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-blue-600 leading-tight">
                Create Offer
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Fill in all required fields to create a new promotional offer
              </DialogDescription>
            </div>
          </div>
          <DialogClose
            disabled={isSubmitting}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XIcon className="size-4" />
          </DialogClose>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onValid)}
          noValidate
          className="flex flex-col"
        >
          <ScrollArea className="max-h-[75vh]">
            <div className="flex flex-col gap-5 px-6 py-5">
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              {/* Offer Scope */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-blue-600">
                  Offer Details
                </h3>
                <Controller
                  name="isGlobal"
                  control={control}
                  render={({ field }) => (
                    <div
                      className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors
                      ${field.value ? "border-blue-200 bg-blue-50/60" : "border-input bg-muted/30"}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <GlobeIcon
                          className={`size-4 ${field.value ? "text-blue-600" : "text-muted-foreground"}`}
                        />
                        <span className="text-sm font-medium">
                          {field.value
                            ? "Global — visible to all users"
                            : "Assign to specific managers"}
                        </span>
                      </div>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          setValue("managerIds", []);
                        }}
                        disabled={isSubmitting}
                        className="data-[state=checked]:bg-blue-600"
                      />
                    </div>
                  )}
                />
              </div>

              {/* Offer Details */}
              <div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldWrapper
                    label="Offer Name"
                    required
                    error={errors.offerName?.message}
                  >
                    <Input
                      placeholder="Enter offer name"
                      maxLength={100}
                      {...register("offerName")}
                    />
                  </FieldWrapper>

                  <FieldWrapper
                    label="Discount Type"
                    required
                    error={errors.discountType?.message}
                  >
                    <Controller
                      name="discountType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(v) =>
                            handleDiscountTypeChange(v, field.onChange)
                          }
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a discount type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DISCOUNT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldWrapper>

                  {!isGlobal && (
                    <FieldWrapper
                      label="Managers"
                      required
                      error={errors.managerIds?.message}
                    >
                      <Controller
                        name="managerIds"
                        control={control}
                        render={({ field }) => (
                          <div
                            onClick={(event) => event.preventDefault()}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                              }
                            }}
                          >
                            <MultiSelectCombobox
                              options={managerOptions}
                              selectedValues={
                                field.value
                                  .map((id) => managerNameById.get(id))
                                  .filter(Boolean) as string[]
                              }
                              onSelectionChange={(selectedManagers) =>
                                field.onChange(
                                  selectedManagers
                                    .map((name) => managerIdByName.get(name))
                                    .filter(Boolean),
                                )
                              }
                              placeholder="Select managers"
                              width="w-full"
                            />
                          </div>
                        )}
                      />
                    </FieldWrapper>
                  )}

                  <FieldWrapper
                    label="Valid Period"
                    required
                    error={errors.dateRange?.message}
                  >
                    <Controller
                      name="dateRange"
                      control={control}
                      render={({ field }) => (
                        <DateRangeFilter
                          value={field.value as DateRange | undefined}
                          onChange={field.onChange}
                          placeholder="Select date range"
                          className={`h-10 w-full justify-between rounded-md border bg-background px-3 font-normal
                            ${errors.dateRange ? "border-red-500" : "border-input"}`}
                        />
                      )}
                    />
                  </FieldWrapper>
                </div>
              </div>

              {/* Discount Fields */}
              {discountType && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-blue-600">
                    Discount Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {discountType === "Fixed_Amount" && (
                      <div className="sm:col-span-2">
                        <FieldWrapper
                          label="Discount Amount"
                          required
                          error={errors.discountAmount?.message}
                        >
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="₹500"
                            {...register("discountAmount")}
                          />
                        </FieldWrapper>
                      </div>
                    )}

                    {discountType === "Percentage" && (
                      <>
                        <FieldWrapper
                          label="Discount (%)"
                          required
                          error={errors.discountPercentage?.message}
                        >
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="20%"
                            {...register("discountPercentage")}
                          />
                        </FieldWrapper>
                        <FieldWrapper
                          label="Max Discount Amount"
                          required
                          error={errors.maxDiscountAmount?.message}
                        >
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="₹1000"
                            {...register("maxDiscountAmount")}
                          />
                        </FieldWrapper>
                      </>
                    )}

                    {discountType === "Combo_Offer" && (
                      <div className="sm:col-span-2">
                        <FieldWrapper
                          label="Combo Description"
                          required
                          error={errors.comboDescription?.message}
                        >
                          <Textarea
                            placeholder="Describe the Combo Offer"
                            className="min-h-[40px] field-sizing-fixed resize-y"
                            {...register("comboDescription")}
                          />
                        </FieldWrapper>
                      </div>
                    )}

                    {discountType === "Buy_One_Get_One_Free" && (
                      <>
                        <FieldWrapper
                          label="Buy Quantity"
                          required
                          error={errors.buyQuantity?.message}
                        >
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Quantity to buy: 2"
                            {...register("buyQuantity")}
                          />
                        </FieldWrapper>
                        <FieldWrapper
                          label="Get Quantity"
                          required
                          error={errors.getQuantity?.message}
                        >
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Quantity to get: 1"
                            {...register("getQuantity")}
                          />
                        </FieldWrapper>
                      </>
                    )}

                    {discountType === "Conditional_Discount" && (
                      <>
                        <FieldWrapper
                          label="Min Purchase Amount"
                          required
                          error={errors.minPurchaseAmount?.message}
                        >
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="₹2000"
                            {...register("minPurchaseAmount")}
                          />
                        </FieldWrapper>
                        <FieldWrapper
                          label="Discount Value"
                          required
                          error={errors.conditionalDiscountValue?.message}
                        >
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="₹300"
                            {...register("conditionalDiscountValue")}
                          />
                        </FieldWrapper>
                      </>
                    )}

                    {discountType === "Flag_Discount" && (
                      <div className="sm:col-span-2">
                        <FieldWrapper
                          label="Discount Amount"
                          required
                          error={errors.flagDiscountAmount?.message}
                        >
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="₹500"
                            {...register("flagDiscountAmount")}
                          />
                        </FieldWrapper>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-blue-600">
                  Additional Information
                </h3>
                <FieldWrapper
                  required
                  label="Description"
                  error={errors.description?.message}
                >
                  <Textarea
                    placeholder="Describe what this Offer includes"
                    className="field-sizing-fixed resize-y min-h-[40px]"
                    {...register("description")}
                  />
                </FieldWrapper>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="min-w-[100px]"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="size-4" />
                  Saving…
                </span>
              ) : (
                "Save Offer"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

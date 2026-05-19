"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GlobeIcon, TagIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input }      from "@/components/ui/input";
import { Label }      from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner }   from "@/components/ui/spinner";
import { Switch }    from "@/components/ui/switch";
import { Textarea }  from "@/components/ui/textarea";
import { api }       from "@/lib/api";
import { DateRangeFilter } from "@/components/commoncomponents/daterange";
import type { DateRange }  from "@/components/commoncomponents/react-day-picker";

import {
  offerFormSchema,
  buildOfferPayload,
  DISCOUNT_OPTIONS,
  type Manager,
  type OfferPayload,
  type OfferFormData,
} from "@/lib/validators/offervalidation";
const EMPTY_FORM: OfferFormData = {
  offerName:                "",
  description:              "",
  discountType:             "",
  isGlobal:                 false,
  managerIds:               [],
  dateRange:                undefined,
  discountAmount:           "",
  discountPercentage:       "",
  maxDiscountAmount:        "",
  comboDescription:         "",
  buyQuantity:              "",
  getQuantity:              "",
  minPurchaseAmount:        "",
  conditionalDiscountValue: "",
  flagDiscountAmount:       "",
};
async function fetchManagers(): Promise<Manager[]> {
  const res  = await api("/odata/v4/offer/getManagers()");
  const rows: any[] = Array.isArray(res) ? res : Array.isArray(res?.value) ? res.value : [];
  return rows
    .map((m: any) => ({ id: String(m.id ?? ""), name: String(m.name ?? "") }))
    .filter((m) => m.id && m.name);
}

function FieldWrapper({ label, required, error, children }: {
  label:     string;
  required?: boolean;
  error?:    string;
  children:  React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required} className="text-sm font-normal text-gray-700">
        {label}
      </Label>
      <div className={error ? "[&_input]:border-red-500 [&_textarea]:border-red-500 [&_[role=combobox]]:border-red-500" : ""}>
        {children}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
interface CreateOfferDialogProps {
  open:         boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit:     (data: OfferPayload) => Promise<{ success: boolean; error?: string }>;
}
export function CreateOfferDialog({ open, onOpenChange, onSubmit }: CreateOfferDialogProps) {
  const [managers,        setManagers]        = useState<Manager[]>([]);
  const [managersLoading, setManagersLoading] = useState(false);
  const [managersError,   setManagersError]   = useState("");
  const [managersFetched, setManagersFetched] = useState(false);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [submitError,     setSubmitError]     = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver:      zodResolver(offerFormSchema),
    defaultValues: EMPTY_FORM,
  });

  const isGlobal     = watch("isGlobal");
  const discountType = watch("discountType");

  useEffect(() => {
    if (!open || managersFetched) return;
    setManagersLoading(true);
    fetchManagers()
      .then((data) => { setManagers(data); setManagersFetched(true); })
      .catch(()    => setManagersError("Failed to load managers."))
      .finally(()  => setManagersLoading(false));
  }, [open, managersFetched]);

  const handleOpenChange = (next: boolean) => {
    if (!next && isSubmitting) return;
    if (!next) {
      reset(EMPTY_FORM);
      setSubmitError("");
      setManagers([]);
      setManagersFetched(false);
      setManagersError("");
    }
    onOpenChange(next);
  };

  const handleDiscountTypeChange = (value: string, onChange: (v: string) => void) => {
    onChange(value);
    setValue("discountAmount",           "");
    setValue("discountPercentage",       "");
    setValue("maxDiscountAmount",        "");
    setValue("comboDescription",         "");
    setValue("buyQuantity",              "");
    setValue("getQuantity",              "");
    setValue("minPurchaseAmount",        "");
    setValue("conditionalDiscountValue", "");
    setValue("flagDiscountAmount",       "");
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
        setSubmitError(result.error || "Something went wrong. Please try again.");
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
          <DialogClose asChild>
            <button type="button" disabled={isSubmitting}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50">
              <XIcon className="size-4" />
            </button>
          </DialogClose>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col">
          <ScrollArea className="max-h-[75vh]">
            <div className="flex flex-col gap-5 px-6 py-5">

              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              {/* Offer Scope */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-blue-600">Offer Scope</h3>
                <Controller
                  name="isGlobal"
                  control={control}
                  render={({ field }) => (
                    <div className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors
                      ${field.value ? "border-blue-200 bg-blue-50/60" : "border-input bg-muted/30"}`}>
                      <div className="flex items-center gap-2.5">
                        <GlobeIcon className={`size-4 ${field.value ? "text-blue-600" : "text-muted-foreground"}`} />
                        <span className="text-sm font-medium">
                          {field.value ? "Global — visible to all users" : "Assign to specific managers"}
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
                <h3 className="mb-3 text-sm font-semibold text-blue-600">Offer Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <FieldWrapper label="Offer Name" required error={errors.offerName?.message}>
                    <Input placeholder="Enter offer name" maxLength={100} {...register("offerName")} />
                  </FieldWrapper>

                  <FieldWrapper label="Discount Type" required error={errors.discountType?.message}>
                    <Controller
                      name="discountType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(v) => handleDiscountTypeChange(v, field.onChange)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a discount type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DISCOUNT_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FieldWrapper>

                  {!isGlobal && (
                    <FieldWrapper label="Manager" required error={errors.managerIds?.message}>
                      {managersError && (
                        <div className="mb-2 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                          <span>{managersError}</span>
                          <button type="button" className="ml-2 font-medium underline underline-offset-2"
                            onClick={() => { setManagersFetched(false); setManagersError(""); }}>
                            Retry
                          </button>
                        </div>
                      )}
                      <Controller
                        name="managerIds"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value[0] ?? ""}
                            onValueChange={(v) => field.onChange([v])}
                            disabled={isSubmitting || managersLoading}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder={"Select a manager"} />
                            </SelectTrigger>
                            <SelectContent>
                              {managers.map((m) => (
                                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </FieldWrapper>
                  )}

                  <FieldWrapper label="Valid Period" required error={errors.dateRange?.message}>
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
                  <h3 className="mb-3 text-sm font-semibold text-blue-600">Discount Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    {discountType === "Fixed_Amount" && (
                      <FieldWrapper label="Discount Amount" required error={errors.discountAmount?.message}>
                        <Input type="number" min="0" step="0.01" placeholder="e.g. 500" {...register("discountAmount")} />
                      </FieldWrapper>
                    )}

                    {discountType === "Percentage" && (<>
                      <FieldWrapper label="Discount (%)" required error={errors.discountPercentage?.message}>
                        <Input type="number" min="0" max="100" step="0.01" placeholder="e.g. 20" {...register("discountPercentage")} />
                      </FieldWrapper>
                      <FieldWrapper label="Max Discount Amount" required error={errors.maxDiscountAmount?.message}>
                        <Input type="number" min="0" step="0.01" placeholder="e.g. 1000" {...register("maxDiscountAmount")} />
                      </FieldWrapper>
                    </>)}

                    {discountType === "Combo_Offer" && (
                      <FieldWrapper label="Combo Description" required error={errors.comboDescription?.message}>
                        <Textarea placeholder="Describe the combo offer…" className="min-h-[90px] resize-none" {...register("comboDescription")} />
                      </FieldWrapper>
                    )}

                    {discountType === "Buy_One_Get_One_Free" && (<>
                      <FieldWrapper label="Buy Quantity" required error={errors.buyQuantity?.message}>
                        <Input type="number" min="1" step="1" placeholder="e.g. 2" {...register("buyQuantity")} />
                      </FieldWrapper>
                      <FieldWrapper label="Get Quantity" required error={errors.getQuantity?.message}>
                        <Input type="number" min="1" step="1" placeholder="e.g. 1" {...register("getQuantity")} />
                      </FieldWrapper>
                    </>)}

                    {discountType === "Conditional_Discount" && (<>
                      <FieldWrapper label="Min Purchase Amount" required error={errors.minPurchaseAmount?.message}>
                        <Input type="number" min="0" step="0.01" placeholder="e.g. 2000" {...register("minPurchaseAmount")} />
                      </FieldWrapper>
                      <FieldWrapper label="Discount Value" required error={errors.conditionalDiscountValue?.message}>
                        <Input type="number" min="0" step="0.01" placeholder="e.g. 300" {...register("conditionalDiscountValue")} />
                      </FieldWrapper>
                    </>)}

                    {discountType === "Flag_Discount" && (
                      <FieldWrapper label="Discount Amount" required error={errors.flagDiscountAmount?.message}>
                        <Input type="number" min="0" step="0.01" placeholder="e.g. 150" {...register("flagDiscountAmount")} />
                      </FieldWrapper>
                    )}

                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-blue-600">Additional Information</h3>
                <FieldWrapper label="Description" required error={errors.description?.message}>
                  <Textarea placeholder="Describe what this offer includes…" className="min-h-[80px] resize-none" {...register("description")} />
                </FieldWrapper>
              </div>

            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t bg-background px-6 py-4">
            <Button type="button" variant="outline" disabled={isSubmitting} className="min-w-[100px]"
              onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting
                ? <span className="flex items-center gap-2"><Spinner className="size-4" />Saving…</span>
                : "Save Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
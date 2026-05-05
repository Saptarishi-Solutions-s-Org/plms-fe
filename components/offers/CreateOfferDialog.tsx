"use client";

import * as React from "react";
import { XIcon, TagIcon, GlobeIcon, ChevronDownIcon, CheckIcon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { api } from "@/lib/api";

// All imports from utils (Manager and DISCOUNT_OPTIONS are included)
import {
  type OfferFormData,
  type OfferFormErrors,
  type OfferPayload,
  type DiscountType,
  type Manager,
  EMPTY_FORM,
  validateOfferForm,
  buildOfferPayload,
  getTodayIso,
  DISCOUNT_OPTIONS,
} from "@/lib/offer-utils";

// ─── API call ──────────────────────────────────────────────────────────────

async function fetchManagersFromApi(): Promise<Manager[]> {
  try {
    const res = await api(`/odata/v4/offer/getManagers()`);
    const rows: any[] = Array.isArray(res) ? res : Array.isArray(res?.value) ? res.value : [];
    return rows.map((m: any) => ({ id: String(m.id ?? ""), name: String(m.name ?? "") })).filter((m) => m.id && m.name);
  } catch (err) {
    console.error("fetchManagersFromApi error:", err);
    throw err;
  }
}

// ─── Field wrapper ─────────────────────────────────────────────────────────

function Field({ label, required, error, htmlFor, children }: {
  label: string; required?: boolean; error?: string; htmlFor?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Multi-select Manager Dropdown (clean blue theme, no gray) ─────────────

function MultiManagerSelect({ managers, loading, value, error, disabled, onChange }: {
  managers: Manager[]; loading: boolean; value: string[]; error?: string;
  disabled: boolean; onChange: (ids: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const selected = managers.filter((m) => value.includes(m.id));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between h-10 rounded-md border bg-background px-3 text-sm
          ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50 transition-colors
          ${error ? "border-red-500" : "border-input hover:border-blue-400"}`}
      >
        {loading
          ? <span className="flex items-center gap-2 text-muted-foreground"><Spinner className="size-3.5" /> Loading…</span>
          : <span className={value.length ? "text-foreground font-medium" : "text-muted-foreground"}>
              {value.length ? `${value.length} manager${value.length > 1 ? "s" : ""} selected` : "Select managers"}
            </span>}
        <ChevronDownIcon className={`size-4 text-muted-foreground ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !loading && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg overflow-hidden">
          <ScrollArea className="max-h-44">
            {managers.length === 0
              ? <div className="px-4 py-3 text-sm text-muted-foreground">No managers found</div>
              : managers.map((m) => {
                  const sel = value.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggle(m.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors
                        ${sel
                          ? "bg-blue-100 text-blue-700 font-medium hover:bg-blue-200"
                          : "text-foreground hover:bg-blue-50"}`}
                    >
                      {m.name}
                      {sel && <CheckIcon className="size-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
          </ScrollArea>
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selected.map((m) => (
            <span key={m.id} className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-700 text-xs px-2.5 py-1 font-medium">
              {m.name}
              <button type="button" disabled={disabled} onClick={() => toggle(m.id)} className="hover:text-blue-900 disabled:opacity-50 ml-0.5">
                <XCircleIcon className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Discount Fields ───────────────────────────────────────────────────────

function DiscountFields({ data, errors, disabled, update, clearError }: {
  data: OfferFormData; errors: OfferFormErrors; disabled: boolean;
  update: (f: keyof OfferFormData, v: string) => void;
  clearError: (...f: (keyof OfferFormData | "dateRange")[]) => void;
}) {
  const errCls = (hasError: boolean) => hasError ? "border-red-500 focus-visible:ring-red-500" : "";
  const numInput = (field: keyof OfferFormData, placeholder: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <Input
      id={field} placeholder={placeholder} type="number" min="0" step="0.01"
      value={data[field] as string} disabled={disabled}
      className={`h-10 ${errCls(!!(errors as Record<string, string>)[field])}`}
      onChange={(e) => { update(field, e.target.value); clearError(field); }}
      {...extra}
    />
  );

  const intInput = (field: keyof OfferFormData, placeholder: string) => (
    <Input
      id={field} placeholder={placeholder} type="number" min="1" step="1"
      value={data[field] as string} disabled={disabled}
      className={`h-10 ${errCls(!!(errors as Record<string, string>)[field])}`}
      onChange={(e) => { update(field, e.target.value); clearError(field); }}
    />
  );

  const fieldError = (f: keyof OfferFormData) => (errors as Record<string, string>)[f];

  switch (data.discountType) {
    case "Fixed_Amount":
      return (
        <Field label="Discount Amount" required error={fieldError("discountAmount")} htmlFor="discountAmount">
          {numInput("discountAmount", "e.g. 500")}
        </Field>
      );
    case "Percentage":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Discount (%)" required error={fieldError("discountPercentage")} htmlFor="discountPercentage">
            {numInput("discountPercentage", "e.g. 20", { max: "100" })}
          </Field>
          <Field label="Max Discount Amount" required error={fieldError("maxDiscountAmount")} htmlFor="maxDiscountAmount">
            {numInput("maxDiscountAmount", "e.g. 1000")}
          </Field>
        </div>
      );
    case "Combo_Offer":
      return (
        <Field label="Combo Description" required error={fieldError("comboDescription")} htmlFor="comboDescription">
          <Textarea id="comboDescription" placeholder="Describe the combo offer…" value={data.comboDescription} disabled={disabled}
            className={`min-h-[90px] resize-none ${errCls(!!fieldError("comboDescription"))}`}
            onChange={(e) => { update("comboDescription", e.target.value); clearError("comboDescription"); }} />
        </Field>
      );
    case "Buy_One_Get_One_Free":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Buy Quantity" required error={fieldError("buyQuantity")} htmlFor="buyQuantity">
            {intInput("buyQuantity", "e.g. 2")}
          </Field>
          <Field label="Get Quantity" required error={fieldError("getQuantity")} htmlFor="getQuantity">
            {intInput("getQuantity", "e.g. 1")}
          </Field>
        </div>
      );
    case "Conditional_Discount":
      return (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Min Purchase Amount" required error={fieldError("minPurchaseAmount")} htmlFor="minPurchaseAmount">
            {numInput("minPurchaseAmount", "e.g. 2000")}
          </Field>
          <Field label="Discount Value" required error={fieldError("conditionalDiscountValue")} htmlFor="conditionalDiscountValue">
            {numInput("conditionalDiscountValue", "e.g. 300")}
          </Field>
        </div>
      );
    case "Flag_Discount":
      return (
        <Field label="Discount Amount" required error={fieldError("flagDiscountAmount")} htmlFor="flagDiscountAmount">
          {numInput("flagDiscountAmount", "e.g. 150")}
        </Field>
      );
    default:
      return null;
  }
}

// ─── Main Dialog ───────────────────────────────────────────────────────────

interface CreateOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: OfferPayload) => Promise<{ success: boolean; error?: string }>;
  isSubmitting?: boolean;
}

export function CreateOfferDialog({
  open, onOpenChange, onSubmit: onSubmitProp, isSubmitting: externalIsSubmitting = false,
}: CreateOfferDialogProps) {
  const [formData, setFormData]               = React.useState<OfferFormData>(EMPTY_FORM);
  const [errors, setErrors]                   = React.useState<OfferFormErrors>({});
  const [submitError, setSubmitError]         = React.useState("");
  const [isSubmitting, setIsSubmitting]       = React.useState(false);
  const [managers, setManagers]               = React.useState<Manager[]>([]);
  const [managersLoading, setManagersLoading] = React.useState(false);
  const [managersFetched, setManagersFetched] = React.useState(false);
  const [managersError, setManagersError]     = React.useState("");

  const busy = isSubmitting || externalIsSubmitting;

  // Fetch managers
  React.useEffect(() => {
    if (!open || managersFetched) return;
    setManagersLoading(true);
    fetchManagersFromApi()
      .then((data) => { setManagers(data); setManagersFetched(true); })
      .catch(() => { setManagers([]); setManagersError("Failed to load managers."); })
      .finally(() => setManagersLoading(false));
  }, [open, managersFetched]);

  const update = React.useCallback((field: keyof OfferFormData, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value })), []);

  const clearError = React.useCallback((...fields: (keyof OfferFormData | "dateRange")[]) =>
    setErrors((prev) => {
      const next = { ...prev };
      fields.forEach((f) => delete (next as Record<string, string>)[f]);
      return next;
    }), []);

  const resetAll = React.useCallback(() => {
    setFormData(EMPTY_FORM);
    setErrors({});
    setSubmitError("");
    setManagersFetched(false);
    setManagers([]);
    setManagersError("");
  }, []);

  const handleOpenChange = (next: boolean) => {
    if (!next && busy) return;
    if (!next) resetAll();
    onOpenChange(next);
  };

  const handleGlobalToggle = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isGlobal: checked, managerIds: [] }));
    clearError("managerIds");
  };

  const handleDiscountTypeChange = (value: string) => {
    // Reset discount-specific fields
    const resetFields: Partial<OfferFormData> = {
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
    setFormData((prev) => ({ ...prev, discountType: value as DiscountType, ...resetFields }));
    clearError("discountType", ...Object.keys(resetFields) as (keyof OfferFormData)[]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setSubmitError("");
    const nextErrors = validateOfferForm(formData);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setIsSubmitting(true);
    try {
      const result = await onSubmitProp(buildOfferPayload(formData));
      if (result.success) {
        toast.success("Offer created", { description: "The offer was saved successfully." });
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
              <DialogTitle className="text-lg font-semibold text-blue-600 leading-tight">Create Offer</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Fill in all required fields to create a new promotional offer
              </DialogDescription>
            </div>
          </div>
          <DialogClose asChild>
            <button type="button" disabled={busy}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50">
              <XIcon className="size-4" />
            </button>
          </DialogClose>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          <ScrollArea className="max-h-[75vh]">
            <div className="px-6 py-5 space-y-4">

              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              {/* 1. Offer Scope */}
              <Field label="Offer Scope" required htmlFor="isGlobal">
                <div className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors
                  ${formData.isGlobal ? "border-blue-200 bg-blue-50/60" : "border-input bg-muted/30"}`}>
                  <div className="flex items-center gap-2.5">
                    <GlobeIcon className={`size-4 ${formData.isGlobal ? "text-blue-600" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">
                      {formData.isGlobal ? "Global — visible to all users" : "Assign to specific managers"}
                    </span>
                  </div>
                  <Switch id="isGlobal" checked={formData.isGlobal} onCheckedChange={handleGlobalToggle}
                    disabled={busy} className="data-[state=checked]:bg-blue-600" />
                </div>
              </Field>

              {/* 2. Managers (only when not global) */}
              {!formData.isGlobal && (
                <Field label="Managers" required error={errors.managerIds}>
                  {managersError && (
                    <div className="mb-2 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      <span>{managersError}</span>
                      <button type="button" className="ml-2 font-medium underline underline-offset-2"
                        onClick={() => { setManagersFetched(false); setManagersError(""); }}>
                        Retry
                      </button>
                    </div>
                  )}
                  <MultiManagerSelect
                    managers={managers} loading={managersLoading}
                    value={formData.managerIds} error={errors.managerIds}
                    disabled={busy}
                    onChange={(ids) => { setFormData((prev) => ({ ...prev, managerIds: ids })); clearError("managerIds"); }}
                  />
                </Field>
              )}

              {/* 3. Offer Name */}
              <Field label="Offer Name" required error={errors.offerName} htmlFor="offerName">
                <Input id="offerName" placeholder="Enter offer name" value={formData.offerName}
                  disabled={busy} maxLength={100}
                  className={`h-10 ${errors.offerName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  onChange={(e) => { update("offerName", e.target.value); clearError("offerName"); }} />
              </Field>

              {/* 4. Description */}
              <Field label="Description" required error={errors.description} htmlFor="description">
                <Textarea id="description" placeholder="Describe what this offer includes…"
                  value={formData.description} disabled={busy}
                  className={`min-h-[80px] resize-none ${errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  onChange={(e) => { update("description", e.target.value); clearError("description"); }} />
              </Field>

              {/* 5. Discount Type */}
              <Field label="Discount Type" required error={errors.discountType} htmlFor="discountType">
                <Select value={formData.discountType} onValueChange={handleDiscountTypeChange} disabled={busy}>
                  <SelectTrigger className={`w-full h-10 ${errors.discountType ? "border-red-500 focus-visible:ring-red-500" : ""}`}>
                    <SelectValue placeholder="Select a discount type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* 6. Dynamic discount fields */}
              {formData.discountType && (
                <DiscountFields
                  data={formData} errors={errors} disabled={busy}
                  update={update} clearError={clearError}
                />
              )}

              {/* 7. Valid From / Valid To */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Valid From" required error={errors.validFrom} htmlFor="validFrom">
                  <Input id="validFrom" type="date" min={getTodayIso()} value={formData.validFrom} disabled={busy}
                    className={`h-10 ${errors.validFrom ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    onChange={(e) => { update("validFrom", e.target.value); clearError("validFrom", "dateRange"); }} />
                </Field>
                <Field label="Valid To" required error={errors.validTo || errors.dateRange} htmlFor="validTo">
                  <Input id="validTo" type="date" min={formData.validFrom || getTodayIso()} value={formData.validTo} disabled={busy}
                    className={`h-10 ${errors.validTo || errors.dateRange ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    onChange={(e) => { update("validTo", e.target.value); clearError("validTo", "dateRange"); }} />
                </Field>
              </div>

            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t bg-background px-6 py-4">
            <Button type="button" variant="outline" disabled={busy} className="h-9 px-5"
              onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
              {busy ? <span className="flex items-center gap-2"><Spinner className="size-4" />Saving…</span> : "Save Offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
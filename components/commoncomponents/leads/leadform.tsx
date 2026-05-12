"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  LeadFormData,
  GENDER_OPTIONS,
  LEAD_STATUS_OPTIONS,
  LEAD_PRIORITY_OPTIONS,
  LEAD_SOURCE_OPTIONS,
} from "@/types/leadtypes";

import { leadFormSchema } from "@/lib/validators/lead-form-schema";
import { getExecutiveUsers, getCountries, getStatesByCountry } from "@/services/leads";
import { Option } from "@/types/leadtypes";

const PRIORITY_ACTIVE_CLASS: Record<string, string> = {
  Low:    "bg-red-100 border-gray-300 text-gray-700",
  Medium: "bg-red-200 border-amber-400 text-white",
  High:   "bg-red-300 border-orange-400 text-white",
  Urgent: "bg-red-500 border-red-500 text-white",
};

const emptyForm: LeadFormData = {
  name: "", gender: "", email: "", phone: "",
  city: "", stateId: "", countryId: "", postalCode: "",
  status: "", leadSource: "", assignedTo: "", priority: "", notes: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 text-sm font-semibold text-blue-600">{children}</h3>;
}

function FieldWrapper({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label required={required} className="text-sm font-normal text-gray-700">
        {label}
      </Label>
      <div className={error ? "[&_input]:border-red-500 [&_[role=combobox]]:border-red-500" : ""}>
        {children}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LeadForm({
  onSubmit,
  onCancel,
  initialData,
}: {
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: LeadFormData;
}) {
  const isEditing = Boolean(initialData);

  // ── State ───────────────────────────────────────────────────────────────

  const [executives, setExecutives] = useState<Option[]>([]);
  const [countries,  setCountries]  = useState<Option[]>([]);
  const [states,     setStates]     = useState<Option[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Form ────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema) as any,
    defaultValues: initialData ?? emptyForm,
  });

  const watchedCountryId = watch("countryId");

  // ────────────────────────────────────────────────────────────────────────
  // 1. Fetch countries + executives ONCE on mount
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [countryList, executiveList] = await Promise.all([
          getCountries(),
          getExecutiveUsers(),
        ]);
        if (cancelled) return;
        setCountries(countryList);
        setExecutives(executiveList);
      } catch (err) {
        console.error(err);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // ────────────────────────────────────────────────────────────────────────
  // 2. Whenever initialData changes (create → edit or edit → edit),
  //    reset the whole form AND explicitly re-set assignedTo so the
  //    Select can match it against the already-loaded executives list.
  //
  //    This is the KEY fix: reset() alone updates RHF internal state,
  //    but the <Select> controlled value only re-renders when setValue
  //    is called AFTER the options (<SelectItem>) are in the DOM.
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Full form reset with latest data
    reset(initialData ?? emptyForm);

    // Re-drive assignedTo explicitly so the Select widget reflects it.
    // Works whether executives loaded before or after this effect runs,
    // because setValue always updates the Controller's rendered value.
    if (initialData?.assignedTo) {
      setValue("assignedTo", initialData.assignedTo, { shouldDirty: false, shouldValidate: false });
    }
  }, [initialData, reset, setValue]);

  // ────────────────────────────────────────────────────────────────────────
  // 3. Fetch states when country changes
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!watchedCountryId) { setStates([]); return; }
    getStatesByCountry(watchedCountryId).then(setStates).catch(console.error);
  }, [watchedCountryId]);

  // ────────────────────────────────────────────────────────────────────────
  // 4. Submit
  // ────────────────────────────────────────────────────────────────────────

  const onValid = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5 py-2">

      {/* ── Personal Information ─────────────────────────────────────── */}
      <div>
        <SectionLabel>Personal Information</SectionLabel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <FieldWrapper label="Name" required error={errors.name?.message}>
            <Input placeholder="e.g. John Doe" {...register("name")} />
          </FieldWrapper>

          <FieldWrapper label="Gender" required error={errors.gender?.message}>
            <Controller name="gender" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </FieldWrapper>

          <FieldWrapper label="Email" required error={errors.email?.message}>
            <Input type="email" placeholder="john.doe@example.com" {...register("email")} />
          </FieldWrapper>

          <FieldWrapper label="Phone Number" required error={errors.phone?.message}>
            <Input placeholder="+91 99999 99999" {...register("phone")} />
          </FieldWrapper>

          <FieldWrapper label="City" required error={errors.city?.message}>
            <Input placeholder="Hyderabad" {...register("city")} />
          </FieldWrapper>

          <FieldWrapper label="Country" required error={errors.countryId?.message}>
            <Controller name="countryId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={(val) => { field.onChange(val); setValue("stateId", ""); setStates([]); }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </FieldWrapper>

          <FieldWrapper label="State" required error={errors.stateId?.message}>
            <Controller name="stateId" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={!watchedCountryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={watchedCountryId ? "Select state" : "Select country first"} />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </FieldWrapper>

          <FieldWrapper label="Postal Code" required error={errors.postalCode?.message}>
            <Input placeholder="500001" {...register("postalCode")} />
          </FieldWrapper>

        </div>
      </div>

      {/* ── Lead Classification ──────────────────────────────────────── */}
      <div>
        <SectionLabel>Lead Classification</SectionLabel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          <FieldWrapper label="Lead Source" required error={errors.leadSource?.message}>
            <Controller name="leadSource" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </FieldWrapper>

          <FieldWrapper label="Status" required error={errors.status?.message}>
            <Controller name="status" control={control} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {LEAD_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
          </FieldWrapper>

          {/* ── Assigned To ─────────────────────────────────────────────
              Uses Controller so setValue() always triggers a re-render
              of the Select and shows the matched executive name.
          ─────────────────────────────────────────────────────────── */}
          <FieldWrapper label="Assigned To" required error={errors.assignedTo?.message}>
            <Controller name="assignedTo" control={control} render={({ field }) => (
              <Select value={field.value || ""} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select executive" /></SelectTrigger>
                <SelectContent className="z-[9999] bg-white shadow-lg">
                  {executives.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">No executives found</div>
                  ) : (
                    executives.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )} />
          </FieldWrapper>

          {/* Priority */}
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label required className="text-sm font-normal text-gray-700">Priority</Label>
            <Controller name="priority" control={control} render={({ field }) => (
              <div className="flex flex-wrap gap-2">
                {LEAD_PRIORITY_OPTIONS.map(({ value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={`rounded-md border px-4 py-1.5 text-xs font-semibold transition-all ${
                      field.value === value
                        ? PRIORITY_ACTIVE_CLASS[value]
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )} />
            {errors.priority && <p className="text-xs text-red-500">{errors.priority.message}</p>}
          </div>

        </div>
      </div>

      {/* ── Additional Information ───────────────────────────────────── */}
      <div>
        <SectionLabel>Additional Information</SectionLabel>
        <FieldWrapper label="Notes" error={errors.notes?.message}>
          <Textarea
            placeholder="Add detailed notes or requirements for this lead..."
            className="min-h-[100px] resize-none"
            {...register("notes")}
          />
        </FieldWrapper>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="min-w-[100px]">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[140px] bg-blue-600 text-white hover:bg-blue-700"
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Lead" : "Save Lead"}
        </Button>
      </div>

    </form>
  );
}
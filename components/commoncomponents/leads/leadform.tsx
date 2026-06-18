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
  Option,
} from "@/types/leadtypes";

import { leadFormSchema } from "@/lib/validators/lead-form-schema";
import { getCountries, getStatesByCountry } from "@/services/location";

function normalizeOptionValue(value: string) {
  return value.trim().toLowerCase().replace(/[\s_]+/g, "");
}

function getLeadSourceValue(source?: string) {
  if (!source) return "";

  return (
    LEAD_SOURCE_OPTIONS.find(
      (option) =>
        normalizeOptionValue(option.value) === normalizeOptionValue(source),
    )?.value ?? source
  );
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

  const [countries, setCountries] = useState<Option[]>([]);
  const [states, setStates] = useState<Option[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      gender: initialData?.gender ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      city: initialData?.city ?? "",
      state: initialData?.state ?? "",
      country: initialData?.country ?? "",
      postalCode: initialData?.postalCode ?? "",
      status: initialData?.status ?? "",
      leadSource: getLeadSourceValue(initialData?.leadSource),
      priority: initialData?.priority ?? "",
      notes: initialData?.notes ?? "",
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const countryList = await getCountries();
        setCountries(countryList);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      gender: initialData?.gender ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      city: initialData?.city ?? "",
      state: initialData?.state ?? "",
      country: initialData?.country ?? "",
      postalCode: initialData?.postalCode ?? "",
      status: initialData?.status ?? "",
      leadSource: getLeadSourceValue(initialData?.leadSource),
      priority: initialData?.priority ?? "",
      notes: initialData?.notes ?? "",
    });
  }, [initialData, reset]);

  useEffect(() => {
    const loadInitialStates = async () => {
      if (!initialData?.country) {
        setStates([]);
        return;
      }

      try {
        const stateList = await getStatesByCountry(initialData.country);
        setStates(stateList);
      } catch (err) {
        console.error(err);
      }
    };

    loadInitialStates();
  }, [initialData?.country]);

  const handleCountryChange = async (countryId: string) => {
    setValue("country", countryId);
    setValue("state", "");
    setStates([]);

    try {
      const stateList = await getStatesByCountry(countryId);
      setStates(stateList);
    } catch (err) {
      console.error(err);
    }
  };

  const onValid = async (data: LeadFormData) => {
    setIsSubmitting(true);

    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5 py-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-blue-600">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper label="Name" required error={errors.name?.message}>
            <Input placeholder="Enter the Name" {...register("name")} />
          </FieldWrapper>

          <FieldWrapper label="Gender" required error={errors.gender?.message}>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="Email" required error={errors.email?.message}>
            <Input
              type="email"
              placeholder="Enter The Mail"
              {...register("email")}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Phone Number"
            required
            error={errors.phone?.message}
          >
            <Input
              placeholder="Enter the Phone Number"
              {...register("phone")}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Country"
            required
            error={errors.country?.message}
          >
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={handleCountryChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="State" required error={errors.state?.message}>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={states.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="City" required error={errors.city?.message}>
            <Input placeholder="Enter the City" {...register("city")} />
          </FieldWrapper>

          <FieldWrapper
            label="Postal Code"
            required
            error={errors.postalCode?.message}
          >
            <Input
              placeholder="Enter the Postal Code"
              {...register("postalCode")}
            />
          </FieldWrapper>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-blue-600">
          Lead Classification
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldWrapper
            label="Lead Source"
            required
            error={errors.leadSource?.message}
          >
            <Controller
              name="leadSource"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="Status" required error={errors.status?.message}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldWrapper>

          <FieldWrapper label="Priority" required error={errors.priority?.message}>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldWrapper>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-blue-600">
          Additional Information
        </h3>

        <FieldWrapper required label="Notes" error={errors.notes?.message}>
          <Textarea
            placeholder="Enter the Notes"
            className="field-sizing-fixed resize-y"
            {...register("notes")}
          />
        </FieldWrapper>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="min-w-[100px]"
          >
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

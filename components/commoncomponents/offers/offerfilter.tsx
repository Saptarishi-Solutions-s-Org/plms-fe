"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";
import { DISCOUNT_OPTIONS } from "@/lib/validators/offervalidation";
import type { OfferFilters } from "@/types/Createoffer";
import { OFFER_STATUS_OPTIONS } from "@/types/Createoffer";

const DISCOUNT_TYPE_LABEL_BY_VALUE = Object.fromEntries(
  DISCOUNT_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

const DISCOUNT_TYPE_VALUE_BY_LABEL = Object.fromEntries(
  DISCOUNT_OPTIONS.map((option) => [option.label, option.value]),
) as Record<string, string>;

const OFFER_STATUS_LABEL_BY_VALUE = Object.fromEntries(
  OFFER_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

const OFFER_STATUS_VALUE_BY_LABEL = Object.fromEntries(
  OFFER_STATUS_OPTIONS.map((option) => [option.label, option.value]),
) as Record<string, string>;

interface OfferFiltersProps {
  filters: OfferFilters;
  onFilterChange: <K extends keyof OfferFilters>(key: K, value: OfferFilters[K]) => void;
  onApply: () => void;
  onClear: () => void;
}

export function OfferFilters({ filters, onFilterChange, onApply, onClear }: OfferFiltersProps) {
  const discountTypeOptions = DISCOUNT_OPTIONS.map((option) => option.label);
  const statusOptions = OFFER_STATUS_OPTIONS.map((option) => option.label);

  const selectedDiscountTypeLabels = filters.discountType.map(
    (value) => DISCOUNT_TYPE_LABEL_BY_VALUE[value] ?? value,
  );
  const selectedStatusLabels = filters.status.map(
    (value) => OFFER_STATUS_LABEL_BY_VALUE[value] ?? value,
  );

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:flex-1 sm:flex-wrap sm:items-center sm:justify-end gap-4">
        <div className="relative w-full sm:w-72">
          <Input
            search
            type="text"
            placeholder="Search by Offer Name..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onApply()}
            className="text-sm rounded-lg h-auto py-2 px-3"
          />
        </div>

        <MultiSelectCombobox
          options={discountTypeOptions}
          selectedValues={selectedDiscountTypeLabels}
          onSelectionChange={(selected) =>
            onFilterChange(
              "discountType",
              selected
                .map((label) => DISCOUNT_TYPE_VALUE_BY_LABEL[label])
                .filter(Boolean) as OfferFilters["discountType"],
            )
          }
          placeholder="Filter by offer type"
          width="w-full sm:w-56"
        />

        <MultiSelectCombobox
          options={statusOptions}
          selectedValues={selectedStatusLabels}
          onSelectionChange={(selected) =>
            onFilterChange(
              "status",
              selected
                .map((label) => OFFER_STATUS_VALUE_BY_LABEL[label])
                .filter(Boolean) as OfferFilters["status"],
            )
          }
          placeholder="Filter by status"
          width="w-full sm:w-44"
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>

          <Button onClick={onApply} className="bg-blue-600 text-white hover:bg-blue-700">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
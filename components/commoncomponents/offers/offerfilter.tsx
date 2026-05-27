"use client";

import { Search } from "lucide-react";
import { Button } from "@base-ui/react";
import { Input } from "@base-ui/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISCOUNT_OPTIONS } from "@/lib/validators/offervalidation";
import type { OfferFilters } from "@/types/Createoffer";
import { OFFER_STATUS_OPTIONS } from "@/types/Createoffer";

interface OfferFiltersProps {
  filters: OfferFilters;
  onFilterChange: <K extends keyof OfferFilters>(key: K, value: OfferFilters[K]) => void;
  onApply: () => void;
  onClear: () => void;
}

export function OfferFilters({ filters, onFilterChange, onApply, onClear }: OfferFiltersProps) {
  return (
    <div className="flex flex-col gap-2 rounded-t-xl border-b border-gray-100 bg-white px-5 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">

      {/* Search by Offer Name */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by Offer Name..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
          className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Offer Type Filter */}
      <Select
        value={filters.discountType ?? "all"}
        onValueChange={(value) =>
          onFilterChange("discountType", value as OfferFilters["discountType"])
        }
      >
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-48">
          <SelectValue placeholder="All Offer Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Offer Types</SelectItem>
          {DISCOUNT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange("status", value as OfferFilters["status"])}
      >
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-40">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {OFFER_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear */}
      <Button
        onClick={onClear}
        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
      >
        Clear All
      </Button>

      {/* Apply */}
      <Button
        onClick={onApply}
        className="h-9 w-full rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
      >
        Apply
      </Button>
    </div>
  );
}
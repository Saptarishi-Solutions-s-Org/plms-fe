"use client";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { OfferFilters } from "@/types/offer";
interface OfferFiltersProps {
  filters: OfferFilters;
  onFilterChange: <K extends keyof OfferFilters>(
    key: K,
    value: OfferFilters[K],
  ) => void;
  onApply: () => void;
  onClear: () => void;
}

export function OfferFilters({
  filters,
  onFilterChange,
  onApply,
  onClear,
}: OfferFiltersProps) {
  return (
    <div className="flex flex-col gap-2 border-b border-gray-100 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-end rounded-t-xl">

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />

        <input
          type="text"
          placeholder="Search  Offer Type/ Offer Name"
          value={filters.search}
          onChange={(e) =>
            onFilterChange("search", e.target.value)
          }
          onKeyDown={(e) =>
            e.key === "Enter" && onApply()
          }
          className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFilterChange(
            "status",
            value as OfferFilters["status"],
          )
        }
      >
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-40">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      <button
        onClick={onClear}
        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
      >
        Clear All
      </button>

      {/* Apply */}
      <button
        onClick={onApply}
        className="h-9 w-full rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
      >
        Apply
      </button>
    </div>
  );
}
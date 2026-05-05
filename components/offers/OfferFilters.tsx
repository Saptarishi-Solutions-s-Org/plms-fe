// components/offers/OfferFilters.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const hasActiveFilters = filters.search || filters.status !== "all";

  return (
    <div className="flex gap-3 flex-wrap items-center">
      {/* Search */}
      <Input
        type="text"
        placeholder="Search organization / title / code…"
        value={filters.search}
        onChange={(e) => onFilterChange("search", e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onApply()}
        className="flex-1 min-w-[200px]"
      />

      {/* Status */}
      <Select
        value={filters.status}
        onValueChange={(value) =>
          onFilterChange("status", value as OfferFilters["status"])
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Apply */}
      <Button
        type="button"
        onClick={onApply}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Apply
      </Button>

      {/* Clear — only shown when filters are active */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClear}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
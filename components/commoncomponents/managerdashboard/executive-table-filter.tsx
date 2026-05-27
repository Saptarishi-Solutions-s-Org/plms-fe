"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ExecutiveFilters, EXECUTIVE_STATUS_OPTIONS } from "@/types/org-manager";

interface ExecutiveTableFiltersProps {
  search: string;
  status: ExecutiveFilters["status"];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ExecutiveFilters["status"]) => void;
  onApply: () => void;
  onClear: () => void;
}

export default function ExecutiveTableFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onApply,
  onClear,
}: ExecutiveTableFiltersProps) {
  return (
    <div className="flex flex-col gap-2 rounded-t-xl border-b border-gray-100 bg-white px-5 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
      {/* Search by Executive Name */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by Executive Name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
          className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as ExecutiveFilters["status"])}
      >
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-40">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {EXECUTIVE_STATUS_OPTIONS.map((option) => (
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

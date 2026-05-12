"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ExecutiveOption,
  LEAD_PRIORITY_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
} from "@/types/leadtypes";

export interface LeadTableFiltersProps {
  pendingSearch: string;
  pendingSource: string;
  pendingStatus: string;
  pendingPriority: string;
  pendingAssignedTo: string;
  executives: ExecutiveOption[];
  showAssignedToFilter?: boolean;
  onSearchChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onAssignedToChange: (value: string) => void;
  onClearAll: () => void;
  onApply: () => void;
}

export default function LeadTableFilters({
  pendingSearch,
  pendingSource,
  pendingStatus,
  pendingPriority,
  pendingAssignedTo,
  executives,
  showAssignedToFilter = true,
  onSearchChange,
  onSourceChange,
  onStatusChange,
  onPriorityChange,
  onAssignedToChange,
  onClearAll,
  onApply,
}: LeadTableFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 rounded-t-xl border-b border-gray-100 bg-white px-5 py-3 sm:items-center sm:justify-end">
      <div className="relative w-full sm:w-56">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={pendingSearch}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <Select value={pendingSource} onValueChange={onSourceChange}>
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-36">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Sources</SelectItem>
          {LEAD_SOURCE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={pendingStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-36">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Statuses</SelectItem>
          {LEAD_STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={pendingPriority} onValueChange={onPriorityChange}>
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-36">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Priorities</SelectItem>
          {LEAD_PRIORITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showAssignedToFilter && (
        <Select value={pendingAssignedTo} onValueChange={onAssignedToChange}>
          <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-44">
            <SelectValue placeholder="All Executives" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Executives</SelectItem>
            {executives.map((executive) => (
              <SelectItem key={executive.id} value={executive.id}>
                {executive.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={onClearAll}
        className="h-9 w-full px-4 text-sm font-medium sm:w-auto"
      >
        Clear All
      </Button>

      <Button
        type="button"
        onClick={onApply}
        className="h-9 w-full bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
      >
        Apply
      </Button>
    </div>
  );
}

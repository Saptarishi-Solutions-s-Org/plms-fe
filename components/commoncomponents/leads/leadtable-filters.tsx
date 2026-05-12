"use client";

import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  LEAD_PRIORITY_OPTIONS,
} from "@/types/leadtypes";
import { ExecutiveOption } from "@/types/leadtypes";

export interface LeadTableFiltersProps {
  pendingSearch: string;
  pendingSource: string;
  pendingStatus: string;
  pendingPriority: string;
  pendingAssignedTo: string;

  executives: ExecutiveOption[];

  onSearchChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onAssignedToChange: (value: string) => void;

  onClearAll: () => void;
  onApply: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LeadTableFilters({
  pendingSearch,
  pendingSource,
  pendingStatus,
  pendingPriority,
  pendingAssignedTo,
  executives,
  onSearchChange,
  onSourceChange,
  onStatusChange,
  onPriorityChange,
  onAssignedToChange,
  onClearAll,
  onApply,
}: LeadTableFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-100 bg-white px-5 py-3 sm:items-center sm:justify-end rounded-t-xl">

      {/* Search */}
      <div className="relative w-full sm:w-56">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={pendingSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-300 bg-white pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Source */}
      <Select value={pendingSource} onValueChange={onSourceChange}>
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-36">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Sources</SelectItem>
          {LEAD_SOURCE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={pendingStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-36">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Statuses</SelectItem>
          {LEAD_STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority */}
      <Select value={pendingPriority} onValueChange={onPriorityChange}>
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-36">
          <SelectValue placeholder="All Priorities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Priorities</SelectItem>
          {LEAD_PRIORITY_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Assigned To */}
      <Select
        value={pendingAssignedTo}
        onValueChange={onAssignedToChange}
      >
        <SelectTrigger className="h-9 w-full border-gray-300 bg-white text-sm text-gray-700 sm:w-44">
          <SelectValue placeholder="All Executives" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="All">All Executives</SelectItem>

          {executives.map((e) => (
            <SelectItem key={e.id} value={e.id}>
              {e.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear All */}
      <button
        onClick={onClearAll}
        className="h-9 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 sm:w-auto"
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
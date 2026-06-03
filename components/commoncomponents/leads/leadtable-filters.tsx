"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";

import {
  ExecutiveOption,
  LEAD_PRIORITY_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
  LeadFilters,
} from "@/types/leadtypes";

export interface LeadTableFiltersProps {
  executives: ExecutiveOption[];
  showAssignedToFilter?: boolean;
  onApply: (filters: LeadFilters) => void;
}

export default function LeadTableFilters({
  executives,
  showAssignedToFilter = true,
  onApply,
}: LeadTableFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedExecutives, setSelectedExecutives] = useState<string[]>([]);

  const sourceOptions = LEAD_SOURCE_OPTIONS.map((option) => option.label);
  const statusOptions = LEAD_STATUS_OPTIONS.map((option) => option.value);
  const priorityOptions = LEAD_PRIORITY_OPTIONS.map((option) => option.value);
  const executiveOptions = executives.map((executive) => executive.name);

  const handleClear = () => {
    setSearch("");
    setSelectedSources([]);
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setSelectedExecutives([]);
    onApply({
      search: "",
      sources: [],
      statuses: [],
      priorities: [],
      assignedTo: [],
    });
  };

  const handleApply = () => {
    onApply({
      search,
      sources: selectedSources,
      statuses: selectedStatuses,
      priorities: selectedPriorities,
      assignedTo: selectedExecutives,
    });
  };

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:flex-1 sm:flex-wrap sm:items-center sm:justify-end gap-4">
        <div className="w-full sm:w-50">
          <Input
            search
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="text-sm rounded-lg h-auto py-2 px-3"
          />
        </div>

        <MultiSelectCombobox
          options={sourceOptions}
          selectedValues={selectedSources}
          onSelectionChange={setSelectedSources}
          placeholder="Filter by source"
          width="w-full sm:w-50"
        />

        <MultiSelectCombobox
          options={statusOptions}
          selectedValues={selectedStatuses}
          onSelectionChange={setSelectedStatuses}
          placeholder="Filter by status"
          width="w-full sm:w-50"
        />

        <MultiSelectCombobox
          options={priorityOptions}
          selectedValues={selectedPriorities}
          onSelectionChange={setSelectedPriorities}
          placeholder="Filter by priority"
          width="w-full sm:w-50"
        />

        {showAssignedToFilter && (
          <MultiSelectCombobox
            options={executiveOptions}
            selectedValues={selectedExecutives}
            onSelectionChange={setSelectedExecutives}
            placeholder="Filter by executive"
            width="w-full sm:w-50"
          />
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>

          <Button
            onClick={handleApply}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

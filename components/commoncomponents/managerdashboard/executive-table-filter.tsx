"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelectCombobox } from "@/components/ui/multi-select-combobox";

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
  const options = EXECUTIVE_STATUS_OPTIONS.map((o) => o.label);
  const labelByValue = Object.fromEntries(EXECUTIVE_STATUS_OPTIONS.map((o) => [o.value, o.label])) as Record<string, string>;
  const valueByLabel = Object.fromEntries(EXECUTIVE_STATUS_OPTIONS.map((o) => [o.label, o.value])) as Record<string, string>;

  const selectedLabels = (Array.isArray(status) ? status : []).map((s: string) => labelByValue[s] ?? s);

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:flex-1 sm:flex-wrap sm:items-center sm:justify-end gap-4">
        <div className="relative w-full sm:w-72">
          <Input
            search
            type="text"
            placeholder="Search by Executive Name..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onApply()}
            className="text-sm rounded-lg h-auto py-2 px-3"
          />
        </div>

        <MultiSelectCombobox
          options={options}
          selectedValues={selectedLabels}
          onSelectionChange={(selected) =>
            onStatusChange(
              (selected.map((label) => valueByLabel[label]).filter(Boolean) as unknown) as ExecutiveFilters["status"],
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

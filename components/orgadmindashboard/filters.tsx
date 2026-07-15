"use client";

import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "../ui/multi-select-combobox";
import { useUrlUserFilters } from "@/hooks/useurluser-filters";
import { useEffect, useState } from "react";

const statusOptions = ["Active", "Inactive"];
const roleOptions = ["Manager", "Executive"];

const AdminFilters = () => {
  const { filters, setFilters } = useUrlUserFilters();

  const [selectedStatus, setSelectedStatus] = useState<string[]>(filters.status);
  const [selectedRole, setSelectedRole] = useState<string[]>(filters.role);

  useEffect(() => {
    setSelectedStatus(filters.status);
    setSelectedRole(filters.role);
  }, [filters.status, filters.role]);

  const handleClear = () => {
    setSelectedStatus([]);
    setSelectedRole([]);
    setFilters({ status: [], role: [] });
  };

  const handleApply = () => {
    setFilters({
      status: selectedStatus,
      role: selectedRole,
    });
  };

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        <MultiSelectCombobox
          options={statusOptions}
          selectedValues={selectedStatus}
          onSelectionChange={setSelectedStatus}
          placeholder="Filter by status"
          width="w-full sm:w-50"
        />

        <MultiSelectCombobox
          options={roleOptions}
          selectedValues={selectedRole}
          onSelectionChange={setSelectedRole}
          placeholder="Filter by role"
          width="w-full sm:w-50"
        />

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>

          <Button onClick={handleApply} className="bg-blue-600  text-white  hover:bg-blue-700">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminFilters;
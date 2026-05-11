"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MultiSelectCombobox } from "../ui/multi-select-combobox";

type Props = {
  onApply: (filters: { status: string[]; role: string[] }) => void;
};

const statusOptions = ["Active", "Inactive"];
const roleOptions = ["Manager", "Executive"];

const AdminFilters = ({ onApply }: Props) => {
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string[]>([]);

  const handleClear = () => {
    setSelectedStatus([]);
    setSelectedRole([]);
    onApply({ status: [], role: [] });
  };

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      role: selectedRole,
    });
  };

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

      <h1 className="text-xl sm:text-2xl font-semibold">
        Filters
      </h1>

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
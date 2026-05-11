"use client";

import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type LeadHeaderProps = {
  onExport:  () => void;
  onAddLead: () => void;
};

export default function LeadHeader({ onExport, onAddLead }: LeadHeaderProps) {
  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
      <Button
        type="button"
        variant="outline"
        onClick={onExport}
        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:w-auto"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>

      <Button
        onClick={onAddLead}
        className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        Add New Lead
      </Button>
    </div>
  );
}
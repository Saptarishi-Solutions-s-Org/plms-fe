"use client";

import { Download, ListChecks, Plus, Upload } from "lucide-react";
import { useState } from "react";

import LeadImportDialog from "@/components/commoncomponents/leads/lead-import-dialog";
import { Button } from "@/components/ui/button";
import type { LeadHeaderProps } from "@/types/leadtypes";

export default function LeadHeader({
  onExport,
  onImportComplete,
  onAddLead,
  onBulkAssign,
  showImportExport = true,
  showImport = showImportExport,
  showExport = showImportExport,
}: LeadHeaderProps) {
  const [isImportOpen, setImportOpen] = useState(false);

  const shouldShowExport = showExport !== undefined ? showExport : showImportExport;
  const shouldShowImport = showImport !== undefined ? showImport : showImportExport;

  const shouldShowExport = showExport !== undefined ? showExport : showImportExport;
  const shouldShowImport = showImport !== undefined ? showImport : showImportExport;

  return (
    <>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {onBulkAssign && (
          <Button
            type="button"
            variant="outline"
            onClick={onBulkAssign}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full border-blue-600 px-4 text-blue-600 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
          >
            <ListChecks className="h-4 w-4" />
            Bulk Assign
          </Button>
        )}

        {showExport && (
          <Button
            type="button"
            variant="outline"
            onClick={onExport}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}

        {showImport && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:w-auto"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
        )}

        <Button
          onClick={onAddLead}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Lead
        </Button>
      </div>

      {showImport && (
        <LeadImportDialog
          open={isImportOpen}
          onOpenChange={setImportOpen}
          onImportComplete={onImportComplete}
        />
      )}
    </>
  );
}

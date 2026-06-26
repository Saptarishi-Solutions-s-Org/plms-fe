"use client";

import { Check, CheckCircle2, RefreshCw, UploadCloud, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLeadImport } from "@/hooks/import-leads";
import type {
  LeadImportDialogProps,
  LeadImportResult,
  LeadImportRow,
} from "@/types/leadImport";
import {
  importSteps,
  requiredColumns,
} from "@/types/leadImport";

type ImportStep = 1 | 2 | 3;

function cleanValue(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeHeader(value: unknown) {
  return cleanValue(value).toLowerCase();
}

async function readLeadCsvFile(file: File) {
  const [headerLine = "", ...dataLines] = (await file.text())
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  const headers = headerLine.split(",").map(normalizeHeader);

  const missingColumns = requiredColumns.filter(
    (column) => !headers.includes(column.csvKey),
  );

  if (missingColumns.length) {
    return { headers, rows: [] };
  }

  const rows = dataLines
    .map((line) => line.split(",").map(cleanValue))
    .map((values) => {
      return {
        name: values[headers.indexOf("name")] ?? "",
        gender: values[headers.indexOf("gender")] ?? "",
        email: values[headers.indexOf("email")] ?? "",
        phone: values[headers.indexOf("phone number")] ?? "",
        leadSource: values[headers.indexOf("source")] ?? "",
      };
    })
    .filter((row) => Object.values(row).some(Boolean));

  if (!rows.length) {
    throw new Error("No lead rows found in the CSV file.");
  }

  return { headers, rows };
}

function downloadSampleLeadCsv() {
  const sample = [
    "name,gender,email,phone number,source",
    "Ananya Rao,Female,ananya@example.com,9876543210,Social_Media",
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([sample], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");

  link.href = url;
  link.download = "lead-import-sample.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function LeadImportDialog({
  open,
  onOpenChange,
  onImportComplete,
}: LeadImportDialogProps) {
  const { handleImport } = useLeadImport();
  const [selectedFileName, setSelectedFileName] = useState("");
  const [currentStep, setCurrentStep] = useState<ImportStep>(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<LeadImportRow[]>([]);
  const [isImporting, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<LeadImportResult | null>(
    null,
  );

  const missingColumns = requiredColumns.filter(
    (column) => !headers.includes(column.csvKey),
  );
  const canGoNext =
    !isImporting &&
    ((currentStep === 1 && Boolean(selectedFileName)) ||
      (currentStep === 2 && missingColumns.length === 0));

  const resetImport = () => {
    setSelectedFileName("");
    setCurrentStep(1);
    setHeaders([]);
    setRows([]);
    setImporting(false);
    setImportResult(null);
  };

  const closeImport = () => {
    onOpenChange(false);
    resetImport();
  };

  const clearSelectedFile = () => {
    setSelectedFileName("");
    setHeaders([]);
    setRows([]);
    setImportResult(null);
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    try {
      const result = await readLeadCsvFile(file);

      setSelectedFileName(file.name);
      setHeaders(result.headers);
      setRows(result.rows);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not read the CSV file. Please try another file.",
      );
    }
  };

  const handleConfirmImport = async () => {
    if (!rows.length || missingColumns.length) return;

    setImporting(true);
    try {
      const result = await handleImport(rows);

      setImportResult(result);
      await onImportComplete?.();
      setCurrentStep(3);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Please check the file and try again.";

      toast.error(`Import failed. ${message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) closeImport();
    else setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep === 1) setCurrentStep(2);
    else void handleConfirmImport();
  };

  const dialogSubtitle =
    currentStep === 2
      ? "Check your CSV columns before importing."
      : currentStep === 3
        ? "Your lead import is finished."
        : "Populate your CRM database with bulk lead data.";

  const renderMappingStep = () => (
    <div className="mx-auto max-w-sm space-y-5">
      <div
        className={`flex items-center gap-3 rounded-md border px-4 py-3 ${
          missingColumns.length
            ? "border-red-100 bg-red-50 text-red-700"
            : "border-emerald-100 bg-emerald-50 text-emerald-700"
        }`}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <p className="text-xs font-semibold">
          {missingColumns.length
            ? "Some required columns are missing"
            : "All required columns detected"}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase text-gray-400">
          Required Columns
        </p>
        <div className="space-y-2">
          {requiredColumns.map((column) => {
            const exists = headers.includes(column.csvKey);

            return (
              <div
                key={column.csvKey}
                className="flex min-h-10 items-center justify-between rounded-md bg-gray-50 px-3 py-2"
              >
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {column.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {column.csvKey}
                  </p>
                </div>
                {exists ? (
                  <Check className="h-4 w-4 text-emerald-600" />
                ) : (
                  <span className="text-[10px] font-medium text-red-500">
                    Missing
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderResultStep = () => {
    const uploadedCount = rows.length;
    const importedCount = importResult?.imported ?? uploadedCount;
    const failedCount = importResult?.failed ?? 0;
    const hasFailures = failedCount > 0;
    const hasImports = importedCount > 0;

    return (
      <div className="mx-auto max-w-sm py-4 text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            hasImports
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-gray-900">
          {hasImports
            ? hasFailures
              ? "Import Completed With Failures"
              : "Import Completed Successfully"
            : "No Records Imported"}
        </h3>
        <p className="mx-auto mt-1 max-w-[17rem] text-xs leading-5 text-gray-500">
          {hasImports
            ? "Your file was processed and imported records were added to your leads list."
            : "Your file was processed, but every row was rejected by the server."}
        </p>

        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
          <div className="px-4 py-3">
            <p className="text-[10px] font-medium uppercase text-gray-400">
              Records Imported
            </p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {importedCount}
            </p>
          </div>
          <div className="border-l border-gray-200 px-4 py-3">
            <p className="text-[10px] font-medium uppercase text-gray-400">
              Failed
            </p>
            <p className="mt-1 text-2xl font-semibold text-red-500">
              {failedCount}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full rounded-md text-sm"
            onClick={resetImport}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Import Another File
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 text-xs text-gray-400 hover:text-gray-600"
            onClick={closeImport}
          >
            Close
          </Button>
        </div>
      </div>
    );
  };

  const renderUploadStep = () => (
    <>
      <div className="mb-4 space-y-1">
        <p className="text-xs text-gray-600">
          Upload a CSV file containing lead data.
        </p>
        <Button
          type="button"
          onClick={downloadSampleLeadCsv}
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          Download Sample CSV
        </Button>
      </div>

      <Label
        htmlFor="lead-import-file"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void handleFileChange(event.dataTransfer.files?.[0]);
        }}
        className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-blue-200 bg-gray-50 px-5 text-center transition hover:border-blue-300 hover:bg-blue-50/40"
      >
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <UploadCloud className="h-6 w-6" />
        </span>
        <span className="text-sm font-semibold text-gray-800">
          Drag and drop CSV file
        </span>
        <span className="mt-1 text-xs text-gray-500">
          or search for a file on your computer
        </span>
        <span className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-xs font-semibold text-white">
          Browse Files
        </span>
        {selectedFileName && (
          <span className="mt-3 flex max-w-full items-center gap-2 rounded-md bg-white px-2 py-1 text-xs text-gray-500">
            <span className="truncate">Selected: {selectedFileName}</span>
            <Button
              type="button"
              aria-label="Remove selected file"
              className="shrink-0 text-gray-400 hover:text-red-500"
              onClick={(event) => {
                event.preventDefault();
                clearSelectedFile();
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </span>
        )}
        <Input
          id="lead-import-file"
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
      </Label>
    </>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) onOpenChange(true);
        else closeImport();
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[42rem] flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
          <DialogTitle className="text-base font-semibold text-gray-900">
            Import Leads
          </DialogTitle>
          <p className="text-xs text-gray-500">{dialogSubtitle}</p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">
          <div className="mb-5 sm:mb-7">
            <div className="relative flex items-start justify-between gap-2 px-1 sm:px-5">
              <div className="absolute left-6 right-6 top-3 h-px bg-gray-200 sm:left-10 sm:right-10" />
              {importSteps.map(({ number, label }) => {
                const active = currentStep >= number;

                return (
                  <div
                    key={number}
                    className="relative z-10 flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        active
                          ? "bg-blue-600 text-white"
                          : "bg-blue-100 text-gray-500"
                      }`}
                    >
                      {number}
                    </span>
                    <span
                      className={`max-w-[6.5rem] text-center text-[10px] font-medium uppercase leading-3 ${
                        active ? "text-blue-600" : "text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {currentStep === 1 && renderUploadStep()}
          {currentStep === 2 && renderMappingStep()}
          {currentStep === 3 && renderResultStep()}
        </div>

        {currentStep !== 3 && (
          <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3 sm:px-6 sm:py-4">
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={handleBack}
              disabled={isImporting}
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>
            <Button
              type="button"
              disabled={!canGoNext}
              onClick={handleNext}
              className="h-9 rounded-md bg-blue-600 px-5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {isImporting ? "Importing..." : "Next"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

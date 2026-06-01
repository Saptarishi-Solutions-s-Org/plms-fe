"use client";

import {
  Check,
  CheckCircle2,
  Download,
  Plus,
  RefreshCw,
  Upload,
  UploadCloud,
} from "lucide-react";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

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
  LeadHeaderProps,
  LeadImportResult,
  LeadImportRow,
} from "@/types/leadtypes";

type ImportStep = 1 | 2 | 3;
type CsvRow = Record<string, string>;
type ImportField = keyof LeadImportRow;
type ColumnMap = Partial<Record<ImportField, string>>;

const importSteps = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Mapping" },
  { number: 3, label: "Finished" },
] as const;

const importFields: Array<{
  key: ImportField;
  label: string;
  required?: boolean;
  aliases: string[];
}> = [
  {
    key: "name",
    label: "Lead Name",
    required: true,
    aliases: ["name", "leadname"],
  },
  {
    key: "email",
    label: "Mail ID",
    required: true,
    aliases: ["mailid", "mail_id", "email"],
  },
  {
    key: "phone",
    label: "Phone",
    required: true,
    aliases: ["phone", "phone_number"],
  },
  {
    key: "leadSource",
    label: "Source",
    required: true,
    aliases: ["source", "leadsource"],
  },
  { key: "gender", label: "Gender", required: true, aliases: ["gender"] },
  { key: "status", label: "Status", aliases: ["status"] },
  { key: "priority", label: "Priority", aliases: ["priority"] },
  { key: "city", label: "City", aliases: ["city", "address"] },
  { key: "stateId", label: "State ID", aliases: ["stateid", "state"] },
  { key: "countryId", label: "Country ID", aliases: ["countryid", "country"] },
  {
    key: "postalCode",
    label: "Postal Code",
    aliases: ["postalcode", "pincode", "zip"],
  },
  { key: "notes", label: "Notes", aliases: ["notes", "note"] },
  {
    key: "assignedTo",
    label: "Assigned To ID",
    aliases: ["assignedto", "assignedtoid", "executiveid"],
  },
];

const validatedFieldKeys: ImportField[] = [
  "name",
  "gender",
  "email",
  "phone",
  "leadSource",
];

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function guessColumnMap(headers: string[]): ColumnMap {
  return importFields.reduce<ColumnMap>((nextMap, field) => {
    const aliases = field.aliases.map(normalize);
    const header = headers.find((item) =>
      aliases.includes(normalize(item)),
    );

    if (header) nextMap[field.key] = header;
    return nextMap;
  }, {});
}

function trimValue(value: unknown) {
  return String(value ?? "").trim();
}

function buildImportRows(rows: CsvRow[], columnMap: ColumnMap): LeadImportRow[] {
  return rows.map((row) => {
    return importFields.reduce<LeadImportRow>((nextRow, field) => {
      const column = columnMap[field.key];
      const value = column ? trimValue(row[column]) : "";

      if (value) nextRow[field.key] = value;
      return nextRow;
    }, {});
  });
}

function countValidRows(rows: LeadImportRow[]) {
  return rows.filter(
    (row) =>
      row.name &&
      row.gender &&
      row.email &&
      row.phone &&
      row.leadSource,
  ).length;
}

export default function LeadHeader({
  onExport,
  onImportComplete,
  onAddLead,
}: LeadHeaderProps) {
  const { handleImport } = useLeadImport();
  const [isImportOpen, setImportOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [currentStep, setCurrentStep] = useState<ImportStep>(1);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [columnMap, setColumnMap] = useState<ColumnMap>({});
  const [isImporting, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<LeadImportResult | null>(
    null,
  );

  const mappedRows = useMemo(
    () => buildImportRows(csvRows, columnMap),
    [columnMap, csvRows],
  );
  const validRows = useMemo(() => countValidRows(mappedRows), [mappedRows]);
  const missingRequiredFields = importFields.filter(
    (field) => field.required && !columnMap[field.key],
  );

  const resetImport = () => {
    setSelectedFileName("");
    setCurrentStep(1);
    setCsvRows([]);
    setColumnMap({});
    setImporting(false);
    setImportResult(null);
  };

  const closeImport = () => {
    setImportOpen(false);
    resetImport();
  };

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetRows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
        header: 1,
        defval: "",
      });
      const [headerRow = [], ...dataRows] = sheetRows;
      const nextHeaders = headerRow.map(trimValue).filter(Boolean);

      if (!nextHeaders.length) {
        window.alert("No columns found in the CSV file.");
        return;
      }

      const nextRows = dataRows
        .map((row) => {
          return nextHeaders.reduce<CsvRow>((nextRow, header, index) => {
            nextRow[header] = trimValue(row[index]);
            return nextRow;
          }, {});
        })
        .filter((row) => Object.values(row).some(Boolean));

      if (!nextRows.length) {
        window.alert("No lead rows found in the CSV file.");
        return;
      }

      setSelectedFileName(file.name);
      setCsvRows(nextRows);
      setColumnMap(guessColumnMap(nextHeaders));
    } catch {
      window.alert("Could not read the CSV file. Please try another file.");
    }
  };

  const downloadSampleCsv = () => {
    const sample = [
      "name,gender,mail_id,phone_number,source",
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
  };

  const handleConfirmImport = async () => {
    if (!mappedRows.length || missingRequiredFields.length) return;

    setImporting(true);
    try {
      const result = await handleImport(mappedRows);

      setImportResult(result);
      await onImportComplete?.();
      setCurrentStep(3);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Please check the file and try again.";

      window.alert(`Import failed. ${message}`);
    } finally {
      setImporting(false);
    }
  };

  const renderStepContent = () => {
    if (currentStep === 2) {
      return (
        <div className="mx-auto max-w-sm space-y-5">
          <div
            className={`flex items-center gap-3 rounded-md border px-4 py-3 ${
              missingRequiredFields.length
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <p className="text-xs font-semibold">
              {missingRequiredFields.length
                ? "Some required columns are missing"
                : "All required columns detected"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase text-gray-400">
              Validated Fields
            </p>
            <div className="space-y-2">
              {importFields
                .filter((field) => validatedFieldKeys.includes(field.key))
                .map((field) => {
                  const mappedColumn = columnMap[field.key];

                  return (
                    <div
                      key={field.key}
                      className="flex min-h-10 items-center justify-between rounded-md bg-gray-50 px-3 py-2"
                    >
                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {field.label}
                        </p>
                        {mappedColumn && (
                          <p className="mt-0.5 text-[10px] text-gray-400">
                            {mappedColumn}
                          </p>
                        )}
                      </div>
                      {mappedColumn ? (
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
    }

    if (currentStep === 3) {
      const importedCount = importResult?.imported ?? validRows;
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
              className="h-10 w-full rounded-md bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
              onClick={closeImport}
            >
              View Leads
            </Button>
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
    }

    return (
      <>
        <div className="mb-4 space-y-1">
          <p className="text-xs text-gray-600">
            Upload a CSV file containing lead data.
          </p>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Download Sample CSV
          </button>
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
            <span className="mt-3 max-w-full truncate text-xs text-gray-500">
              Selected: {selectedFileName}
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
  };

  return (
    <>
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
          type="button"
          variant="outline"
          onClick={() => setImportOpen(true)}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>

        <Button
          onClick={onAddLead}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Lead
        </Button>
      </div>

      <Dialog
        open={isImportOpen}
        onOpenChange={(open) => {
          if (open) setImportOpen(true);
          else closeImport();
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-[42rem] flex-col overflow-hidden p-0">
          <DialogHeader className="shrink-0 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Import Leads
            </DialogTitle>
            <p className="text-xs text-gray-500">
              {currentStep === 2
                ? "Map your file columns to CRM fields."
                : currentStep === 3
                  ? "Your lead import is finished."
                  : "Populate your CRM database with bulk lead data."}
            </p>
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

            {renderStepContent()}
          </div>

          {currentStep !== 3 && (
          <div className="shrink-0 flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3 sm:px-6 sm:py-4">
            <Button
              type="button"
              variant="ghost"
              className="text-xs text-gray-500 hover:text-gray-700"
              onClick={
                currentStep === 1
                  ? closeImport
                  : () =>
                      setCurrentStep((step) =>
                        step === 3 ? 2 : 1,
                      )
              }
              disabled={isImporting}
            >
              {currentStep === 1 ? "Cancel" : "Back"}
            </Button>
            <Button
              type="button"
              disabled={
                isImporting ||
                (currentStep === 1 && !selectedFileName) ||
                (currentStep === 2 && missingRequiredFields.length > 0)
              }
              onClick={() => {
                if (currentStep === 1) setCurrentStep(2);
                else void handleConfirmImport();
              }}
              className="h-9 rounded-md bg-blue-600 px-5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              {isImporting ? "Importing..." : "Next"}
            </Button>
          </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

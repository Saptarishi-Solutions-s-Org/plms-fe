import { exportLeads } from "@/services/leads";
import { exportExecutives } from "@/services/organizationreports";
import {
  exportOffersAdmin,
  exportOffersExecutive,
  exportOffersManager,
} from "@/services/offers";
import type { ExecutiveLeadRow, TeamPerformanceRow } from "@/types/org-reports";
import { format } from "date-fns";
import { toast } from "sonner";

const getReportFilename = (reportName: string) => {
  const now = new Date();
  const month = format(now, "MMMM");
  const year = format(now, "yyyy");
  const time = format(now, "HH-mm-ss");

  return `${reportName}_${month}_${year}_${time}.csv`;
};

async function exportRowsAsCsv(
  fetchRows: () => Promise<Record<string, unknown>[] | null | undefined>,
  filenamePrefix: string,
  emptyMessage: string,
) {
  try {
    const rows = await fetchRows();

    if (!rows?.length) {
      toast.error(emptyMessage);
      return;
    }

    const headers = Object.keys(rows[0]);

    const csvLines = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const value = String(row[header] ?? "").replace(/"/g, '""');
            return /[,"\n]/.test(value) ? `"${value}"` : value;
          })
          .join(","),
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getReportFilename(filenamePrefix);
    link.click();

    URL.revokeObjectURL(url);
  } catch {
    toast.error("Export failed. Please try again.");
  }
}

export function useLeadExport() {
  const handleExport = () =>
    exportRowsAsCsv(exportLeads, "LeadsReport", "There are no leads to export.");

  return { handleExport };
}

export function useReportExecutivesExport() {
  const handleExport = () =>
    exportRowsAsCsv(
      exportExecutives,
      "ExecutivesReport",
      "There are no executives to export.",
    );

  return { handleExport };
}

export function useOfferExport() {
  const handleExport = () =>
    exportRowsAsCsv(
      exportOffersAdmin,
      "OffersReport",
      "There are no offers to export.",
    );

  return { handleExport };
}

export function useManagerOfferExport() {
  const handleExport = () =>
    exportRowsAsCsv(
      exportOffersManager,
      "OffersReport",
      "There are no offers to export.",
    );

  return { handleExport };
}

export function useExecutiveOfferExport() {
  const handleExport = () =>
    exportRowsAsCsv(
      exportOffersExecutive,
      "OffersReport",
      "There are no offers to export.",
    );

  return { handleExport };
}

export function useExecutiveExport(rows: TeamPerformanceRow[]) {
  const handleExport = () => {
    if (!rows.length) {
      toast.error("There are no executives to export.");
      return;
    }

    const headers = [
      "S.No",
      "Executive",
      "Leads Assigned",
      "Converted",
      "Conversion Rate",
    ];
    const csvLines = [
      headers.join(","),
      ...rows.map((row, index) =>
        [
          index + 1,
          row.executiveName,
          row.leadsAssigned,
          row.converted,
          `${row.conversionRate}%`,
        ]
          .map((value) => {
            const formattedValue = String(value ?? "").replace(/"/g, '""');
            return /[,"\n]/.test(formattedValue)
              ? `"${formattedValue}"`
              : formattedValue;
          })
          .join(","),
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getReportFilename("ExecutivesReport");
    link.click();

    URL.revokeObjectURL(url);
  };

  return { handleExport };
}

export function useExecutiveLeadsExport(rows: ExecutiveLeadRow[]) {
  const handleExport = () => {
    if (!rows.length) {
      toast.error("There are no leads to export.");
      return;
    }

    const headers = ["S.No", "Lead Name", "Status", "Source", "Assigned By"];
    const csvLines = [
      headers.join(","),
      ...rows.map((row, index) =>
        [index + 1, row.leadName, row.status, row.source, row.assignedBy]
          .map((value) => {
            const formattedValue = String(value ?? "").replace(/"/g, '""');
            return /[,"\n]/.test(formattedValue)
              ? `"${formattedValue}"`
              : formattedValue;
          })
          .join(","),
      ),
    ];

    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getReportFilename("ExecutiveLeadsReport");
    link.click();

    URL.revokeObjectURL(url);
  };

  return { handleExport };
}

import { exportLeads } from "@/services/leads";
import { exportExecutives } from "@/services/organizationreports";
import type { ExecutiveLeadRow } from "@/types/org-reports";

export function useLeadExport() {
  const handleExport = async () => {
    try {
      const rows = await exportLeads();

      if (!rows?.length) {
        window.alert("There are no leads to export.");
        return;
      }

      const headers = Object.keys(rows[0]);

      const csvLines = [
        headers.join(","),
        ...rows.map((row: Record<string, unknown>) =>
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
      link.download = "leads-export.csv";
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      window.alert("Export failed. Please try again.");
    }
  };

  return { handleExport };
}

export function useExecutiveExport() {
  const handleExport = async () => {
    try {
      const rows = await exportExecutives();

      if (!rows?.length) {
        window.alert("There are no executives to export.");
        return;
      }

      const headers = Object.keys(rows[0]);

      const csvLines = [
        headers.join(","),
        ...rows.map((row: Record<string, unknown>) =>
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
      link.download = "executives-export.csv";
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      window.alert("Export failed. Please try again.");
    }
  };

  return { handleExport };
}

export function useExecutiveLeadsExport(rows: ExecutiveLeadRow[]) {
  const handleExport = () => {
    if (!rows.length) {
      window.alert("There are no leads to export.");
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
    link.download = "executive-leads-export.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return { handleExport };
}

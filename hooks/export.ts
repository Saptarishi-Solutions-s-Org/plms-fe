import { exportLeads } from "@/services/leads";

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
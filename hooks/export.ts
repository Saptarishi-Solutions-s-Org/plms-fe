import { api } from "@/lib/api";

export function useLeadExport() {
  const handleExport = async () => {
    try {
      const rows = await api("/odata/v4/lead/exportLeads", { method: "POST" });

      if (!rows?.length) {
        window.alert("There are no leads to export.");
        return;
      }

      const headers = Object.keys(rows[0]);
      const csvLines = [
        headers.join(","),
        ...rows.map((row: Record<string, any>) =>
          headers
            .map((h) => {
              const val = row[h] ?? "";
              const str = String(val).replace(/"/g, '""');
              return /[,"\n]/.test(str) ? `"${str}"` : str;
            })
            .join(",")
        ),
      ];

      const csvContent = csvLines.join("\n");
      const blob       = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url        = URL.createObjectURL(blob);
      const link       = document.createElement("a");

      link.href     = url;
      link.download = "leads-export.csv";
      link.click();

      URL.revokeObjectURL(url);
    } catch {
      window.alert("Export failed. Please try again.");
    }
  };

  return { handleExport };
}
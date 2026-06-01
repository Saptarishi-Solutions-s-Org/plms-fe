import { importLeads } from "@/services/leads";
import type { LeadImportResult, LeadImportRow } from "@/types/leadtypes";

export function useLeadImport() {
  const handleImport = async (
    rows: LeadImportRow[],
  ): Promise<LeadImportResult> => {
    return importLeads(rows) as Promise<LeadImportResult>;
  };

  return { handleImport };
}

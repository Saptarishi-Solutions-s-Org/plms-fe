import { api } from "@/lib/api";
import type { LeadImportRow } from "@/types/leadImport";
import type { AddActivityFormData, LeadPayload } from "@/types/leadtypes";

export type GetLeadsWithStatsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  leadSource?: string;
  assignedTo?: string;
};

function formatNumberParam(key: string, value: number | undefined) {
  return value ? `${key}=${value}` : null;
}

function formatStringParam(key: string, value: string | undefined) {
  const nextValue = value?.trim();

  if (!nextValue) return null;

  return `${key}='${encodeURIComponent(nextValue.replace(/'/g, "''"))}'`;
}

export const getLeadsWithStats = (params?: GetLeadsWithStatsParams) => {
  if (!params) {
    return api("/odata/v4/lead/getLeadsWithStats()");
  }

  const functionParams = [
    formatNumberParam("page", params.page),
    formatNumberParam("limit", params.limit),
    formatStringParam("search", params.search),
    formatStringParam("status", params.status),
    formatStringParam("priority", params.priority),
    formatStringParam("leadSource", params.leadSource),
    formatStringParam("assignedTo", params.assignedTo),
  ].filter(Boolean);

  return api(`/odata/v4/lead/getLeadsWithStats(${functionParams.join(",")})`);
};

export const getExecutiveUsers = () =>
  api("/odata/v4/lead/getExecutiveUsers()");

export const createLead = (payload: LeadPayload) =>
  api("/odata/v4/lead/createLead", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateLead = (payload: { id: string } & LeadPayload) =>
  api("/odata/v4/lead/updateLead", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const exportLeads = () =>
  api("/odata/v4/lead/exportLeads", { method: "POST" });

export const getLeadDetail = (id: string) =>
  api(`/odata/v4/lead/getLeadDetail(id='${id}')`);

export const addLeadActivity = (leadId: string, data: AddActivityFormData) =>
  api("/odata/v4/lead/addLeadActivity", {
    method: "POST",
    body: JSON.stringify({ leadId, ...data }),
  });

export const importLeads = (rows: LeadImportRow[]) =>
  api("/odata/v4/lead/importLeads", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });

import { api } from "@/lib/api";
import { buildApiFunctionUrl } from "@/lib/api-function-url";
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

export const getLeadsWithStats = (params?: GetLeadsWithStatsParams) =>
  api(buildApiFunctionUrl("/odata/v4/lead/getLeadsWithStats", params));

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

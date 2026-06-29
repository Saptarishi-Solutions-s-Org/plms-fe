import { api } from "@/lib/api";
import type { LeadImportRow } from "@/types/leadImport";
import type { AddActivityFormData, LeadPayload } from "@/types/leadtypes";

export type GetLeadsWithStatsParams = {
  page?: number;
  limit?: number;
};

export const getLeadsWithStats = (params?: GetLeadsWithStatsParams) => {
  if (!params) {
    return api("/odata/v4/lead/getLeadsWithStats()");
  }

  return api(
    `/odata/v4/lead/getLeadsWithStats(page=${params.page},limit=${params.limit})`,
  );
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

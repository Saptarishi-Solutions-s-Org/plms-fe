import { api } from "@/lib/api";
import type { LeadImportRow } from "@/types/leadImport";
import type { AddActivityFormData, LeadPayload } from "@/types/leadtypes";

export const getLeadsWithStats = () =>
  api("/odata/v4/lead/getLeadsWithStats()");

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

export const getLeadDetail = (leadCode: string) =>
  api(`/odata/v4/lead/getLeadDetail(leadCode='${leadCode}')`);

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

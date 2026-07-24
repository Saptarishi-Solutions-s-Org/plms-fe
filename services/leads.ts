import { api } from "@/lib/api";
import { buildApiFunctionUrl } from "@/lib/api-function-url";
import type { LeadImportRow } from "@/types/leadImport";
import type {
  AddActivityFormData,
  LeadPayload,
} from "@/types/leadtypes";

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

export const getAllOrganizationLeads = (params?: GetLeadsWithStatsParams) =>
  api(buildApiFunctionUrl("/odata/v4/lead/getAllOrganizationLeads", params));

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

export const bulkAssignLeads = (payload: {
  leadIds: string[];
  assignedTo: string;
}) =>
  api("/odata/v4/lead/bulkAssignLeads", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getLeadDetail = (leadCode: string) =>
  api(`/odata/v4/lead/getLeadDetail(leadCode='${leadCode}')`);

export const addLeadActivity = (leadId: string, data: AddActivityFormData) =>
  api("/odata/v4/lead/addLeadActivity", {
    method: "POST",
    body: JSON.stringify({ leadId, ...data }),
  });

export const updateLeadActivity = (id: string, notes: string) =>
  api("/odata/v4/lead/updateLeadActivity", {
    method: "POST",
    body: JSON.stringify({ id, notes }),
  });

export const importLeads = (rows: LeadImportRow[]) =>
  api("/odata/v4/lead/importLeads", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });

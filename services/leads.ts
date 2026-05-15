import { api } from "@/lib/api";
import type {
  ExecutiveOption,
  LeadFormData,
  LeadsWithStatsResponse,
} from "@/types/leadtypes";

export const getLeadsWithStats = (): Promise<LeadsWithStatsResponse> =>
  api("/odata/v4/lead/getLeadsWithStats()");

export const getExecutiveUsers = (): Promise<ExecutiveOption[]> =>
  api("/odata/v4/lead/getExecutiveUsers()");

export const createLead = (payload: LeadFormData) =>
  api("/odata/v4/lead/createLead", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateLead = (payload: { id: string } & LeadFormData) =>
  api("/odata/v4/lead/updateLead", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// export const importLeads = (data: unknown) =>
//   api("/odata/v4/lead/importLeads", {
//     method: "POST",
//     body: JSON.stringify(data),
//   });

export const exportLeads = (): Promise<Record<string, unknown>[]> =>
  api("/odata/v4/lead/exportLeads", {
    method: "POST",
  });

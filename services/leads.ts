import { api } from "@/lib/api";
import type { AddActivityFormData, LeadFormData } from "@/types/leadtypes";

// ── existing ─────────────────────────────────────────────────────────────────

export const getLeadsWithStats = () =>
  api("/odata/v4/lead/getLeadsWithStats()");

export const getExecutiveUsers = () =>
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

export const exportLeads = () =>
  api("/odata/v4/lead/exportLeads", { method: "POST" });

// ── NEW ──────────────────────────────────────────────────────────────────────

/** GET /odata/v4/lead/getLeadDetail(id='<uuid>') */
export const getLeadDetail = (id: string) =>
  api(`/odata/v4/lead/getLeadDetail(id='${id}')`);

/** POST /odata/v4/lead/addLeadActivity */
export const addLeadActivity = (
  leadId: string,
  data: AddActivityFormData,
) =>
  api("/odata/v4/lead/addLeadActivity", {
    method: "POST",
    body: JSON.stringify({ leadId, ...data }),
  });
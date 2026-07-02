import { api } from "@/lib/api";

export const getExecutiveStats = () =>
  api("/odata/v4/organization-executive/getExecutiveStats()");

export const getRecentLeads = () =>
  api("/odata/v4/organization-executive/getExecutiveRecentLeads()");

export const getLeadStats = () =>
  api("/odata/v4/organization-executive/getExecutiveLeadStats()");

export const getExecutiveOffers = () =>
  api(`/odata/v4/organization-executive/getExecutiveOffers()`);

export const assignOfferToLead = (payload: {
  offerId: string;
  leadId: string;
}) =>
  api("/odata/v4/organization-executive/assignOfferToLead", {
    method: "POST",
    body: JSON.stringify(payload),
  });
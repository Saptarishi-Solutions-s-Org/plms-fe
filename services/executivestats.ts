import { api } from "@/lib/api";
import { buildApiFunctionUrl } from "@/lib/api-function-url";
import type { GetOffersParams } from "@/types/Createoffer";
import type {
  AssignOfferToLeadPayload,
  AssignOffersToLeadsPayload,
  AssignOffersToLeadsResponse,
} from "@/types/leadoffer";

export const getExecutiveStats = () =>
  api("/odata/v4/organization-executive/getExecutiveStats()");

export const getRecentLeads = () =>
  api("/odata/v4/organization-executive/getExecutiveRecentLeads()");

export const getLeadStats = () =>
  api("/odata/v4/organization-executive/getExecutiveLeadStats()");

export const getExecutiveOffers = (params?: GetOffersParams) =>
  api(
    buildApiFunctionUrl(
      "/odata/v4/organization-executive/getExecutiveOffers",
      params,
    ),
  );

export const assignOfferToLead = (payload: AssignOfferToLeadPayload) =>
  api("/odata/v4/organization-executive/assignOfferToLead", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const assignOffersToLeads = (payload: AssignOffersToLeadsPayload) =>
  api("/odata/v4/organization-executive/assignOffersToLeads", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<AssignOffersToLeadsResponse>;

import { api } from "@/lib/api";
import { buildApiFunctionUrl } from "@/lib/api-function-url";
import type { GetOffersParams } from "@/types/Createoffer";

export const getManagerDashboard = () =>
  api("/odata/v4/manager-dashboard/getManagerDashboard()");

export const getLeadStatusOverview = () =>
  api("/odata/v4/manager-dashboard/getLeadStatusOverview()");

export const getExecutivePerformance = () =>
  api("/odata/v4/manager-dashboard/getExecutivePerformance()");

export const getManagerOfferOverview = (params?: GetOffersParams) =>
  api(
    buildApiFunctionUrl(
      "/odata/v4/manager-dashboard/getManagerOfferOverview",
      params,
    ),
  );

export const assignOfferToExecutive = (payload: {
  offerId: string;
  executiveId: string;
}) =>
  api("/odata/v4/manager-dashboard/assignOfferToExecutive", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const bulkAssignOffersToExecutives = (payload: {
  offerIds: string[];
  executiveIds: string[];
}) =>
  api("/odata/v4/manager-dashboard/bulkAssignOffersToExecutives", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export type GetExecutiveOverviewParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  managerId?: string;
};

export const createManagerExecutive = (payload: {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  country: string;
  state: string;
  city: string;
}) =>
  api("/odata/v4/manager-dashboard/createExecutive", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getExecutiveOverview = (params?: GetExecutiveOverviewParams) =>
  api(
    buildApiFunctionUrl(
      "/odata/v4/manager-dashboard/getExecutiveOverview",
      params,
    ),
  );

export const getAvailableExecutivesForOffer = (offerId: string) =>
  api(
    `/odata/v4/manager-dashboard/getAvailableExecutivesForOffer(offerId='${offerId}')`,
  );

export const getAssignedOffersForExecutive = (executiveId: string) =>
  api(
    `/odata/v4/manager-dashboard/getAssignedOffersForExecutive(executiveId='${executiveId}')`,
  );

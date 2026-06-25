import { api } from "@/lib/api";

export const getManagerDashboard = () =>
  api("/odata/v4/manager-dashboard/getManagerDashboard()");

export const getLeadStatusOverview = () =>
  api("/odata/v4/manager-dashboard/getLeadStatusOverview()");

export const getExecutivePerformance = () =>
  api("/odata/v4/manager-dashboard/getExecutivePerformance()");

export const getManagerOfferOverview = () =>
  api("/odata/v4/manager-dashboard/getManagerOfferOverview()");

export const assignOfferToExecutive = (payload: {
  offerId: string;
  executiveId: string;
}) =>
  api("/odata/v4/manager-dashboard/assignOfferToExecutive", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getExecutiveOverview = () =>
  api("/odata/v4/manager-dashboard/getExecutiveOverview()");  


export const getAvailableExecutivesForOffer = (offerId: string) =>
  api(
    `/odata/v4/manager-dashboard/getAvailableExecutivesForOffer(offerId='${offerId}')`,
  );
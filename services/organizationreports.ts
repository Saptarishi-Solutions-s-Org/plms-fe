import { api } from "@/lib/api";
import { buildApiFunctionUrl } from "@/lib/api-function-url";
import type {
  ExecutivePerformanceRecord,
  ExecutiveUserRecord,
} from "@/types/org-reports";

export const getReportStats = () =>
  api("/odata/v4/report-dashboard/getReportStats()");
export type GetReportLeadsParams = {
  assignedTo?: string;
  page?: number;
  limit?: number;
};

export const getReportLeads = (params?: GetReportLeadsParams) =>
  api(buildApiFunctionUrl("/odata/v4/report-dashboard/getReportLeads", params));
export const getReportOffers = () =>
  api("/odata/v4/report-dashboard/getReportOffers()");
export const getReportExecutivePerformance =
  async (): Promise<ExecutivePerformanceRecord[]> => {
    const response = await api(
      "/odata/v4/report-dashboard/getReportExecutivePerformance()",
    );

    if (Array.isArray(response)) {
      return response;
    }

    return Array.isArray(response?.executives) ? response.executives : [];
  };
export const getReportExecutives = async (): Promise<
  ExecutiveUserRecord[]
> => {
  const response = await api(
    "/odata/v4/report-dashboard/getReportExecutives()",
  );

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.executives)) {
    return response.executives;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};
export const getLeadSourceAnalytics = () =>
  api("/odata/v4/report-dashboard/getLeadSourceAnalytics()");
export const getReportManagerPerformance = () =>
  api("/odata/v4/report-dashboard/getReportManagerPerformance()");
export const getReportManagers = () =>
  api("/odata/v4/report-dashboard/getReportManagers()");
export const exportExecutives = () =>
  api("/odata/v4/report-dashboard/exportExecutives", { method: "POST" });

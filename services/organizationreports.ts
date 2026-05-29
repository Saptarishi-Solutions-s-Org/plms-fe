import { api } from "@/lib/api";

export const getReportStats = () =>
  api("/odata/v4/report-dashboard/getReportStats()");
export const getLeadSourceAnalytics = () =>
  api("/odata/v4/report-dashboard/getLeadSourceAnalytics()");
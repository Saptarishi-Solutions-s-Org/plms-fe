import { api } from "@/lib/api";

export const getReportStats = () =>
  api("/odata/v4/report-dashboard/getReportStats()");
export const getLeadSourceDistribution = () =>
  api("/odata/v4/report-dashboard/getLeadSourceData()");
export const getSourceVsConversionRate = () =>
  api("/odata/v4/report-dashboard/getSourceConversionData()");

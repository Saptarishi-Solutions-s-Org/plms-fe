import { api } from "@/lib/api";

export const getReportStats = () =>
  api("/odata/v4/report-dashboard/getReportStats()");
export const exportExecutives = () =>
  api("/odata/v4/report-dashboard/exportExecutives", { method: "POST" });

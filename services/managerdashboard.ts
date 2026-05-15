import { api } from "@/lib/api";

export const getManagerDashboard = () =>
  api("/odata/v4/manager-dashboard/getManagerDashboard()");

export const getLeadStatusOverview = () =>
  api("/odata/v4/manager-dashboard/getLeadStatusOverview()");

export const getExecutivePerformance = () =>
  api("/odata/v4/manager-dashboard/getExecutivePerformance()");

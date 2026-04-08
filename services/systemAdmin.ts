import { api } from "@/lib/api";

export const getSystemAdminDashboard = () =>
  api("/odata/v4/system-admin/getDashboard()");

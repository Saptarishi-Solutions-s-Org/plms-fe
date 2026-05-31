import { api } from "@/lib/api";

export const getOrganizationAdminDashboard = () =>
  api("/odata/v4/organization-admin/getAllUsers()");


export const getReportingManagers = () =>
  api("/odata/v4/organization-admin/getAllManagers()");

export const createOrganizationUser = async (data: any) => {
  return await api("/odata/v4/organization-admin/createOrgUser", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getAllExecutives = () => {
  return api("/odata/v4/organization-admin/getAllExecutives()");
}
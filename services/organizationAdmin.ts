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
};

export const getExecutivesForManager = (managerId: string) => {
  return api(
    `/odata/v4/organization-admin/getExecutivesForManager('${managerId}')`
  );
};

export const getExecutivesByManager = (managerId: string) => {
  return getExecutivesForManager(managerId);
};

export const getManagersForReassign = (excludeManagerId: string) => {
  return api(
    `/odata/v4/organization-admin/getManagersForReassign('${excludeManagerId}')`
  );
};

export const deactivateManager = async (
  managerId: string,
  targetManagerId: string
) => {
  return await api("/odata/v4/organization-admin/deactivateManager", {
    method: "POST",
    body: JSON.stringify({
      managerId,
      targetManagerId,
    }),
  });
};

export const deactivateExecutive = async (
  executiveId: string,
  targetExecutiveId: string
) => {
  return await api("/odata/v4/organization-admin/deactivateExecutive", {
    method: "POST",
    body: JSON.stringify({
      executiveId,
      targetExecutiveId,
    }),
  });
};

export const activateUser = async (userId: string) => {
  return await api("/odata/v4/organization-admin/activateUser", {
    method: "POST",
    body: JSON.stringify({
      userId,
    }),
  });
};
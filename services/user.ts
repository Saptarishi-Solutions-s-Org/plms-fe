import { api } from "@/lib/api";

export const createUser = (payload: any) =>
  api("/odata/v4/organization/createUser", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateUser = (payload: any) =>
  api("/odata/v4/organization/updateUser", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getAdminUsers = (organizationId: string) =>
  api(
    `/odata/v4/organization/getAdminUsers(organizationId='${organizationId}')`,
  );

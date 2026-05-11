import { api } from "@/lib/api";
import type { OrganizationAdminUser } from "@/types/organization";

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

export const getAdminUsers = (
  organizationId: string,
): Promise<OrganizationAdminUser[]> =>
  api(
    `/odata/v4/organization/getAdminUsers(organizationId='${organizationId}')`,
  );

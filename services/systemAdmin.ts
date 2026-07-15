import { api } from "@/lib/api";
import type {
  UpdateAdminPermissionsPayload,
  UpdateAdminPermissionsResponse,
} from "@/types/system-admin";

export const getSystemAdminDashboard = () =>
  api("/odata/v4/system-admin/getDashboard()");

export const updateOrganizationAdminPermissions = (
  payload: UpdateAdminPermissionsPayload,
): Promise<UpdateAdminPermissionsResponse> =>
  api("/odata/v4/system-admin/updateOrganizationAdminPermissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getDefaultTemplates = () =>
  api("/odata/v4/system-admin/getDefaultTemplates()");

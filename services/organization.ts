import { api } from "@/lib/api";
import type {
  CreateOrganizationPayload,
  Organization,
  OrganizationDetailResponse,
  UpdateOrganizationPayload,
} from "@/types/organization";

export const createOrganization = (payload: CreateOrganizationPayload) =>
  api("/odata/v4/organization/createOrganization", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getOrganizations = (): Promise<Organization[]> =>
  api("/odata/v4/organization/getOrganizations()");

export const getOrganizationByCode = (
  code: string,
): Promise<OrganizationDetailResponse> =>
  api(`/odata/v4/organization/getOrganizationByCode(code='${code}')`);

export const updateOrganization = (payload: UpdateOrganizationPayload) =>
  api("/odata/v4/organization/updateOrganization", {
    method: "POST",
    body: JSON.stringify(payload),
  });

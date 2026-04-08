import { api } from "@/lib/api";

export const createOrganization = (payload: any) =>
  api("/odata/v4/organization/createOrganization", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getOrganizations = () =>
  api("/odata/v4/organization/getOrganizations()");

export const getOrganizationByCode = (code: string) =>
  api(`/odata/v4/organization/getOrganizationByCode(code='${code}')`);

export const updateOrganization = (payload: any) =>
  api("/odata/v4/organization/updateOrganization", {
    method: "POST",
    body: JSON.stringify(payload),
  });

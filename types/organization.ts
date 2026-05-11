export type Organization = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  trial?: string | null;
  start_date?: string | null;
  end_date?: string | null;
};

export type Country = {
  id: string;
  name: string;
};

export type State = {
  id: string;
  name: string;
};

export type CreateOrganizationPayload = {
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  state: string;
  trial: string;
  is_active?: boolean;
};

export type UpdateOrganizationPayload = {
  id: string;
  name: string;
  is_active: boolean;
};

export type OrganizationDetail = Organization;

export type OrganizationRole = {
  id: string;
  name: string;
};

export type OrganizationModule = {
  name: string;
};

export type OrganizationPermission = {
  role: string;
  module: string;
  permission: string;
  access: boolean;
};

export type OrganizationDetailResponse = {
  organization: OrganizationDetail;
  users?: OrganizationAdminUser[];
  modules: OrganizationModule[];
  roles: OrganizationRole[];
  permissions: OrganizationPermission[];
};

export type OrganizationAdminUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  dob?: string | null;
  state?: string | null;
  country?: string | null;
  state_id?: string | null;
  country_id?: string | null;
  is_active: boolean;
};

export type OrganizationRoleMatrix = Record<
  string,
  Record<string, Record<string, boolean>>
>;

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
  email: string;
  phone: string;
  address: string;
  state: string;
  country: string;
  trial: string;
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
  organizationId?: string;
  orgRoleId?: string;
  roleId?: string;
  role: string;
  moduleId?: string;
  module: string;
  permissionId?: string;
  permission: string;
  rmpId?: string;
  orgRoleModulePermissionId?: string;
  access: boolean;
};

export type OrgSegmentFilter = {
  id: string;
  name: string;
  label: string;
  category: string;
  operator_type: string;
  is_enabled: boolean;
};

export type OrganizationDetailResponse = {
  organization: OrganizationDetail;
  users?: OrganizationAdminUser[];
  modules: OrganizationModule[];
  roles: OrganizationRole[];
  allModules?: OrganizationModule[];
  allRoles?: OrganizationRole[];
  permissions: OrganizationPermission[];
  segmentFilters: OrgSegmentFilter[];
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

export type OrganizationAdminPermissionsResponse = {
  roles: OrganizationRole[];
  permissions: OrganizationPermission[];
  segmentFilters: OrgSegmentFilter[];
};

export type OrganizationRoleMatrix = Record<
  string,
  Record<string, Record<string, boolean>>
>;

export type OrganizationPermissionMatrix = Record<
  string,
  Record<string, Record<string, OrganizationPermission>>
>;

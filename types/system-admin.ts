export type SystemAdminRoleSummary = {
  orgRoleId: string;
  name: string;
};

export type SystemAdminRoleMatrix = {
  orgRoleId: string;
  role: string;
  modules: Record<string, Record<string, boolean>>;
};

export type SystemAdminUsersPerOrg = {
  orgId: string;
  name: string;
  count: number;
  adminOrgRoleId?: string;
  adminRoleId?: string;
};

export type SystemAdminDashboardPermissions = {
  canUpdateRoles: boolean;
};

export type SystemAdminAdminPermissionDetail = {
  access: boolean;
  orgRoleModulePermissionId: string;
  organizationId: string;
  orgRoleId: string;
  roleId: string;
  rmpId: string;
  modulePermissionId: string;
  moduleId: string;
  permissionId: string;
  module: string;
  permission: string;
};

export type SystemAdminAdminPermissionMatrix = {
  organizationId: string;
  organizationCode: string;
  organizationName: string;
  role: string;
  orgRoleId: string;
  roleId: string;
  permissions: SystemAdminAdminPermissionDetail[];
};

export type UpdateAdminPermission = {
  orgRoleModulePermissionId: string;
  access: boolean;
};

export type UpdateAdminPermissionsPayload = {
  organizationId: string;
  orgRoleId: string;
  permissions: UpdateAdminPermission[];
};

export type UpdateAdminPermissionsResponse = {
  message: string;
  updatedCount: number;
};

export type SystemAdminDashboardData = {
  totalOrganizations: number;
  totalUsers: number;
  usersPerOrg: SystemAdminUsersPerOrg[];
  roles: SystemAdminRoleSummary[];
  roleMatrix: SystemAdminRoleMatrix[];
  permissions?: SystemAdminDashboardPermissions;
  adminPermissionMatrix?: SystemAdminAdminPermissionMatrix[];
};

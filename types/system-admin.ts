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
};

export type SystemAdminDashboardData = {
  totalOrganizations: number;
  totalUsers: number;
  usersPerOrg: SystemAdminUsersPerOrg[];
  roles: SystemAdminRoleSummary[];
  roleMatrix: SystemAdminRoleMatrix[];
};

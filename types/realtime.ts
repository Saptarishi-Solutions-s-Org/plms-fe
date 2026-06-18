export const SYSTEM_ADMIN_DASHBOARD_CHANGED =
  "system-admin:dashboard:changed";
export const ORGANIZATION_LIST_CHANGED = "organization:list:changed";
export const ORGANIZATION_DETAIL_CHANGED = "organization:detail:changed";
export const PROFILE_CHANGED = "profile:changed";
export const LEAD_LIST_CHANGED = "lead:list:changed";
export const LEAD_DETAIL_CHANGED = "lead:detail:changed";
export const USER_LIST_CHANGED = "user:list:changed";
export const USER_DETAIL_CHANGED = "user:detail:changed";

export type OrganizationListChangedPayload = {
  reason: string;
  orgId?: string;
  orgCode?: string;
  isActive?: boolean;
};

export type OrganizationDetailChangedPayload = {
  reason: string;
  orgId?: string;
  orgCode?: string;
  userId?: string;
  isActive?: boolean;
};

export type OrganizationAdminDashboardChangedPayload = {
  reason: string;
  userId?: string;
};

export type ProfileChangedPayload = {
  reason: "profile-updated" | "password-changed";
  userId?: string;
};

export type LeadListChangedPayload = {
  reason: string;
  leadId?: string;
};

export type LeadDetailChangedPayload = {
  reason: string;
  leadId?: string;
  userId?: string;
};

export type UserListChangedPayload = {
  reason: string;
  userId?: string;
};

export type UserDetailChangedPayload = {
  reason: string;
  userId?: string;
};

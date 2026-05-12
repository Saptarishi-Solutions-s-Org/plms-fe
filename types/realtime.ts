export const SYSTEM_ADMIN_DASHBOARD_CHANGED =
  "system-admin:dashboard:changed";
export const ORGANIZATION_LIST_CHANGED = "organization:list:changed";
export const ORGANIZATION_DETAIL_CHANGED = "organization:detail:changed";
export const PROFILE_CHANGED = "profile:changed";

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

export type ProfileChangedPayload = {
  reason: "profile-updated" | "password-changed";
  userId?: string;
};

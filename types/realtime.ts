export const SYSTEM_ADMIN_DASHBOARD_CHANGED =
  "system-admin:dashboard:changed";
export const ORGANIZATION_LIST_CHANGED = "organization:list:changed";
export const ORGANIZATION_DETAIL_CHANGED = "organization:detail:changed";
export const PROFILE_CHANGED = "profile:changed";
export const OFFER_LIST_CHANGED = "offer:list:changed";

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

export type OfferListChangedPayload = {
  reason: "offer-created" | "offer-updated" | "offer-deleted";
  offerId?: string;
  orgId?: string;
  orgCode?: string;
};
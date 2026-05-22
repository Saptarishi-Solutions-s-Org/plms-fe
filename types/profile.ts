export type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other" | string;
  dob: string;
  city: string;
  stateId: string;
  state: string;
  countryId: string;
  country: string;
  organizationId: string;
  organization: string;
  orgCode: string;
  roleId: string;
  role: string;
  reportingManager?: string | null;
  isActive: boolean;
};

export type UpdateProfilePayload = {
  name: string;
  phone: string;
  gender: string;
  dob: string;
  city: string;
  state: string;
  country: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

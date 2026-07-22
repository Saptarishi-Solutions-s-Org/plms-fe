import { OrganizationAdminUser } from "./organization";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
};

export type CreateUserPayload = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  state: string;
  country: string;
};

export type UpdateUserPayload = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  is_active: boolean;
  state: string;
  country: string;
};

export type UserForm = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  country: string;
  state: string;
  is_active: boolean;
};

export type UserModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: OrganizationAdminUser | null;
  onSuccess: () => void;
  organizationId: string;
};
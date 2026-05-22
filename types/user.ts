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
  phone: string;
  is_active: boolean;
  state: string;
  country: string;
};
export type Organization = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
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
  trial: "Free" | "Premium";
};

export interface LeadFormData {
  name: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  stateId: string;
  countryId: string;
  postalCode: string;
  leadSource: string;
  status: string;

  assignedToId: string;
  priority: string;
  notes: string;
}

export interface Lead extends LeadFormData {
  uuid: string;
  leadCode: string;
  state: string;
  country: string;
  assignedToName?: string;
}

export interface LeadUI extends Lead {
  assignedTo?: ExecutiveOption ;
}

export interface ExecutiveOption {
  id: string;
  name: string;
}

export interface Option {
  id: string;
  name: string;
}

export const LEAD_SOURCE_OPTIONS = [
  { value: "Social_Media", label: "Social Media" },
  { value: "Advertisement", label: "Advertisement" },
  { value: "Referral", label: "Referral" },
  { value: "Manual_Entry", label: "Manual Entry" },
] as const;

export const LEAD_STATUS_OPTIONS = [
  { value: "New", label: "New" },
  { value: "Contacted", label: "Contacted" },
  { value: "Qualified", label: "Qualified" },
  { value: "Lost", label: "Lost" },
] as const;

export const LEAD_PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Urgent", label: "Urgent" },
] as const;

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
] as const;

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
  assignedTo: string;
  priority: string;
  notes: string;
}

export interface Lead extends LeadFormData {
  uuid: string;      
  leadCode: string;    
  state: string;     
  country: string;   
  assignedToId?: string;
  assignedToName?: string;
}

export const STATUS_BADGE: Record<string, string> = {
  New: "text-amber-700",
  Contacted: "text-purple-700",
  Qualified: "text-amber-700",
  Lost: "text-red-600",
};

export const PRIORITY_BADGE: Record<string, string> = {
  Low: "text-gray-600",
  Medium: "text-amber-700",
  High: "text-orange-700",
  Urgent: "text-red-600",
};

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

export interface ExecutiveOption {
  id: string;
  name: string;
}

export interface Option {
  id: string;
  name: string;
}
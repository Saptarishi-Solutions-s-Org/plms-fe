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

export type LeadPayload = Omit<LeadFormData, "assignedToId"> & {
  assignedTo: string;
};

export interface Lead extends LeadFormData {
  uuid: string;
  leadCode: string;
  state: string;
  country: string;
  assignedTo?: string;
  assignedToName?: string;
}

export interface LeadUI extends Omit<Lead, "assignedTo"> {
  assignedTo: ExecutiveOption;
}

export interface ExecutiveOption {
  id: string;
  name: string;
}

export interface Option {
  id: string;
  name: string;
}

export interface LeadStats {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
}

export interface LeadsWithStatsResponse {
  leads: Lead[];
  stats: LeadStats;
}

export const getAssignedToId = (lead: Lead) =>
  lead.assignedToId || lead.assignedTo || "";

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

export type LeadHeaderProps = {
  onExport: () => void;
  onAddLead: () => void;
};


export type LeadActionsProps = {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
};

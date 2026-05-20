// plms-fe/types/leadtypes.ts
// Full file — replaces existing leadtypes.ts

export interface LeadFormData {
  name: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
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
  assignedToName?: string;
}

// ── NEW ──────────────────────────────────────────────────────────────────────

export interface LeadActivity {
  id: string;
  type?: string;
  notes: string;
  freeText?: string;
  callStatus?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  createdByName: string;
  createdByRole: string;
}

export interface AssignedOffer {
  id: string;
  title: string;
  code: string;
  description?: string;
  discountType: string;
  discountAmount?: number;
  discountPercentage?: number;
  validFrom: string;
  validTo: string;
  status: string;
}

export interface LeadDetailData {
  lead: Lead & {
    stateName: string;
    countryName: string;
    importType: string;
    createdAt: string;
    createdById: string;
    createdByName: string;
    createdByRole: string;
  };
  activities: LeadActivity[];
  assignedOffer: AssignedOffer | null;
}

export interface AddActivityFormData {
  notes: string;
  type?: string;
}

// ── existing ─────────────────────────────────────────────────────────────────

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

export interface LeadDialogsProps {
  isFormOpen: boolean;
  editingLead: Lead | null;
  onFormSubmit: (data: LeadFormData) => Promise<void>;
  onFormClose: () => void;
  selectedLead: Lead | null;
  onDetailsClose: () => void;
  fixedAssignedToId?: string;
  hideAssignedTo?: boolean;
}

export type LeadFilters = {
  search: string;
  sources: string[];
  statuses: string[];
  priorities: string[];
  assignedTo: string[];
};

export const LEAD_SOURCE_OPTIONS = [
  { value: "Social_Media",    label: "Social Media" },
  { value: "Advertisement",   label: "Advertisement" },
  { value: "Referral",        label: "Referral" },
  { value: "Manual_Entry",    label: "Manual Entry" },
] as const;

export const LEAD_STATUS_OPTIONS = [
  { value: "New",       label: "New" },
  { value: "Contacted", label: "Contacted" },
  { value: "Qualified", label: "Qualified" },
  { value: "Lost",      label: "Lost" },
] as const;

export const LEAD_PRIORITY_OPTIONS = [
  { value: "Low",    label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High",   label: "High" },
  { value: "Urgent", label: "Urgent" },
] as const;

export const GENDER_OPTIONS = [
  { value: "Male",   label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other",  label: "Other" },
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

export interface LeadSummaryCardsProps {
  stats: LeadStats;
}
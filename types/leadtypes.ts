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
  priority: string;
  notes: string;
  assignedTo?: string;
  managerId?: string;
}

export interface Lead extends LeadFormData {
  uuid: string;
  leadCode: string;
  assignedTo: string;
  assignedToName?: string;
}

export type LeadPayload = LeadFormData & {
  assignedTo: string;
};

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
  assignmentId: string;
  assignedAt: string;
  assignedByName: string;
  offerId: string;
  title: string;
  code: string;
  description?: string;
  status: string;
  validFrom: string;
  validTo: string;
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
  offers: AssignedOffer[];
}

export interface AddActivityFormData {
  notes: string;
  type: string;
}

export interface ExecutiveOption {
  id: string;
  name: string;
  role?: string;
  reportingManagerId?: string | null;
}

export type LeadOfferOption = {
  id: string;
  title: string;
  status?: string;
};

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
  assignees?: ExecutiveOption[];
}

export type LeadFilters = {
  search: string;
  sources?: string[];
  statuses: string[];
  priorities: string[];
  assignedTo: string[];
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

export type LeadHeaderProps = {
  onExport: () => void;
  onImportComplete?: () => Promise<void> | void;
  onAddLead: () => void;
  onBulkAssign?: () => void;
  showImportExport?: boolean;
  showImport?: boolean;
  showExport?: boolean;
  showCreate?: boolean;
  showBulkAssign?: boolean;
};

export type LeadActionsProps = {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
  executives?: ExecutiveOption[];
  onAssign?: (lead: Lead, assignedTo: string) => Promise<void> | void;
  offerOptions?: LeadOfferOption[];
  isOfferOptionsLoading?: boolean;
  onAssignOffer?: (lead: Lead, offerId: string) => Promise<void> | void;
  onAssignOfferClick?: () => void;
};

export interface LeadSummaryCardsProps {
  stats: LeadStats;
}

export const allFilters: LeadFilters = {
  search: "",
  sources: [],
  statuses: [],
  priorities: [],
  assignedTo: [],
};

export type BulkLeadActionsDrawerProps = {
  open: boolean;
  executives: ExecutiveOption[];
  leads: Lead[];
  isLoadingLeads?: boolean;
  onClose: () => void;
  onAssign: (
    leadIds: string[],
    executiveId: string,
  ) => Promise<{
    successCount: number;
    failureCount: number;
    failures: Array<{ leadId: string; message: string }>;
  }>;
};

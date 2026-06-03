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
  sources?: string[];
  statuses: string[];
  priorities: string[];
  assignedTo: string[];
};

export const LEAD_SOURCE_OPTIONS = [
  { value: "Socil_Media", label: "Social Media" },
  { value: "Advertisement", label: "Advertisement" },
  { value: "Referral", label: "Referral" },
  { value: "Manual_Entry", label: "Manual Entry" },
] as const;

type LeadSourceValue = (typeof LEAD_SOURCE_OPTIONS)[number]["value"];

const normalizeAliasKey = (source: string) =>
  source.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

const leadSourceAliases: Record<string, LeadSourceValue> = {
  "socil media": "Socil_Media",
  "social media": "Socil_Media",
  facebook: "Socil_Media",
  instagram: "Socil_Media",
  linkedin: "Socil_Media",
  whatsapp: "Socil_Media",
  x: "Socil_Media",
  twitter: "Socil_Media",
  youtube: "Socil_Media",

  advertisement: "Advertisement",
  advertisements: "Advertisement",
  ad: "Advertisement",
  ads: "Advertisement",
  "google ads": "Advertisement",
  website: "Advertisement",
  seo: "Advertisement",
  campaign: "Advertisement",

  referral: "Referral",
  referrals: "Referral",

  "manual entry": "Manual_Entry",
  manual: "Manual_Entry",
  "cold call": "Manual_Entry",
  "direct sales": "Manual_Entry",
  "in person": "Manual_Entry",
};

export const normalizeLeadSource = (source: string) =>
  {
    const key = normalizeAliasKey(source);
    const exactMatch = leadSourceAliases[key];

    if (exactMatch) {
      return exactMatch;
    }

    if (
      /\b(socil|social|facebook|instagram|linkedin|whatsapp|twitter|youtube|x)\b/.test(
        key,
      )
    ) {
      return "Socil_Media";
    }

    if (/\b(ad|ads|advertisement|advertisements|google|website|seo|campaign)\b/.test(key)) {
      return "Advertisement";
    }

    if (/\b(referral|referrals|refer|referred)\b/.test(key)) {
      return "Referral";
    }

    if (/\b(manual|cold call|direct sales|in person|import)\b/.test(key)) {
      return "Manual_Entry";
    }

    return source;
  };

export const getLeadSourceLabel = (source: string) =>
  LEAD_SOURCE_OPTIONS.find(
    (option) => option.value === normalizeLeadSource(source),
  )
    ?.label ?? source.replace(/_/g, " ");

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
};

export type LeadActionsProps = {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onViewDetails: (lead: Lead) => void;
};

export interface LeadSummaryCardsProps {
  stats: LeadStats;
}

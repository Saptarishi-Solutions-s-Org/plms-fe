export type LeadImportRow = {
  name?: string;
  gender?: string;
  email?: string;
  phone?: string;
  leadSource?: string;
  status?: string;
  priority?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
  assignedTo?: string;
  stateId?: string;
  countryId?: string;
};

export type LeadImportResult = {
  imported: number;
  failed: number;
};

export type LeadImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => Promise<void> | void;
};

export const importSteps = [
  { number: 1, label: "Upload" },
  { number: 2, label: "Mapping" },
  { number: 3, label: "Finished" },
] as const;

export const requiredColumns = [
  { csvKey: "name", apiKey: "name", label: "Lead Name" },
  { csvKey: "gender", apiKey: "gender", label: "Gender" },
  { csvKey: "mail_id", apiKey: "email", label: "Mail ID" },
  { csvKey: "phone_number", apiKey: "phone", label: "Phone" },
  { csvKey: "source", apiKey: "leadSource", label: "Source" },
] as const;

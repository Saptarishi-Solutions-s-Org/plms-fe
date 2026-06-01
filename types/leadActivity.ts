import { LeadDetailData } from "@/types/leadtypes";

export type LeadDetailResponse = {
  activities?: LeadDetailData["activities"];
};

export type LeadsWithStatsResponse = {
  leads?: LeadDetailData["lead"][];
};

export type AddNoteFormProps = {
  leadId: string;
  onAdded: () => void;
};

export type LeadTitleCardProps = {
  lead: LeadDetailData["lead"];
};

export type LeadContactCardProps = {
  lead: LeadDetailData["lead"];
};

export const STATUS_COLORS: Record<string, string> = {
  New:       "bg-blue-100 text-blue-700 border-blue-200",
  Contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Qualified: "bg-green-100 text-green-700 border-green-200",
  Lost:      "bg-red-100 text-red-700 border-red-200",
} as const;

export const PRIORITY_COLORS: Record<string, string> = {
  Low:    "bg-gray-100 text-gray-600 border-gray-200",
  Medium: "bg-orange-100 text-orange-700 border-orange-200",
  High:   "bg-red-100 text-red-700 border-red-200",
  Urgent: "bg-purple-100 text-purple-700 border-purple-200",
} as const;
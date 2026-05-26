import type { ElementType } from "react";
import type { DateRange } from "react-day-picker";
import { LEAD_SOURCE_OPTIONS } from "./leadtypes";

export type ReportApiRecord = Record<string, unknown>;

export interface OrganizationReportStats {
  total_leads: number;
  leads_assigned: number;
  converted_leads: number;
  active_offers: number;
  offers_utilized: number;
}

export interface ReportStatsProps {
  stats: OrganizationReportStats;
}

export interface ReportCard {
  title: string;
  value: number | string;
  Icon: ElementType;
  color: string;
}

export interface LeadSourceRow {
  source: string;
  leads: number;
}

export interface LeadSourceDistributionProps {
  title: string;
  subtitle?: string;
  data: LeadSourceRow[];
}

export interface SourceConversionRateRow {
  source: string;
  leads: number;
  rate: number;
}

export interface SourceVsConversionRateProps {
  title: string;
  data: SourceConversionRateRow[];
  onViewAll?: () => void;
}

export type ReportPeriod = "this-month" | "last-month" | "custom";

export interface OverviewTabProps {
  stats: OrganizationReportStats;
  leadSourceDistributionData: LeadSourceRow[];
  sourceConversionRateData: SourceConversionRateRow[];
}

export interface ReportControlsProps {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  dateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onExport: () => void;
}

export interface TeamPerformanceStat {
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "emerald" | "amber" | "rose";
}

export interface TeamPerformanceRow {
  executiveId: string;
  executiveName: string;
  role: string;
  leadsAssigned: number;
  offersAssigned: number;
  offersByManager: number;
  converted: number;
  conversionRate: number;
  avatarUrl?: string;
}

export interface TeamPerformanceProps {
  stats: TeamPerformanceStat[];
  rows: TeamPerformanceRow[];
  orgCode: string;
}

export interface ExecutiveLeadSummary {
  totalCreated: number;
  byExecutives: number;
  byManager: number;
}

export interface ExecutiveLeadRow {
  id: string;
  date: string;
  leadName: string;
  status: "New" | "Contacted" | "Converted" | "Qualified";
  source: string;
  assignedBy: string;
  offer: string;
  converted: boolean;
}

export interface ExecutiveLeadsProps {
  orgCode: string;
  executiveName: string;
  summary: ExecutiveLeadSummary;
  leads: ExecutiveLeadRow[];
}

export type LeadSourceValue = (typeof LEAD_SOURCE_OPTIONS)[number]["value"];

export const normalizeLeadSource = (source: string): LeadSourceValue | string => {
  const normalizedSource = source.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const option = LEAD_SOURCE_OPTIONS.find(
    ({ label, value }) =>
      value.toLowerCase() === normalizedSource ||
      label.toLowerCase().replace(/[\s-]+/g, "_") === normalizedSource,
  );

  return option?.value ?? source;
};

export const getLeadSourceLabel = (source: string) =>
  LEAD_SOURCE_OPTIONS.find(({ value }) => value === normalizeLeadSource(source))
    ?.label ?? source;
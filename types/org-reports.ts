import type { ElementType } from "react";
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
}

export type ReportPeriod = "this-month";

export interface OverviewTabProps {
  stats: OrganizationReportStats;
  leadSourceDistributionData: LeadSourceRow[];
  sourceConversionRateData: SourceConversionRateRow[];
}

export interface ReportControlsProps {
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
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
  leadName: string;
  status: string;
  source: string;
  assignedBy: string;
}

export interface ExecutiveLeadsProps {
  orgCode: string;
  executiveId: string;
  executiveName: string;
  summary: ExecutiveLeadSummary;
  leads: ExecutiveLeadRow[];
}

export type LeadSourceValue = (typeof LEAD_SOURCE_OPTIONS)[number]["value"];

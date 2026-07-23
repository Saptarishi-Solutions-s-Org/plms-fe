import type { ElementType } from "react";
import type { PaginationMeta } from "@/types/pagination";

export interface OrganizationReportStats {
  total_leads: number;
  leads_assigned: number;
  converted_leads: number;
  active_offers: number;
  offers_utilized: number;
  total_users?: number;
  active_users?: number;
}
export type ReportTab = "overview" | "team-performance";
export type ExecutiveReportTab = "overview" | "leads-details";

export interface ReportStatsProps {
  stats: OrganizationReportStats;
  variant?: "default" | "admin";
}

export interface ExecutiveUserRecord {
  id?: string;
  name?: string;
}

export interface ExecutivePerformanceRecord {
  id?: string;
  name?: string;
  executiveId?: string;
  executiveName?: string;
  total?: number;
  qualified?: number;
  converted?: number;
}

export interface TeamPerformanceStatCard {
  label: string;
  value: string;
  Icon: ElementType;
  color: string;
};

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

export interface LeadSourceAnalyticsRow {
  source: string;
  leads: number;
  converted: number;
  conversionRate: number;
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


export interface OverviewTabProps {
  stats: OrganizationReportStats;
  leadSourceDistributionData: LeadSourceRow[];
  sourceConversionRateData: SourceConversionRateRow[];
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
  canExport?: boolean;
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
  createdById?: string;
}

export interface ExecutiveLeadsProps {
  orgCode: string;
  executiveId: string;
  summary: ExecutiveLeadSummary;
  leads: ExecutiveLeadRow[];
}

export interface LeadWithStatsApiRow{
  id: string;
  name?: string;
  status?: string;
  leadSource?: string;
  source?: string;
  createdByName?: string;
  createdById?: string;
  assignedTo?: string;
  createdAt?: string;
  createdat?: string;
};

export interface LeadsWithStatsResponse{
  leads?: LeadWithStatsApiRow[];
  pagination?: PaginationMeta;
  stats?: {
    total?: number | string;
  };
};

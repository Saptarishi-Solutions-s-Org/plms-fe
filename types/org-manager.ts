export interface ManagerCardsProps {
  stats: {
    total_leads: number;
    converted_leads: number;
    new_leads_this_week: number;
    active_offers: number;
  };
}
export interface LeadStatusRow {
  status: string;
  count: number;
}

export interface ExecutivePerformanceApiRow {
  executiveName: string;
  total: number;
  qualified: number;
}

export interface ExecutivePerformanceRow {
  executiveName: string;
  achievement: number;
}

export interface ExecutivePerformanceProps {
  title?: string;
  subtitle?: string;
  data: ExecutivePerformanceRow[];
}

export interface DashboardData {
  totalLeads: number;
  convertedLeads: number;
  thisWeekLeads: number;
  activeOffers: number;
  leadStatusOverview: LeadStatusRow[];
  executivePerformance: ExecutivePerformanceRow[];
}


export interface OverviewRow {
  label: string;
  value: number;
}

export interface CommonOverviewProps {
  title: string;
  subtitle?: string;
  data: OverviewRow[];
  onViewDetails?: () => void;
}
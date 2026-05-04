export interface ExecutiveStats {
  myLeads: number;
  convertedLeads: number;
  thisWeekLeads: number;
}

export interface ExecutiveCardsProps {
  stats: ExecutiveStats;
}

export interface ExecutiveDashboardResponse {
  totalLeads: number;
  convertedLeads: number;
  thisWeekLeads: number;
}
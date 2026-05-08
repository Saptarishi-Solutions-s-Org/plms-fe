export interface ExecutiveStats {
  myLeads: number;
  convertedLeads: number;
  thisWeekLeads: number;
  activeOffers: number;
}

export interface ExecutiveCardsProps {
  stats: ExecutiveStats;
}

export interface ExecutiveDashboardResponse {
  totalLeads: number;
  convertedLeads: number;
  thisWeekLeads: number;
  activeOffers: number;
}
export interface RecentLead {
  leadId: string;
  leadName: string;
  status: string;
  createdAt: string;
}
export type RecentLeadsProps = {
  title: string;
  leads: RecentLead[];
  onViewAll?: () => void;
};
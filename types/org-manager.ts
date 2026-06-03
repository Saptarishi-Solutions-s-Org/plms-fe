import type { ElementType } from "react";
import { Offer } from "./Createoffer";

export interface ManagerCardsProps {
  stats: {
    total_leads: number;
    converted_leads: number;
    new_leads_this_week: number;
    active_offers: number;
  };
}

export interface ManagerCard {
  title: string;
  value: number;
  Icon: ElementType;
  color: string;
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

export type ManagerOffer = Offer & {
  assignStatus?: string;
};

export interface ManagerOfferOverviewItem {
  id: string;
  title?: string;
  code?: string;
  description?: string;
  is_global?: boolean;
  status?: string;
  discount_type?: Offer["discountType"];
  discount_amount?: number;
  discount_percentage?: number;
  max_discount_amount?: number;
  combo_description?: string;
  buy_quantity?: number;
  get_quantity?: number;
  min_purchase_amount?: number;
  discount_value?: number;
  flag_discount_amount?: number;
  valid_from?: string;
  valid_to?: string;
  createdat?: string;
  assignStatus?: string;
};

export interface ExecutiveOfferItem {
  assignmentId?: string;
  assignment_ID?: string;
  ID?: string;
  offerId?: string;
  offer_ID?: string;
  id?: string;
  title?: string;
  code?: string;
  description?: string;
  isGlobal?: boolean;
  is_global?: boolean;
  status?: string;
  discountType?: Offer["discountType"];
  discount_type?: Offer["discountType"];
  discountAmount?: number;
  discount_amount?: number;
  discountPercentage?: number;
  discount_percentage?: number;
  maxDiscountAmount?: number;
  max_discount_amount?: number;
  comboDescription?: string;
  combo_description?: string;
  buyQuantity?: number;
  buy_quantity?: number;
  getQuantity?: number;
  get_quantity?: number;
  minPurchaseAmount?: number;
  min_purchase_amount?: number;
  discountValue?: number;
  discount_value?: number;
  flagDiscountAmount?: number;
  flag_discount_amount?: number;
  validFrom?: string;
  valid_from?: string;
  validTo?: string;
  valid_to?: string;
  assignedAt?: string;
  assigned_at?: string;
  createdAt?: string;
  createdat?: string;
  assignedBy?: string;
  assigned_by?: string;
  assignedByName?: string;
  assigned_by_name?: string;
};
  

export interface ExecutiveUser {
  id: string;
  name: string;
};

export const formatDate = (
  date:
    | string
    | Date
    | null
    | undefined
): string => {
  if (!date) return "—";

  const d = new Date(date);

  if (isNaN(d.getTime()))
    return "—";

  return d.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export const formatStatusLabel = (status?: string) => {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

export type ExecutiveStatus =
  | "Active"
  | "Inactive";

export interface ExecutiveFilters {
  search: string;
  status: "all" | ExecutiveStatus;
}

export type ExecutiveRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ExecutiveStatus;
  leadCount: number;
  offerCount: number;
};

export type ExecutiveStatKey =
  | "totalExecutives"
  | "activeExecutives"
  | "inactiveExecutives";

export interface ExecutiveStats {
  totalExecutives: number;
  activeExecutives: number;
  inactiveExecutives: number;
}

export interface ExecutiveStatCardConfig {
  key: ExecutiveStatKey;
  label: string;
  Icon: ElementType;
  color: string;
}

export interface ExecutiveStatCardsProps {
  stats: ExecutiveStats;
  cards?: ExecutiveStatCardConfig[];
}

export const EXECUTIVE_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
] as const;

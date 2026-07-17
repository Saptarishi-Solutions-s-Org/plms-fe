"use client";

import { PhoneCall, Sparkles, TrendingUp, Users } from "lucide-react";
import type { LeadStats } from "@/types/leadtypes";
import type { LeadSummaryCardsProps } from "@/types/leadtypes";

const SUMMARY_CARDS: {
  key: keyof LeadStats;
  label: string;
  Icon: React.ElementType;
  colorClass: string;
}[] = [
  { key: "total", label: "Total Leads", Icon: Users, colorClass: "bg-blue-50 text-blue-600" },
  { key: "new", label: "New Leads", Icon: Sparkles, colorClass: "bg-amber-50 text-amber-600" },
  { key: "contacted", label: "Contacted", Icon: PhoneCall, colorClass: "bg-purple-50 text-purple-600" },
  { key: "qualified", label: "Qualified", Icon: TrendingUp, colorClass: "bg-green-50 text-green-600" },
];

export default function LeadSummaryCards({ stats }: LeadSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SUMMARY_CARDS.map(({ key, label, Icon, colorClass }) => (
        <div 
          key={key} 
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200"
        >
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
            <h3 className="text-xl font-bold text-gray-900">{stats[key].toLocaleString()}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

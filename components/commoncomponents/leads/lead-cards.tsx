"use client";

import { PhoneCall, Sparkles, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { LeadStats } from "@/hooks/use-leads";

const SUMMARY_CARDS: {
  key: keyof LeadStats;
  label: string;
  Icon: React.ElementType;
  color: string;
}[] = [
  { key: "total", label: "Total Leads", Icon: Users, color: "bg-blue-500" },
  { key: "new", label: "New Leads", Icon: Sparkles, color: "bg-amber-400" },
  {
    key: "contacted",
    label: "Contacted",
    Icon: PhoneCall,
    color: "bg-purple-500",
  },
  {
    key: "qualified",
    label: "Qualified",
    Icon: TrendingUp,
    color: "bg-green-500",
  },
];

interface LeadSummaryCardsProps {
  stats: LeadStats;
}

export default function LeadSummaryCards({ stats }: LeadSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SUMMARY_CARDS.map(({ key, label, Icon, color }) => (
        <Card key={key} className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${color}`}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <CardContent className="p-0 mt-2">
            <p className="text-5xl font-semibold text-gray-900">
              {stats[key].toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

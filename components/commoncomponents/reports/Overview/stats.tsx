"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  BarChart2,
  BriefcaseBusiness,
  CheckCircle,
  Percent,
} from "lucide-react";
import { ReportCard, ReportStatsProps } from "@/types/org-reports";

export const ReportStats = ({ stats }: ReportStatsProps) => {
  const conversionRate =
    stats.total_leads > 0
      ? (stats.converted_leads / stats.total_leads) * 100
      : 0;

  const cards: ReportCard[] = [
    {
      title: "Total Leads",
      value: stats.total_leads,
      Icon: BarChart2,
      color: "bg-indigo-500",
    },
    {
      title: "Leads Assigned",
      value: stats.leads_assigned,
      Icon: CheckCircle,
      color: "bg-blue-500",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      Icon: Percent,
      color: "bg-green-500",
    },
    {
      title: "Active Offers",
      value: stats.active_offers,
      Icon: BriefcaseBusiness,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, value, Icon, color }) => (
        <Card key={title} className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${color}`}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>

          <CardContent className="p-0 mt-2">
            <p className="text-5xl font-semibold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default ReportStats;

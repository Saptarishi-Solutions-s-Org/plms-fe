"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  BarChart2,
  BriefcaseBusiness,
  CheckCircle,
  Percent,
  Tag,
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
    {
      title: "Offers Utilized",
      value: stats.offers_utilized,
      Icon: Tag,
      color: "bg-orange-400",
    },
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ title, value, Icon, color }) => (
        <Card key={title} className="w-full rounded-2xl border-0 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {title}
              </CardTitle>

              <CardContent className="p-0 pt-4">
                <p className="text-4xl font-bold text-slate-900">
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
              </CardContent>
            </div>

            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${color}`}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
export default ReportStats;

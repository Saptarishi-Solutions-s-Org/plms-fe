import {
  BarChart2,
  BriefcaseBusiness,
  CheckCircle,
  Percent,
  UserCheck,
  Users,
} from "lucide-react";
import { ReportCard, ReportStatsProps } from "@/types/org-reports";

export const ReportStats = ({ stats, variant = "default" }: ReportStatsProps) => {
  const conversionRate =
    stats.total_leads > 0
      ? (stats.converted_leads / stats.total_leads) * 100
      : 0;

  const defaultCards: ReportCard[] = [
    {
      title: "Total Leads",
      value: stats.total_leads,
      Icon: BarChart2,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Leads Assigned",
      value: stats.leads_assigned,
      Icon: CheckCircle,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate.toFixed(1)}%`,
      Icon: Percent,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Active Offers",
      value: stats.active_offers,
      Icon: BriefcaseBusiness,
      color: "bg-purple-50 text-purple-600",
    },
  ];
  const adminCards: ReportCard[] = [
    {
      title: "Total Users",
      value: stats.total_users ?? 0,
      Icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Active Users",
      value: stats.active_users ?? 0,
      Icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Active Offers",
      value: stats.active_offers,
      Icon: BriefcaseBusiness,
      color: "bg-purple-50 text-purple-600",
    },
  ];
  const cards = variant === "admin" ? adminCards : defaultCards;

  return (
    <div
      className={`grid w-full grid-cols-1 gap-4 sm:grid-cols-2 ${
        variant === "admin" ? "lg:grid-cols-3" : "lg:grid-cols-4"
      }`}
    >
      {cards.map(({ title, value, Icon, color }) => (
        <div
          key={title}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200"
        >
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
            <h3 className="text-xl font-bold text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ReportStats;

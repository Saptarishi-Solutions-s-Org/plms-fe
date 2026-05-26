"use client";

import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart2, CheckCircle, UserPlus, Megaphone } from "lucide-react";
import { ManagerCard, ManagerCardsProps } from "@/types/org-manager";

const ManagerCards = ({ stats }: ManagerCardsProps) => {
  const cards: ManagerCard[] = [
    {
      title: "Total Leads",
      value: stats.total_leads,
      Icon: BarChart2,
      color: "bg-indigo-500",
    },
    {
      title: "Qualified",
      value: stats.converted_leads,
      Icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "New Leads This Week",
      value: stats.new_leads_this_week,
      Icon: UserPlus,
      color: "bg-orange-400",
    },
    {
      title: "Active Offers",
      value: stats.active_offers,
      Icon: Megaphone,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ title, value, Icon, color }) => (
        <Card key={title} className="border border-gray-200 p-4 shadow-md">
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
              {value.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ManagerCards;

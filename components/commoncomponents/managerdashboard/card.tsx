"use client";

import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart2, CheckCircle, UserPlus, Megaphone } from "lucide-react";
import { ManagerCardsProps } from "@/types/mdashboard/page";

const ManagerCards = ({ stats }: ManagerCardsProps) => {
  const cards = [
    {
      title: "Total Leads",
      value: stats.total_leads,
      icon: BarChart2,
      color: "bg-indigo-500",
    },
    {
      title: "Converted",
      value: stats.converted_leads,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "New Leads This Week",
      value: stats.new_leads_this_week,
      icon: UserPlus,
      color: "bg-orange-400",
    },
    {
      title: "Active Offers",
      value: stats.active_offers,
      icon: Megaphone,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((item, index) => {
        const Icon = item.icon;

        return (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-gray-500">
                {item.title}
              </CardTitle>

              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${item.color}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            {/* Value */}
            <CardContent className="p-0 mt-2">
              <p className="text-5xl font-semibold">
                {item.value.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ManagerCards;

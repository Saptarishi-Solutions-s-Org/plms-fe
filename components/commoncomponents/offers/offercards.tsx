"use client";

import {
  CircleCheckIcon,
  CircleXIcon,
  GlobeIcon,
  LayersIcon,
} from "lucide-react";

import {
  Card,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

type OfferCardsProps = {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  globalCount: number;
};

export function OfferCards({
  totalCount,
  activeCount,
  inactiveCount,
  globalCount,
}: OfferCardsProps) {
  const cards = [
    {
      title: "Total Offers",
      value: totalCount,
      icon: LayersIcon,
      color: "bg-indigo-500",
    },
    {
      title: "Active",
      value: activeCount,
      icon: CircleCheckIcon,
      color: "bg-green-500",
    },
    {
      title: "Inactive",
      value: inactiveCount,
      icon: CircleXIcon,
      color: "bg-rose-500",
    },
    {
      title: "Global",
      value: globalCount,
      icon: GlobeIcon,
      color: "bg-amber-500",
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
                <Icon className="h-6 w-6" />
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
}
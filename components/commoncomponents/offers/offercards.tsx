"use client";

import {
  CircleCheckIcon,
  CircleXIcon,
  GlobeIcon,
  LayersIcon,
} from "lucide-react";

type OfferCardsProps = {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  globalCount: number;
  showGlobal?: boolean;
};

export function OfferCards({
  totalCount,
  activeCount,
  inactiveCount,
  globalCount,
  showGlobal = true,
}: OfferCardsProps) {
  const cards = [
    {
      title: "Total Offers",
      value: totalCount,
      icon: LayersIcon,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Active",
      value: activeCount,
      icon: CircleCheckIcon,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Inactive",
      value: inactiveCount,
      icon: CircleXIcon,
      color: "bg-rose-50 text-rose-600",
    },
    {
      title: "Global",
      value: globalCount,
      icon: GlobeIcon,
      color: "bg-amber-50 text-amber-600",
    },
  ];
  const visibleCards = showGlobal ? cards : cards.slice(0, 3);

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
        showGlobal ? "lg:grid-cols-4" : "lg:grid-cols-3"
      }`}
    >
      {visibleCards.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition duration-200"
          >
            <div className={`p-3 rounded-xl ${item.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{item.title}</p>
              <h3 className="text-xl font-bold text-gray-900">{item.value.toLocaleString()}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
"use client";

import type { ReactNode } from "react";
import {
  CircleCheckIcon,
  CircleXIcon,
  GlobeIcon,
  LayersIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Total Offers"
        value={totalCount}
        icon={<LayersIcon className="h-5 w-5" />}
        iconBg="bg-indigo-50 text-indigo-600"
      />

      <SummaryCard
        label="Active"
        value={activeCount}
        icon={<CircleCheckIcon className="h-5 w-5" />}
        iconBg="bg-emerald-50 text-emerald-600"
      />

      <SummaryCard
        label="Inactive"
        value={inactiveCount}
        icon={<CircleXIcon className="h-5 w-5" />}
        iconBg="bg-rose-50 text-rose-600"
      />

      <SummaryCard
        label="Global"
        value={globalCount}
        icon={<GlobeIcon className="h-5 w-5" />}
        iconBg="bg-amber-50 text-amber-600"
      />
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  iconBg: string;
};

function SummaryCard({ label, value, icon, iconBg }: SummaryCardProps) {
  return (
    <Card className="rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
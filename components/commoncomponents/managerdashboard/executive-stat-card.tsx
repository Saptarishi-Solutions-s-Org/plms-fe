import type { ElementType } from "react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";

export type ExecutiveStatKey =
  | "totalExecutives"
  | "activeExecutives"
  | "inactiveExecutives";

export interface ExecutiveStats {
  totalExecutives: number;
  activeExecutives: number;
  inactiveExecutives: number;
}

export interface ExecutiveStatCardConfig {
  key: ExecutiveStatKey;
  label: string;
  Icon: ElementType;
  color: string;
}

export interface ExecutiveStatCardsProps {
  stats: ExecutiveStats;
  cards?: ExecutiveStatCardConfig[];
}

const DEFAULT_CARDS: ExecutiveStatCardConfig[] = [
  {
    key: "totalExecutives",
    label: "Total Executives",
    Icon: Users,
    color: "bg-blue-500",
  },
  {
    key: "activeExecutives",
    label: "Active Executives",
    Icon: UserCheck,
    color: "bg-emerald-500",
  },
  {
    key: "inactiveExecutives",
    label: "Inactive Executives",
    Icon: UserX,
    color: "bg-rose-500",
  },
];

export default function ExecutiveStatCards({
  stats,
  cards = DEFAULT_CARDS,
}: ExecutiveStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ key, label, Icon, color }) => (
        <Card key={key} className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${color}`}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>
          <CardContent className="mt-2 p-0">
            <p className="text-5xl font-semibold text-gray-900">
              {stats[key].toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
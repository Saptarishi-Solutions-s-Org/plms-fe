import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";
import { ExecutiveStatCardConfig, ExecutiveStatCardsProps } from "@/types/org-manager";


const DEFAULT_CARDS: ExecutiveStatCardConfig[] = [
  {
    key: "totalExecutives",
    label: "Total Executives",
    Icon: Users,
    color: "bg-blue-50 text-blue-600",
  },
  {
    key: "activeExecutives",
    label: "Active Executives",
    Icon: UserCheck,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "inactiveExecutives",
    label: "Inactive Executives",
    Icon: UserX,
    color: "bg-rose-50 text-rose-600",
  },
];

export default function ExecutiveStatCards({
  stats,
  cards = DEFAULT_CARDS,
}: ExecutiveStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ key, label, Icon, color }) => (
        <Card
          key={key}
          className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition duration-200 min-h-[80px]"
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {label}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {stats[key].toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
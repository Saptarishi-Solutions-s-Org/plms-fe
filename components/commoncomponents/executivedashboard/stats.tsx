import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { ExecutiveCard, ExecutiveCardsProps } from "@/types/executivestats";
import { BarChart2, CheckCircle, Megaphone, UserPlus } from "lucide-react";

const ExecutiveCards = ({ stats }: ExecutiveCardsProps) => {
  const cards: ExecutiveCard[] = [
    {
      title: "My Leads",
      value: stats.myLeads,
      Icon: BarChart2,
      color: "bg-indigo-500",
    },
    {
      title: "Qualified",
      value: stats.convertedLeads,
      Icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: "New This Week",
      value: stats.thisWeekLeads,
      Icon: UserPlus,
      color: "bg-orange-400",
    },
    {
      title: "Active Offers",
      value: stats.activeOffers,
      Icon: Megaphone,
      color: "bg-blue-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              {value.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default ExecutiveCards;

import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { ExecutiveCardsProps } from "@/types/executivestats";
import { BarChart2, CheckCircle, UserPlus } from "lucide-react";

const ExecutiveCards = ({ stats }: ExecutiveCardsProps) => {
  const cards = [
    { title: "My Leads", value: stats.myLeads, icon: BarChart2, color: "bg-indigo-500" },
    { title: "Converted", value: stats.convertedLeads, icon: CheckCircle, color: "bg-green-500" },
    { title: "New This Week", value: stats.thisWeekLeads, icon: UserPlus, color: "bg-orange-400" },
    {title: "Active Offers", value: stats.activeOffers, icon: CheckCircle, color: "bg-blue-500"},
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
      {cards.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="p-6 flex flex-row items-center justify-between shadow-sm">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-sm font-medium text-gray-500">{item.title}</CardTitle>
              <CardContent className="p-0">
                <p className="text-4xl font-bold">{item.value.toLocaleString()}</p>
              </CardContent>
            </div>
            <div className={`w-14 h-14 rounded-full text-white ${item.color} flex items-center justify-center`}>
              <Icon className="w-6 h-6" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
export default ExecutiveCards;
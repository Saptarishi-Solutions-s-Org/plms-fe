import { ExecutiveCard, ExecutiveCardsProps } from "@/types/executivestats";
import { BarChart2, CheckCircle, Megaphone, UserPlus } from "lucide-react";

const ExecutiveCards = ({ stats }: ExecutiveCardsProps) => {
  const cards: ExecutiveCard[] = [
    {
      title: "My Leads",
      value: stats.myLeads,
      Icon: BarChart2,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Qualified",
      value: stats.convertedLeads,
      Icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "New This Week",
      value: stats.thisWeekLeads,
      Icon: UserPlus,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Active Offers",
      value: stats.activeOffers,
      Icon: Megaphone,
      color: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <h3 className="text-xl font-bold text-gray-900">{value.toLocaleString()}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};
export default ExecutiveCards;

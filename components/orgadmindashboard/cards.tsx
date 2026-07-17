import { AdminCardsProps } from "@/types/organizationadmindashboard/dashboardtypes";
import { Users, UserCheck, UserX } from "lucide-react";

const AdminCards = ({ stats }: AdminCardsProps) => {
  const cards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Users",
      value: stats.active_users,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Inactive Users",
      value: stats.inactive_users,
      icon: UserX,
      color: "bg-rose-50 text-rose-600",
    },
  ];

  return (
    <div className="w-full h-full">
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {cards.map((item, index) => {
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
    </div>
  );
};

export default AdminCards;
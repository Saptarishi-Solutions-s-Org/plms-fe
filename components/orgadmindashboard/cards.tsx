import { Card,CardTitle, CardContent } from "@/components/ui/card";
import { AdminCardsProps } from "@/types/organizationadmindashboard/dashboardtypes";
import { UserPlus, Users, UserX } from "lucide-react";


const AdminCards =({ stats }: AdminCardsProps) => {
   const cards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: UserPlus,
      color: "bg-blue-500",
    },
    {
      title: "Active Users",
      value: stats.active_users,
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Inactive Users",
      value: stats.inactive_users,
      icon: UserX,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="w-full h-full">
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {cards.map((item, index) => {
          const Icon = item.icon;

          return (
            <Card
              key={index}
              className="p-2 flex flex-row items-center justify-between shadow-sm hover:shadow-md transition"
            >
              {/* Left Content */}
              <div className="flex flex-col gap-2 p-4">
                <CardTitle className="text-2xl text-gray-500">
                  {item.title}
                </CardTitle>
                <CardContent className="p-0">
                  <p className="text-5xl font-semibold">{item.value}</p>
                </CardContent>
              </div>

              {/* Icon */}
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-full text-white ${item.color}`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCards;
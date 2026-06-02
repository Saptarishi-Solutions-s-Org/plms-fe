import { Card,CardTitle, CardContent } from "@/components/ui/card";
import { AdminCardsProps } from "@/types/organizationadmindashboard/dashboardtypes";
import { Users, UserCheck, UserX } from "lucide-react";


const AdminCards =({ stats }: AdminCardsProps) => {
   const cards = [
    {
      title: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Active Users",
      value: stats.active_users,
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      title: "Inactive Users",
      value: stats.inactive_users,
      icon: UserX,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="w-full h-full">
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 w-full">
        {cards.map((item, index) => {
          const Icon = item.icon;

          return (
            <Card
              key={index}
              className="p-4"
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-500">
                  {item.title}
                </CardTitle>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${item.color}`}
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
    </div>
  );
};

export default AdminCards;
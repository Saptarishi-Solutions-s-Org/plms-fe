"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import ManagerCards from "@/components/commoncomponents/managerdashboard/card";
import CommonOverview from "@/components/commoncomponents/managerdashboard/leadstatusoverview";
import {
  getManagerDashboard,
  getLeadStatusOverview,
  
} from "@/services/managerdashboard";
import {
  DashboardData,
  LeadStatusRow,
} from "@/types/mdashboard/page";
import GlobalLoader from "@/components/commoncomponents/globalloader";

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total_leads: 0,
    converted_leads: 0,
    new_leads_this_week: 0,
    active_offers: 0,
  });

  const [overview, setOverview] = useState<LeadStatusRow[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const dashboardData = await getManagerDashboard();

        const overviewData = await getLeadStatusOverview().catch((error) => {
          console.error("Failed to fetch lead status overview data", error);
          return {};
        });

  
        const data = dashboardData as DashboardData;

        setStats({
          total_leads: data?.totalLeads ?? 0,
          converted_leads: data?.convertedLeads ?? 0,
          new_leads_this_week: data?.thisWeekLeads ?? 0,
          active_offers: data?.activeOffers ?? 0,
        });

        const order = ["New", "Contacted", "Qualified", "Lost"];

        const formattedOverview = order.map((status) => ({
          status,
          count: Number(overviewData?.[status] || 0),
        }));

        setOverview(formattedOverview);
        
      } catch (error) {
        toast.error("Failed to load manager dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
  return <GlobalLoader />;
}
  const overviewData = overview.map((row) => ({
    label: row.status,
    value: row.count,
  }));
  return (
    <div className="w-full h-full p-5 sm:p-5">
      <div className="flex flex-col w-full h-full">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-semibold">
              Manager Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Monitor real-time performance metrics and pipeline health.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-4 sm:mt-5">
          <ManagerCards stats={stats} />
        </div>

        {/* Charts */}
        <div className="mt-6 sm:mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          <div className="w-full overflow-x-auto">
            <CommonOverview
              title="Lead Status Overview"
              subtitle="Pipeline distribution by stage"
              data={overviewData}
            />
          </div>
          <div className="w-full overflow-x-auto">
          </div>
        </div>
      </div>
    </div>
  );
}

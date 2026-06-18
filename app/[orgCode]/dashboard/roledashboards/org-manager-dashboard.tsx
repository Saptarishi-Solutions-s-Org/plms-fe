"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import ManagerCards from "@/components/commoncomponents/managerdashboard/card";
import CommonOverview from "@/components/commoncomponents/managerdashboard/leadstatusoverview";
import ExecutivePerformance from "@/components/commoncomponents/managerdashboard/executiveperformance";
import {
  getManagerDashboard,
  getLeadStatusOverview,
  getExecutivePerformance,
} from "@/services/managerdashboard";
import {
  DashboardData,
  LeadStatusRow,
  ExecutivePerformanceApiRow,
} from "@/types/org-manager";
import GlobalLoader from "@/components/commoncomponents/globalloader";
import { LEAD_LIST_CHANGED, type LeadListChangedPayload } from "@/types/realtime";
import { subscribeRealtime } from "@/lib/socket";

export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total_leads: 0,
    converted_leads: 0,
    new_leads_this_week: 0,
    active_offers: 0,
  });

  const [overview, setOverview] = useState<LeadStatusRow[]>([]);
  const [executivePerformance, setExecutivePerformance] = useState<
    ExecutivePerformanceApiRow[]
  >([]);

  const fetchDashboard = async () => {
    try {
      const [dashboardData, executivePerformanceData, overviewData] =
        await Promise.all([
          getManagerDashboard().catch((error) => {
            return null;
          }),

          getExecutivePerformance().catch((error) => {
            return [];
          }),

          getLeadStatusOverview().catch((error) => {
            return {};
          }),
        ]);

      setExecutivePerformance(executivePerformanceData || []);

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
  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    return subscribeRealtime<LeadListChangedPayload>(LEAD_LIST_CHANGED, () => {
      fetchDashboard();
    });
  }, []);

  const overviewData = overview.map((row) => ({
    label: row.status,
    value: row.count,
  }));

  const formattedExecutivePerformance = executivePerformance.map(
    (row: any) => ({
      executiveName: row.executiveName,
      achievement:
        row.total > 0 ? Math.round((row.qualified / row.total) * 100) : 0,
    }),
  );
  return (
    <>
      {loading ? (
        <GlobalLoader />
      ) : (
        <div className="w-full min-h-screen px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex w-full flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl font-semibold sm:text-2xl lg:text-3xl">
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
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="min-w-0 overflow-hidden rounded-xl">
                <CommonOverview
                  title="Lead Status Overview"
                  subtitle="Pipeline distribution by stage"
                  data={overviewData}
                />
              </div>

              <div className="min-w-0 overflow-hidden rounded-xl">
                <ExecutivePerformance data={formattedExecutivePerformance} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import ManagerCards from "@/components/commoncomponents/managerdashboard/card";
import CommonOverview from "@/components/commoncomponents/managerdashboard/leadstatusoverview";
import ExecutivePerformance from "@/components/commoncomponents/managerdashboard/executiveperformance";
import {
  getManagerDashboard,
  getExecutivePerformance,
  getLeadStatusOverview,
} from "@/services/managerdashboard";
import { getLeadsWithStats } from "@/services/leads";
import { subscribeRealtime } from "@/lib/socket";
import {
  LEAD_LIST_CHANGED,
  LeadListChangedPayload,
  OFFER_LIST_CHANGED,
} from "@/types/realtime";
import {
  DashboardData,
  ExecutivePerformanceApiRow,
  LeadStatusRow,
} from "@/types/org-manager";
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

  const [executivePerformance, setExecutivePerformance] = useState<
    ExecutivePerformanceApiRow[]
  >([]);

  const refreshActiveOffers = useCallback(async () => {
    try {
      const dashboardData = (await getManagerDashboard()) as DashboardData;

      setStats((currentStats) => ({
        ...currentStats,
        active_offers: dashboardData?.activeOffers ?? 0,
      }));
    } catch {
      toast.error("Failed to refresh active offers");
    }
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const [
        dashboardData,
        executivePerformanceData,
        leadsData,
        leadStatusOverviewData,
      ] = await Promise.all([
        getManagerDashboard(),
        getExecutivePerformance(),
        getLeadsWithStats(),
        getLeadStatusOverview(),
      ]);

      const data = dashboardData as DashboardData;
      const leads = leadsData?.leads ?? [];
      const totalLeads = leadsData?.pagination?.total ?? leads.length;

      setExecutivePerformance(executivePerformanceData || []);

      setStats({
        total_leads: totalLeads,
        converted_leads: data?.convertedLeads ?? 0,
        new_leads_this_week: data?.thisWeekLeads ?? 0,
        active_offers: data?.activeOffers ?? 0,
      });

      const order = ["New", "Contacted", "Qualified", "Lost"];

      const formattedOverview = order.map((status) => ({
        status,
        count: Number(leadStatusOverviewData?.[status] || 0),
      }));

      setOverview(formattedOverview);
    } catch {
      toast.error("Failed to load manager dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    return subscribeRealtime<LeadListChangedPayload>(LEAD_LIST_CHANGED, () => {
      fetchDashboard();
    });
  }, [fetchDashboard]);

  useEffect(() => {
    return subscribeRealtime(OFFER_LIST_CHANGED, () => {
      refreshActiveOffers();
    });
  }, [refreshActiveOffers]);

  const formattedExecutivePerformance = useMemo(
    () =>
      executivePerformance.map((row) => ({
        executiveName: row.executiveName,
        achievement:
          row.total > 0 ? Math.round((row.qualified / row.total) * 100) : 0,
      })),
    [executivePerformance],
  );

  const overviewData = useMemo(
    () =>
      overview.map((row) => ({
        label: row.status,
        value: row.count,
      })),
    [overview],
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

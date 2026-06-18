"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import ManagerCards from "@/components/commoncomponents/managerdashboard/card";
import CommonOverview from "@/components/commoncomponents/managerdashboard/leadstatusoverview";
import ExecutivePerformance from "@/components/commoncomponents/managerdashboard/executiveperformance";
import {
  getManagerDashboard,
  getExecutivePerformance,
  getExecutiveOverview,
  getManagerOfferOverview,
} from "@/services/managerdashboard";
import { getExecutiveUsers, getLeadsWithStats } from "@/services/leads";
import { subscribeRealtime } from "@/lib/socket";
import { OFFER_LIST_CHANGED } from "@/types/realtime";
import { getUser } from "@/lib/auth";
import {
  DashboardData,
  LeadStatusRow,
  ExecutivePerformanceApiRow,
} from "@/types/org-manager";
import type { ExecutiveUserRecord, LeadWithStatsApiRow } from "@/types/org-reports";
import GlobalLoader from "@/components/commoncomponents/globalloader";

const getCreatedById = (lead: LeadWithStatsApiRow) =>
  lead?.createdById ||
  lead?.created_by_id ||
  lead?.createdBy ||
  lead?.createdby ||
  lead?.created_by;

const getManagerAssignedLeads = (
  leads: LeadWithStatsApiRow[] = [],
  managerId?: string,
  executiveIds = new Set<string>(),
) =>
  managerId || executiveIds.size > 0
    ? leads.filter(
        (lead) =>
          Boolean(lead.assignedTo) &&
          (executiveIds.has(lead.assignedTo ?? "") ||
            getCreatedById(lead) === managerId),
      )
    : [];

const getManagerLeadStatusOverview = (leads: LeadWithStatsApiRow[]) => {
  const order = ["New", "Contacted", "Qualified", "Lost"];

  return order.map((status) => ({
    status,
    count: leads.filter(
      (lead) => String(lead.status || "").toLowerCase() === status.toLowerCase(),
    ).length,
  }));
};

const normalizeName = (value?: string) => value?.trim().toLowerCase() || "";

const getExecutiveRows = (response: any) =>
  response?.value?.executives ||
  response?.executives ||
  response?.value ||
  response ||
  [];

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
      const offerOverviewData = await getManagerOfferOverview();

      setStats((currentStats) => ({
        ...currentStats,
        active_offers: offerOverviewData?.stats?.activeOffers ?? 0,
      }));
    } catch {
      toast.error("Failed to refresh active offers");
    }
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [
          dashboardData,
          executivePerformanceData,
          executivesData,
          leadsData,
          offerOverviewData,
          managerExecutivesData,
        ] = await Promise.all([
          getManagerDashboard(),
          getExecutivePerformance(),
          getExecutiveOverview(),
          getLeadsWithStats(),
          getManagerOfferOverview(),
          getExecutiveUsers().catch(() => []),
        ]);

        const managerExecutiveNames = new Set(
          getExecutiveRows(executivesData).map((executive: any) =>
            normalizeName(executive.name),
          ),
        );

        setExecutivePerformance(
          (executivePerformanceData || []).filter(
            (row: ExecutivePerformanceApiRow) =>
              managerExecutiveNames.has(normalizeName(row.executiveName)),
          ),
        );

        const data = dashboardData as DashboardData;
        const currentUser = getUser();
        const managerExecutiveIds = new Set(
          (Array.isArray(managerExecutivesData)
            ? (managerExecutivesData as ExecutiveUserRecord[])
            : []
          )
            .map((executive) => executive.id)
            .filter((id): id is string => Boolean(id)),
        );
        const managerAssignedLeads = getManagerAssignedLeads(
          leadsData?.leads,
          currentUser?.id,
          managerExecutiveIds,
        );

        setStats({
          total_leads: managerAssignedLeads.length,
          converted_leads: data?.convertedLeads ?? 0,
          new_leads_this_week: data?.thisWeekLeads ?? 0,
          active_offers: offerOverviewData?.stats?.activeOffers ?? 0,
        });

        setOverview(getManagerLeadStatusOverview(managerAssignedLeads));
      } catch (error) {
        toast.error("Failed to load manager dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    return subscribeRealtime(OFFER_LIST_CHANGED, () => {
      refreshActiveOffers();
    });
  }, [refreshActiveOffers]);

  const overviewData = overview.map((row) => ({
    label: row.status,
    value: row.count,
  }));

  const formattedExecutivePerformance = executivePerformance.map(
    (row: ExecutivePerformanceApiRow) => ({
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

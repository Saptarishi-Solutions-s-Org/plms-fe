"use client";

import { useCallback, useEffect, useState } from "react";
import {
  usePathname,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "sonner";
import type { ReportTab } from "@/types/org-reports";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import OverviewTab from "@/components/commoncomponents/reports/Overview/overview-tab";
import TeamPerformanceTab from "@/components/commoncomponents/reports/team-performance/team-performance-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReportStats } from "@/services/organizationreports";
import { getManagerDashboard } from "@/services/managerdashboard";
import { getExecutiveUsers, getLeadsWithStats } from "@/services/leads";
import { subscribeRealtime } from "@/lib/socket";
import { OFFER_LIST_CHANGED } from "@/types/realtime";
import { getUser } from "@/lib/auth";
import { LEAD_SOURCE_OPTIONS } from "@/types/leadtypes";
import type {
  ExecutiveUserRecord,
  LeadSourceRow,
  LeadWithStatsApiRow,
  OrganizationReportStats,
  SourceConversionRateRow,
} from "@/types/org-reports";
import {LEAD_LIST_CHANGED, type LeadListChangedPayload} from "@/types/realtime";

const normalizeSource = (source: string) =>
  source.trim().replace(/\s+/g, "_").toLowerCase();

const reportSources = LEAD_SOURCE_OPTIONS.map(({ value, label }) => ({
  key: normalizeSource(value),
  label,
}));

const getLeadSource = (lead: LeadWithStatsApiRow) =>
  lead.leadSource || lead.source || "";

const isConvertedLead = (lead: LeadWithStatsApiRow) =>
  String(lead.status || "").toLowerCase() === "qualified";

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

const getManagerLeadSourceRows = (
  leads: LeadWithStatsApiRow[],
): LeadSourceRow[] => {
  const merged = new Map<string, number>(
    reportSources.map(({ key }) => [key, 0]),
  );

  leads.forEach((lead) => {
    const source = normalizeSource(getLeadSource(lead));

    if (merged.has(source)) {
      merged.set(source, (merged.get(source) ?? 0) + 1);
    }
  });

  return reportSources.map(({ key, label }) => ({
    source: label,
    leads: merged.get(key) ?? 0,
  }));
};

const getManagerSourceConversionRows = (
  leads: LeadWithStatsApiRow[],
): SourceConversionRateRow[] =>
  reportSources.map(({ key, label }) => {
    const sourceLeads = leads.filter(
      (lead) => normalizeSource(getLeadSource(lead)) === key,
    );
    const converted = sourceLeads.filter(isConvertedLead).length;

    return {
      source: label,
      leads: sourceLeads.length,
      rate:
        sourceLeads.length > 0
          ? Math.round((converted / sourceLeads.length) * 100)
          : 0,
    };
  });

const isReportTab = (value: string | null): value is ReportTab =>
  value === "overview" || value === "team-performance";

const getCreatedById = (lead: LeadWithStatsApiRow) =>
  lead?.createdById ||
  lead?.created_by_id ||
  lead?.createdBy ||
  lead?.createdby ||
  lead?.created_by;

export default function OrgReports() {
  const params = useParams<{ orgCode: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgCode = params.orgCode;
  const tabParam = searchParams.get("tab");
  const activeTab = isReportTab(tabParam) ? tabParam : "overview";
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<OrganizationReportStats>({
    total_leads: 0,
    leads_assigned: 0,
    converted_leads: 0,
    active_offers: 0,
    offers_utilized: 0,
  });

  const [leadSourceDistributionData, setLeadSourceDistributionData] = useState<
    LeadSourceRow[]
  >([]);

  const [sourceConversionRateData, setSourceConversionRateData] = useState<
    SourceConversionRateRow[]
  >([]);

  const refreshOfferStats = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const [statsData, managerData] = await Promise.all([
        getReportStats(),
        getManagerDashboard(),
      ]);

      setStats((currentStats) => ({
        ...currentStats,
        active_offers: managerData?.activeOffers ?? 0,
        offers_utilized: statsData?.offersUtilized ?? 0,
      }));
    } catch {
      toast.error("Failed to refresh offer reports");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

    const fetchReports = async () => {
      setIsRefreshing(true);

      try {
        const [statsData, managerData, leadsData, executivesData] =
          await Promise.all([
          getReportStats(),
          getManagerDashboard(),
          getLeadsWithStats(),
          getExecutiveUsers().catch(() => []),
        ]);

        const currentUser = getUser();
        const managerExecutiveIds = new Set(
          (Array.isArray(executivesData)
            ? (executivesData as ExecutiveUserRecord[])
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
        const managerAssignedLeadCount = managerAssignedLeads.length;

        setStats({
          total_leads: managerAssignedLeadCount,
          leads_assigned: managerAssignedLeadCount,
          converted_leads: statsData?.convertedLeads ?? 0,
          active_offers: managerData?.activeOffers ?? 0,
          offers_utilized: statsData?.offersUtilized ?? 0,
        });

        setLeadSourceDistributionData(
          getManagerLeadSourceRows(managerAssignedLeads),
        );
        setSourceConversionRateData(
          getManagerSourceConversionRows(managerAssignedLeads),
        );
      } catch {
        setStats({
          total_leads: 0,
          leads_assigned: 0,
          converted_leads: 0,
          active_offers: 0,
          offers_utilized: 0,
        });
        setLeadSourceDistributionData([]);
        setSourceConversionRateData([]);
        toast.error("Failed to load reports");
      } finally {
        setInitialLoading(false);
        setIsRefreshing(false);
      }
    };
  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    return subscribeRealtime<LeadListChangedPayload>(LEAD_LIST_CHANGED, () => {
      fetchReports();
    });
  }, []);

  useEffect(() => {
    return subscribeRealtime(OFFER_LIST_CHANGED, () => {
      refreshOfferStats();
    });
  }, [refreshOfferStats]);

  if (initialLoading) {
    return <GlobalLoader />;
  }

  const handleTabChange = (nextTab: string) => {
    if (!isReportTab(nextTab)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("tab", nextTab);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex w-full flex-col gap-6">
        <div>
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl lg:text-3xl">
              Reports
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Analyzing team performance for the current cycle
            </p>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full items-stretch gap-6"
        >
          <div className="w-full border-b border-slate-200">
            <TabsList
              variant="line"
              className="flex w-fit justify-start rounded-none"
            >
              <TabsTrigger
                value="overview"
                className="h-11 px-5 text-sm font-bold data-[state=active]:text-blue-600 data-[state=active]:after:bg-blue-600"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="team-performance"
                className="h-11 px-5 text-sm font-bold data-[state=active]:text-blue-600 data-[state=active]:after:bg-blue-600"
              >
                Team Performance
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="w-full">
            <OverviewTab
              stats={stats}
              leadSourceDistributionData={leadSourceDistributionData}
              sourceConversionRateData={sourceConversionRateData}
            />
          </TabsContent>

          <TabsContent value="team-performance" className="w-full">
            <TeamPerformanceTab stats={[]} rows={[]} orgCode={orgCode} />
          </TabsContent>
        </Tabs>

        {isRefreshing && (
          <div className="pointer-events-none fixed bottom-4 right-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-md">
            Refreshing reports...
          </div>
        )}
      </div>
    </div>
  );
}

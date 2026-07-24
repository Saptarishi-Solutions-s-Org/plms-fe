"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  usePathname,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { toast } from "sonner";
import { Download } from "lucide-react";
import type { ReportTab } from "@/types/org-reports";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import OverviewTab from "@/components/commoncomponents/reports/Overview/overview-tab";
import ExecutiveLeadsPage from "@/components/commoncomponents/reports/executive-leads/executive-leads-page";
import TeamPerformanceTab from "@/components/commoncomponents/reports/team-performance/team-performance-tab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getLeadSourceAnalytics,
  getReportLeads,
  getReportStats,
} from "@/services/organizationreports";
import { subscribeRealtime } from "@/lib/socket";
import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import { LEAD_SOURCE_OPTIONS } from "@/types/leadtypes";
import type {
  LeadSourceAnalyticsRow,
  LeadSourceRow,
  LeadsWithStatsResponse,
  ExecutiveLeadSummary,
  OrganizationReportStats,
  SourceConversionRateRow,
  TeamPerformanceTabHandle,
} from "@/types/org-reports";
import {
  LEAD_LIST_CHANGED,
  OFFER_LIST_CHANGED,
  type LeadListChangedPayload,
} from "@/types/realtime";

const normalizeSource = (source: string) =>
  source.trim().replace(/\s+/g, "_").toLowerCase();

const reportSources = LEAD_SOURCE_OPTIONS.map(({ value, label }) => ({
  key: normalizeSource(value),
  label,
}));

const emptyStats: OrganizationReportStats = {
  total_leads: 0,
  leads_assigned: 0,
  converted_leads: 0,
  active_offers: 0,
  offers_utilized: 0,
};

const emptyLeadSummary: ExecutiveLeadSummary = {
  totalCreated: 0,
  byExecutives: 0,
  byManager: 0,
};

const unwrapResponse = <T,>(response: T | { value?: T }): T =>
  response && typeof response === "object" && "value" in response
    ? (response.value ?? response) as T
    : (response as T);

const mapReportStats = (
  response: Record<string, unknown>,
  leads: LeadsWithStatsResponse["leads"] = [],
): OrganizationReportStats => ({
  total_leads: Number(response.total_leads ?? response.totalLeads ?? leads.length),
  leads_assigned: Number(
    response.leads_assigned ?? response.leadsAssigned ?? leads.length,
  ),
  converted_leads: Number(
    response.converted_leads ??
      response.convertedLeads ??
      leads.filter((lead) => lead.status?.toLowerCase() === "qualified").length,
  ),
  active_offers: Number(response.active_offers ?? response.activeOffers ?? 0),
  offers_utilized: Number(
    response.offers_utilized ?? response.offersUtilized ?? 0,
  ),
});

const getLeadSourceRows = (
  rows: LeadSourceAnalyticsRow[],
): LeadSourceRow[] => {
  const merged = new Map<string, number>(
    reportSources.map(({ key }) => [key, 0]),
  );

  rows.forEach((row) => {
    const source = normalizeSource(row.source ?? "");
    const leads = row.leads ?? 0;

    if (merged.has(source)) {
      merged.set(source, (merged.get(source) ?? 0) + leads);
    }
  });

  return reportSources.map(({ key, label }) => ({
    source: label,
    leads: merged.get(key) ?? 0,
  }));
};

const getAnalyticsRows = (analytics: unknown): LeadSourceAnalyticsRow[] => {
  const data = unwrapResponse(analytics);

  if (Array.isArray(data)) {
    return data as LeadSourceAnalyticsRow[];
  }

  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray(data.data)
  ) {
    return data.data as LeadSourceAnalyticsRow[];
  }

  return [];
};

const getSourceConversionRows = (
  analytics: unknown,
): SourceConversionRateRow[] =>
  getAnalyticsRows(analytics).map((row) => ({
    source: row.source,
    leads: row.leads,
    rate: row.conversionRate,
  }));

const isReportTab = (value: string | null): value is ReportTab =>
  value === "overview" || value === "team-performance";

export default function ManagerReportsPage() {
  const params = useParams<{ orgCode: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgCode = params.orgCode;
  const executiveId = searchParams.get("executiveId");
  const tabParam = searchParams.get("tab");
  const activeTab = isReportTab(tabParam) ? tabParam : "overview";
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getUser());
  const canExportReports = canAccess(currentUser, ["reports"], ["export"]);
  const [stats, setStats] = useState<OrganizationReportStats>(emptyStats);
  const teamPerformanceRef = useRef<TeamPerformanceTabHandle>(null);
  const [canExportTeamPerformance, setCanExportTeamPerformance] = useState(false);

  const [leadSourceDistributionData, setLeadSourceDistributionData] = useState<
    LeadSourceRow[]
  >([]);

  const [sourceConversionRateData, setSourceConversionRateData] = useState<
    SourceConversionRateRow[]
  >([]);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);

  const fetchReports = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const [
        statsData,
        leadsData,
        leadSourceAnalyticsData,
      ] = await Promise.all([
        getReportStats(),
        getReportLeads(),
        getLeadSourceAnalytics(),
      ]);

      const reportStats = unwrapResponse(
        statsData as Record<string, unknown> | { value?: Record<string, unknown> },
      );
      const reportLeads = unwrapResponse(
        leadsData as LeadsWithStatsResponse | { value?: LeadsWithStatsResponse },
      );

      setStats(mapReportStats(reportStats, reportLeads?.leads ?? []));

      const analyticsRows = getAnalyticsRows(leadSourceAnalyticsData);

      setLeadSourceDistributionData(getLeadSourceRows(analyticsRows));

      setSourceConversionRateData(getSourceConversionRows(analyticsRows));
    } catch {
      setStats(emptyStats);
      setLeadSourceDistributionData([]);
      setSourceConversionRateData([]);
      toast.error("Failed to load reports");
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    return subscribeRealtime<LeadListChangedPayload>(LEAD_LIST_CHANGED, () => {
      fetchReports();
    });
  }, [fetchReports]);

  useEffect(() => {
    return subscribeRealtime(OFFER_LIST_CHANGED, () => {
      fetchReports();
    });
  }, [fetchReports]);

  if (initialLoading) {
    return <GlobalLoader />;
  }

  if (executiveId) {
    return (
      <ExecutiveLeadsPage
        orgCode={orgCode}
        executiveId={executiveId}
        summary={emptyLeadSummary}
        leads={[]}
      />
    );
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
    <div className="w-full h-full p-4 sm:p-5 space-y-5">
      <div className="flex w-full flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl">
              Reports
            </h1>
            <p className="text-xs text-gray-500 sm:text-sm">
              Analyzing team performance for the current cycle
            </p>
          </div>

          {activeTab === "team-performance" && canExportReports && (
            <Button
              type="button"
              variant="outline"
              onClick={() => teamPerformanceRef.current?.export()}
              disabled={!canExportTeamPerformance}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full items-stretch gap-5"
        >
          <div className="w-full border-b border-slate-200">
            <TabsList
              variant="line"
              className="flex w-fit justify-start rounded-none"
            >
              <TabsTrigger
                value="overview"
                className="h-11 px-5 text-sm font-semibold data-[state=active]:text-blue-600 data-[state=active]:after:bg-blue-600"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="team-performance"
                className="h-11 px-5 text-sm font-semibold data-[state=active]:text-blue-600 data-[state=active]:after:bg-blue-600"
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
            <TeamPerformanceTab
              ref={teamPerformanceRef}
              stats={[]}
              rows={[]}
              orgCode={orgCode}
              onExportStateChange={setCanExportTeamPerformance}
            />
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

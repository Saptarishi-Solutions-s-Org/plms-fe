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

import ExecutiveReportsPage from "@/components/commoncomponents/reports/executive-reports-page";
import AdminReportsPage from "@/components/commoncomponents/reports/admin-reports-page";
import GlobalLoader from "@/components/commoncomponents/globalloader";
import OverviewTab from "@/components/commoncomponents/reports/Overview/overview-tab";
import TeamPerformanceTab from "@/components/commoncomponents/reports/team-performance/team-performance-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getLeadSourceAnalytics,
  getReportLeads,
  getReportOffers,
  getReportStats,
} from "@/services/organizationreports";
import { subscribeRealtime } from "@/lib/socket";
import { type AuthUser, getUser, refreshSession } from "@/lib/auth";
import { LEAD_SOURCE_OPTIONS } from "@/types/leadtypes";
import type {
  LeadSourceAnalyticsRow,
  LeadSourceRow,
  OrganizationReportStats,
  SourceConversionRateRow,
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
  if (Array.isArray(analytics)) {
    return analytics as LeadSourceAnalyticsRow[];
  }

  if (
    analytics &&
    typeof analytics === "object" &&
    "data" in analytics &&
    Array.isArray(analytics.data)
  ) {
    return analytics.data as LeadSourceAnalyticsRow[];
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

function ManagerReportsPage() {
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
      const [statsData, offerOverviewData] = await Promise.all([
        getReportStats(),
        getReportOffers(),
      ]);

      setStats((currentStats) => ({
        ...currentStats,
        active_offers: offerOverviewData?.stats?.activeOffers ?? 0,
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
      const [
        statsData,
        offerOverviewData,
        leadsData,
        leadSourceAnalyticsData,
      ] = await Promise.all([
        getReportStats(),
        getReportOffers(),
        getReportLeads(),
        getLeadSourceAnalytics(),
      ]);

      setStats({
        total_leads:
          Number(leadsData?.pagination?.total) ||
          leadsData?.leads?.length ||
          0,
        leads_assigned: Number(statsData?.leadsAssigned) || 0,
        converted_leads: Number(statsData?.convertedLeads) || 0,
        active_offers: offerOverviewData?.stats?.activeOffers ?? 0,
        offers_utilized: statsData?.offersUtilized ?? 0,
      });

      const analyticsRows = getAnalyticsRows(leadSourceAnalyticsData);

      setLeadSourceDistributionData(getLeadSourceRows(analyticsRows));

      setSourceConversionRateData(getSourceConversionRows(analyticsRows));
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
    <div className="h-full w-full space-y-6 p-4 sm:p-6">
      <div className="flex w-full flex-col gap-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl">
            Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Analyzing team performance for the current cycle
          </p>
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

export default function OrgReports() {
  const [user, setUser] = useState<AuthUser | null>(() => getUser());

  useEffect(() => {
    if (user) return;

    refreshSession().then((session) => {
      if (session) setUser(session.user);
    });
  }, [user]);

  if (!user) return <GlobalLoader />;

  const normalizedRole = user.role?.toLowerCase().trim();
  const isOrganizationAdmin =
    normalizedRole === "admin" || normalizedRole === "organization admin";
  const isExecutive =
    normalizedRole === "executive" ||
    normalizedRole === "organization executive";

  if (isOrganizationAdmin) return <AdminReportsPage />;
  if (isExecutive) return <ExecutiveReportsPage />;

  return <ManagerReportsPage />;
}

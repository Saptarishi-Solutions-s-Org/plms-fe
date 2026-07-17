"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import OverviewTab from "@/components/commoncomponents/reports/Overview/overview-tab";
import LeadsDetailsTab from "@/components/commoncomponents/reports/executive-leads/leads-details-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subscribeRealtime } from "@/lib/socket";
import {
  getLeadSourceAnalytics,
  getReportLeads,
  getReportStats,
} from "@/services/organizationreports";
import { LEAD_SOURCE_OPTIONS } from "@/types/leadtypes";
import type {
  ExecutiveLeadRow,
  ExecutiveReportTab,
  LeadSourceAnalyticsRow,
  LeadSourceRow,
  LeadWithStatsApiRow,
  LeadsWithStatsResponse,
  OrganizationReportStats,
  SourceConversionRateRow,
} from "@/types/org-reports";
import {
  LEAD_LIST_CHANGED,
  OFFER_LIST_CHANGED,
  type LeadListChangedPayload,
} from "@/types/realtime";

const emptyStats: OrganizationReportStats = {
  total_leads: 0,
  leads_assigned: 0,
  converted_leads: 0,
  active_offers: 0,
  offers_utilized: 0,
};

const isExecutiveReportTab = (
  value: string | null,
): value is ExecutiveReportTab =>
  value === "overview" || value === "leads-details";

const formatSource = (source?: string) =>
  source ? source.replace(/_/g, " ") : "-";

const normalizeSource = (source: string) =>
  source.trim().replace(/\s+/g, "_").toLowerCase();

const reportSources = LEAD_SOURCE_OPTIONS.map(({ value, label }) => ({
  key: normalizeSource(value),
  label,
}));

const buildSourceReports = (leads: LeadWithStatsApiRow[]) => {
  const sourceSummary = new Map<
    string,
    { leads: number; converted: number }
  >(reportSources.map(({ key }) => [key, { leads: 0, converted: 0 }]));

  leads.forEach((lead) => {
    const source = normalizeSource(lead.leadSource || lead.source || "");
    const summary = sourceSummary.get(source);

    if (!summary) {
      return;
    }

    summary.leads += 1;

    if (String(lead.status || "").toLowerCase() === "qualified") {
      summary.converted += 1;
    }
  });

  const distribution: LeadSourceRow[] = reportSources.map(({ key, label }) => ({
    source: label,
    leads: sourceSummary.get(key)?.leads ?? 0,
  }));
  const conversion: SourceConversionRateRow[] = reportSources.map(
    ({ key, label }) => {
      const summary = sourceSummary.get(key) ?? { leads: 0, converted: 0 };

      return {
        source: label,
        leads: summary.leads,
        rate:
          summary.leads > 0
            ? Math.round((summary.converted / summary.leads) * 100)
            : 0,
      };
    },
  );

  return { distribution, conversion };
};

const unwrapResponse = <T,>(response: T | { value?: T }): T =>
  response && typeof response === "object" && "value" in response
    ? (response.value ?? response) as T
    : (response as T);

const getAnalyticsRows = (response: unknown): LeadSourceAnalyticsRow[] => {
  const analytics = unwrapResponse(response);

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

const mapAnalytics = (response: unknown) => {
  const rows = getAnalyticsRows(response);
  const sourceSummary = new Map<
    string,
    { leads: number; converted: number }
  >(reportSources.map(({ key }) => [key, { leads: 0, converted: 0 }]));

  rows.forEach((row) => {
    const summary = sourceSummary.get(normalizeSource(row.source ?? ""));

    if (!summary) {
      return;
    }

    const leads = Number(row.leads || 0);
    summary.leads += leads;
    summary.converted += Number(
      row.converted ?? (leads * Number(row.conversionRate || 0)) / 100,
    );
  });

  return {
    hasData: rows.length > 0,
    distribution: reportSources.map(({ key, label }) => ({
      source: label,
      leads: sourceSummary.get(key)?.leads ?? 0,
    })),
    conversion: reportSources.map(({ key, label }) => {
      const summary = sourceSummary.get(key) ?? { leads: 0, converted: 0 };

      return {
        source: label,
        leads: summary.leads,
        rate:
          summary.leads > 0
            ? Math.round((summary.converted / summary.leads) * 100)
            : 0,
      };
    }),
  };
};

const mapLead = (lead: LeadWithStatsApiRow): ExecutiveLeadRow => ({
  id: lead.id,
  leadName: lead.name || "-",
  status: lead.status || "-",
  source: formatSource(lead.leadSource || lead.source),
  assignedBy: lead.createdByName || "-",
  createdById: lead.createdById,
});

export default function ExecutiveReportsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = isExecutiveReportTab(tabParam) ? tabParam : "overview";
  const [stats, setStats] = useState<OrganizationReportStats>(emptyStats);
  const [leads, setLeads] = useState<ExecutiveLeadRow[]>([]);
  const [leadSourceDistribution, setLeadSourceDistribution] = useState<
    LeadSourceRow[]
  >([]);
  const [sourceConversionRate, setSourceConversionRate] = useState<
    SourceConversionRateRow[]
  >([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const [statsResponse, leadsResponse, analyticsResponse] = await Promise.all([
        getReportStats(),
        getReportLeads(),
        getLeadSourceAnalytics(),
      ]);
      const statsData = unwrapResponse(
        statsResponse as Record<string, unknown> | { value?: Record<string, unknown> },
      );
      const leadData = unwrapResponse(
        leadsResponse as LeadsWithStatsResponse | { value?: LeadsWithStatsResponse },
      );
      const reportLeads = Array.isArray(leadData?.leads) ? leadData.leads : [];
      const analytics = mapAnalytics(analyticsResponse);
      const sourceReports = analytics.hasData
        ? analytics
        : buildSourceReports(reportLeads);
      const convertedLeads = reportLeads.filter(
        (lead) => lead.status?.toLowerCase() === "qualified",
      ).length;

      setStats({
        total_leads: Number(
          statsData.total_leads ?? statsData.totalLeads ?? reportLeads.length,
        ),
        leads_assigned: Number(
          statsData.leads_assigned ?? statsData.leadsAssigned ?? reportLeads.length,
        ),
        converted_leads: Number(
          statsData.converted_leads ?? statsData.convertedLeads ?? convertedLeads,
        ),
        active_offers: Number(
          statsData.active_offers ?? statsData.activeOffers ?? 0,
        ),
        offers_utilized: Number(
          statsData.offers_utilized ?? statsData.offersUtilized ?? 0,
        ),
      });
      setLeads(reportLeads.map(mapLead));
      setLeadSourceDistribution(sourceReports.distribution);
      setSourceConversionRate(sourceReports.conversion);
    } catch {
      setStats(emptyStats);
      setLeads([]);
      setLeadSourceDistribution([]);
      setSourceConversionRate([]);
      toast.error("Failed to load executive reports");
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(
    () =>
      subscribeRealtime<LeadListChangedPayload>(LEAD_LIST_CHANGED, () => {
        fetchReports();
      }),
    [fetchReports],
  );

  useEffect(
    () =>
      subscribeRealtime(OFFER_LIST_CHANGED, () => {
        fetchReports();
      }),
    [fetchReports],
  );

  const handleTabChange = (nextTab: string) => {
    if (!isExecutiveReportTab(nextTab)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("tab", nextTab);
    nextParams.delete("page");
    nextParams.delete("limit");
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  if (initialLoading) {
    return <GlobalLoader />;
  }

  return (
    <div className="h-full w-full space-y-5 p-4 sm:p-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 sm:text-2xl">
          My Reports
        </h1>
        <p className="text-xs text-slate-500 sm:text-sm">
          Review your personal lead activity and performance.
        </p>
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
              value="leads-details"
              className="h-11 px-5 text-sm font-semibold data-[state=active]:text-blue-600 data-[state=active]:after:bg-blue-600"
            >
              Leads Details
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="w-full">
          <OverviewTab
            stats={stats}
            leadSourceDistributionData={leadSourceDistribution}
            sourceConversionRateData={sourceConversionRate}
          />
        </TabsContent>

        <TabsContent value="leads-details" className="w-full">
          <LeadsDetailsTab leads={leads} loading={isRefreshing} />
        </TabsContent>
      </Tabs>

      {isRefreshing && activeTab === "overview" && (
        <div className="pointer-events-none fixed bottom-4 right-4 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-md">
          Refreshing reports...
        </div>
      )}
    </div>
  );
}

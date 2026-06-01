"use client";

import { useEffect, useState } from "react";
import { usePathname, useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import OverviewTab from "@/components/commoncomponents/reports/Overview/overview-tab";
import TeamPerformanceTab from "@/components/commoncomponents/reports/team-performance/team-performance-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getLeadSourceAnalytics,
  getReportStats,
} from "@/services/organizationreports";
import { getManagerDashboard } from "@/services/managerdashboard";
import type {
  LeadSourceRow,
  OrganizationReportStats,
  ReportApiRecord,
  SourceConversionRateRow,
} from "@/types/org-reports";

const toRecord = (value: unknown): ReportApiRecord =>
  value && typeof value === "object" ? (value as ReportApiRecord) : {};

const numberValue = (value: unknown) => Number(value || 0);

const sourceOrder = ["Referral", "Advertisement", "Social_Media"];

const sourceRank = (source: string) => {
  const normalized = source.trim().replace(/\s+/g, "_");
  const index = sourceOrder.findIndex(
    (orderedSource) => orderedSource.toLowerCase() === normalized.toLowerCase(),
  );

  return index === -1 ? sourceOrder.length : index;
};

const sortSourceRows = <T extends { source: string }>(rows: T[]) =>
  [...rows].sort((first, second) => {
    const rankDiff = sourceRank(first.source) - sourceRank(second.source);

    if (rankDiff !== 0) {
      return rankDiff;
    }

    return first.source.localeCompare(second.source);
  });

const mergeLeadSourceRows = (rows: unknown[]): LeadSourceRow[] => {
  const merged = new Map<string, number>();

  rows.forEach((row) => {
    const record = toRecord(row);
    const source = String(record.source ?? "");
    const leads = numberValue(record.leads);

    merged.set(source, (merged.get(source) ?? 0) + leads);
  });

  return sortSourceRows(Array.from(merged, ([source, leads]) => ({ source, leads })));
};

const mergeConversionRows = (rows: unknown[]): SourceConversionRateRow[] => {
  return sortSourceRows(rows.map((row) => {
    const record = toRecord(row);

    return {
      source: String(record.source ?? ""),
      leads: numberValue(record.leads),
      rate: numberValue(record.conversionRate),
    };
  }));
};

type ReportTab = "overview" | "team-performance";

const isReportTab = (value: string | null): value is ReportTab =>
  value === "overview" || value === "team-performance";

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

  useEffect(() => {
    const fetchReports = async () => {
      setIsRefreshing(true);

      try {
        const [statsData, analyticsData, managerData] = await Promise.all([
          getReportStats(),
          getLeadSourceAnalytics(),
          getManagerDashboard(),
        ]);

        setStats({
          total_leads: managerData?.totalLeads ?? 0,
          leads_assigned: statsData?.leadsAssigned ?? 0,
          converted_leads: statsData?.convertedLeads ?? 0,
          active_offers: managerData?.activeOffers ?? 0,
          offers_utilized: statsData?.offersUtilized ?? 0,
        });

        const analyticsRows = Array.isArray(analyticsData) ? analyticsData : [];

        setLeadSourceDistributionData(mergeLeadSourceRows(analyticsRows));

        setSourceConversionRateData(mergeConversionRows(analyticsRows));
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

    fetchReports();
  }, []);

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

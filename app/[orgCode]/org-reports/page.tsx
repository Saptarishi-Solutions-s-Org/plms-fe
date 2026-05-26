"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import OverviewTab from "@/components/commoncomponents/reports/Overview/overview-tab";
import ReportControls from "@/components/commoncomponents/reports/shared/report-controls";
import TeamPerformanceTab from "@/components/commoncomponents/reports/team-performance/team-performance-tab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  getLeadSourceDistribution,
  getReportStats,
  getSourceVsConversionRate,
} from "@/services/organizationreports";
import { normalizeLeadSource } from "@/types/org-reports";
import type {
  LeadSourceRow,
  OrganizationReportStats,
  ReportApiRecord,
  ReportPeriod,
  SourceConversionRateRow,
} from "@/types/org-reports";

const toRecord = (value: unknown): ReportApiRecord =>
  value && typeof value === "object" ? (value as ReportApiRecord) : {};

const numberValue = (value: unknown) => Number(value || 0);
const stringValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const mergeLeadSourceRows = (
  rows: unknown[],
): LeadSourceRow[] => {
  const merged = new Map<string, number>();

  rows.forEach((row) => {
    const record = toRecord(row);
    const source = normalizeLeadSource(stringValue(record.source));
    const leads = numberValue(record.leads);

    merged.set(source, (merged.get(source) ?? 0) + leads);
  });

  return Array.from(merged, ([source, leads]) => ({ source, leads }));
};

const mergeConversionRows = (
  rows: unknown[],
): SourceConversionRateRow[] => {
  const merged = new Map<string, { leads: number; converted: number }>();

  rows.forEach((row) => {
    const record = toRecord(row);
    const source = normalizeLeadSource(stringValue(record.source));
    const leads = numberValue(record.leads);
    const converted = numberValue(record.converted);
    const current = merged.get(source) ?? { leads: 0, converted: 0 };

    merged.set(source, {
      leads: current.leads + leads,
      converted: current.converted + converted,
    });
  });

  return Array.from(merged, ([source, row]) => ({
    source,
    leads: row.leads,
    rate:
      row.leads > 0
        ? Number(((row.converted / row.leads) * 100).toFixed(1))
        : 0,
  }));
};

export default function OrgReports() {
  const params = useParams<{ orgCode: string }>();
  const orgCode = params.orgCode;
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ReportPeriod>("this-month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

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
      setLoading(true);

      try {
        const [statsData, leadSourceData, conversionRateData] =
          await Promise.all([
            getReportStats(),
            getLeadSourceDistribution(),
            getSourceVsConversionRate(),
          ]);

        setStats({
          total_leads: statsData?.totalLeads ?? 0,
          leads_assigned: statsData?.leadsAssigned ?? 0,
          converted_leads: statsData?.convertedLeads ?? 0,
          active_offers: statsData?.activeOffers ?? 0,
          offers_utilized: statsData?.offersUtilized ?? 0,
        });

        setLeadSourceDistributionData(
          mergeLeadSourceRows(Array.isArray(leadSourceData) ? leadSourceData : []),
        );

        setSourceConversionRateData(
          mergeConversionRows(
            Array.isArray(conversionRateData) ? conversionRateData : [],
          ),
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
        setLoading(false);
      }
    };

    fetchReports();
  }, [period, dateRange]);

  const handleExport = () => {
    toast.success("Preparing report for PDF export");
    window.print();
  };

  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-5 sm:px-6">
      <div className="flex w-full flex-col gap-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              Reports
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Analyzing team performance for the current cycle
            </p>
          </div>

          <ReportControls
            period={period}
            onPeriodChange={setPeriod}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onExport={handleExport}
          />
        </div>

        <Tabs defaultValue="overview" className="w-full items-stretch gap-6">
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
            <TeamPerformanceTab
              stats={[]}
              rows={[]}
              orgCode={orgCode}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

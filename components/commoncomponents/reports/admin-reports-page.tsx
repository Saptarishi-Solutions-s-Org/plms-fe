"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

import GlobalLoader from "@/components/commoncomponents/globalloader";
import ReportStats from "@/components/commoncomponents/reports/Overview/stats";
import { SourceVsConversionRate } from "@/components/commoncomponents/reports/Overview/source-vs-conversion-rate";
import ManagerPerformanceCard from "@/components/commoncomponents/reports/manager-performance-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getExecutivesForManager } from "@/services/organizationAdmin";
import {
  getLeadSourceAnalytics,
  getReportLeads,
  getReportManagerPerformance,
  getReportManagers,
  getReportStats,
} from "@/services/organizationreports";
import type {
  LeadSourceAnalyticsRow,
  LeadWithStatsApiRow,
  OrganizationReportStats,
  SourceConversionRateRow,
} from "@/types/org-reports";

type Person = { id: string; name: string };
type ManagerPerformance = Person & {
  executives: Person[];
  leads: number;
  converted: number;
  conversionRate: number;
};

const emptyStats: OrganizationReportStats = {
  total_leads: 0,
  leads_assigned: 0,
  converted_leads: 0,
  active_offers: 0,
  offers_utilized: 0,
  total_users: 0,
  active_users: 0,
};

const unwrap = (response: unknown): unknown =>
  response && typeof response === "object" && "value" in response
    ? (response as { value?: unknown }).value
    : response;

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};

const toPeople = (response: unknown, key: string): Person[] => {
  const data = unwrap(response);
  const rows = Array.isArray(data)
    ? data
    : data && typeof data === "object"
      ? [key, "items", "results", "data"]
          .map((candidate) => (data as Record<string, unknown>)[candidate])
          .find(Array.isArray) ?? []
      : [];

  return Array.isArray(rows)
    ? rows
        .map((row) => {
          const record = toRecord(row);
          return {
            id: String(
              record.id ?? record.userId ?? record.executiveId ?? "",
            ),
            name: String(
              record.name ?? record.userName ?? record.executiveName ?? "-",
            ),
          };
        })
        .filter((row) => row.id)
    : [];
};

const toRows = (response: unknown, keys: string[]): Record<string, unknown>[] => {
  const data = unwrap(response);

  if (Array.isArray(data)) return data.map(toRecord);
  if (!data || typeof data !== "object") return [];

  const record = toRecord(data);
  const rows = keys.map((key) => record[key]).find(Array.isArray);
  return Array.isArray(rows) ? rows.map(toRecord) : [];
};

const getManagerId = (row: Record<string, unknown>) =>
  String(row.managerId ?? row.userId ?? row.id ?? "");

const getNumber = (row: Record<string, unknown>, keys: string[]) => {
  const value = keys.map((key) => row[key]).find((item) => item != null);
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const getReportLeadRows = (response: unknown): LeadWithStatsApiRow[] => {
  const data = unwrap(response);
  const record = toRecord(data);

  if (Array.isArray(data)) return data as LeadWithStatsApiRow[];
  return Array.isArray(record.leads)
    ? (record.leads as LeadWithStatsApiRow[])
    : [];
};

const downloadCsv = (filename: string, headers: string[], rows: unknown[][]) => {
  if (!rows.length) {
    toast.info("There is no data to export");
    return;
  }

  const escape = (value: unknown) => {
    const text = String(value ?? "").replace(/"/g, '""');
    return /[,"\n]/.test(text) ? `"${text}"` : text;
  };
  const csv = [headers, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export default function AdminReportsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab =
    searchParams.get("tab") === "organization-performance"
      ? "organization-performance"
      : "overview";
  const selectedManagerId = searchParams.get("managerId");
  const selectedExecutiveId = searchParams.get("executiveId");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(emptyStats);
  const [sourceConversion, setSourceConversion] = useState<
    SourceConversionRateRow[]
  >([]);
  const [managers, setManagers] = useState<ManagerPerformance[]>([]);
  const [leads, setLeads] = useState<LeadWithStatsApiRow[]>([]);
  const [executiveLeads, setExecutiveLeads] = useState<LeadWithStatsApiRow[]>(
    [],
  );

  const replaceQuery = useCallback(
    (changes: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [
          statsResponse,
          analyticsResponse,
          managersResponse,
          managerPerformanceResponse,
        ] =
          await Promise.all([
            getReportStats(),
            getLeadSourceAnalytics(),
            getReportManagers(),
            getReportManagerPerformance(),
          ]);
        const reportStats = toRecord(unwrap(statsResponse));
        const managerRows = toPeople(managersResponse, "managers");
        const performanceByManager = new Map(
          toRows(managerPerformanceResponse, ["managers", "data", "items", "results"])
            .map((row) => [getManagerId(row), row] as const)
            .filter(([managerId]) => managerId),
        );
        const managerExecutives = await Promise.all(
          managerRows.map(async (manager) => ({
            manager,
            executives: toPeople(
              await getExecutivesForManager(manager.id),
              "executives",
            ),
          })),
        );

        setManagers(
          managerExecutives.map(({ manager, executives }) => {
            const performance = performanceByManager.get(manager.id) ?? {};
            const leads = getNumber(performance, [
              "leads",
              "leadsAssigned",
              "totalLeads",
              "total",
            ]);
            const converted = getNumber(performance, [
              "converted",
              "convertedLeads",
              "qualified",
            ]);
            const reportedRate = getNumber(performance, [
              "conversionRate",
              "rate",
            ]);
            return {
              ...manager,
              executives,
              leads,
              converted,
              conversionRate:
                reportedRate ||
                (leads ? Math.round((converted / leads) * 100) : 0),
            };
          }),
        );
        setStats({
          total_leads: Number(
            reportStats.totalLeads ?? reportStats.total_leads ?? 0,
          ),
          leads_assigned: Number(
            reportStats.leadsAssigned ?? reportStats.leads_assigned ?? 0,
          ),
          converted_leads: Number(
            reportStats.convertedLeads ?? reportStats.converted_leads ?? 0,
          ),
          active_offers: Number(
            reportStats.activeOffers ?? reportStats.active_offers ?? 0,
          ),
          offers_utilized: Number(
            reportStats.offersUtilized ?? reportStats.offers_utilized ?? 0,
          ),
          total_users: Number(
            reportStats.totalUsers ?? reportStats.total_users ?? 0,
          ),
          active_users: Number(
            reportStats.activeUsers ?? reportStats.active_users ?? 0,
          ),
        });
        const analytics = unwrap(analyticsResponse);
        const analyticsRecord = toRecord(analytics);
        const analyticsRows: LeadSourceAnalyticsRow[] = Array.isArray(analytics)
          ? analytics
          : Array.isArray(analyticsRecord.data)
            ? (analyticsRecord.data as LeadSourceAnalyticsRow[])
            : [];
        setSourceConversion(
          analyticsRows.map((row) => ({
            source: row.source,
            leads: Number(row.leads || 0),
            rate: Number(row.conversionRate || 0),
          })),
        );
      } catch {
        toast.error("Failed to load organization reports");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const manager = managers.find((row) => row.id === selectedManagerId);

    if (!manager) {
      setLeads([]);
      return;
    }

    const loadManagerExecutiveLeads = async () => {
      try {
        const responses = await Promise.all(
          manager.executives.map((executive) =>
            getReportLeads({ assignedTo: executive.id, limit: 100 }),
          ),
        );
        setLeads(responses.flatMap(getReportLeadRows));
      } catch {
        setLeads([]);
        toast.error("Failed to load executive performance");
      }
    };

    loadManagerExecutiveLeads();
  }, [managers, selectedManagerId]);

  useEffect(() => {
    if (!selectedExecutiveId) {
      setExecutiveLeads([]);
      return;
    }

    const loadExecutiveLeads = async () => {
      try {
        const response = await getReportLeads({
          assignedTo: selectedExecutiveId,
          limit: 100,
        });
        setExecutiveLeads(getReportLeadRows(response));
      } catch {
        setExecutiveLeads([]);
        toast.error("Failed to load executive leads");
      }
    };

    loadExecutiveLeads();
  }, [selectedExecutiveId]);

  const selectedManager = managers.find(
    (manager) => manager.id === selectedManagerId,
  );
  const selectedExecutive = selectedManager?.executives.find(
    (executive) => executive.id === selectedExecutiveId,
  );
  const executiveRows = useMemo(
    () =>
      (selectedManager?.executives ?? []).map((executive) => {
        const executiveLeads = leads.filter(
          (lead) => lead.assignedTo === executive.id,
        );
        const converted = executiveLeads.filter(
          (lead) => lead.status?.toLowerCase() === "qualified",
        ).length;
        return {
          ...executive,
          leads: executiveLeads.length,
          converted,
          conversionRate: executiveLeads.length
            ? Math.round((converted / executiveLeads.length) * 100)
            : 0,
        };
      }),
    [leads, selectedManager],
  );
  if (loading) return <GlobalLoader />;

  return (
    <div className="h-full w-full space-y-6 p-4 sm:p-6">
      <div className="flex w-full flex-col gap-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl">
            Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Organization performance and reporting hierarchy
          </p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(tab) =>
            replaceQuery({ tab, managerId: null, executiveId: null })
          }
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
              value="organization-performance"
              className="h-11 px-5 text-sm font-semibold data-[state=active]:text-blue-600 data-[state=active]:after:bg-blue-600"
            >
              Organization Performance
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="w-full">
          <div className="w-full space-y-6">
            <div className="w-full overflow-x-auto">
              <ReportStats stats={stats} variant="admin" />
            </div>
            <section className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="w-full min-w-0 overflow-hidden rounded-lg">
                <ManagerPerformanceCard managers={managers} />
              </div>
              <div className="w-full min-w-0 overflow-hidden rounded-lg">
                <SourceVsConversionRate
                  title="Source vs Conversion Rate"
                  data={sourceConversion}
                />
              </div>
            </section>
          </div>
        </TabsContent>
        <TabsContent value="organization-performance" className="w-full">
          {selectedExecutive ? (
            <PerformanceTable
              title={`${selectedExecutive.name} Leads`}
              onBack={() => replaceQuery({ executiveId: null })}
              exportAction={() =>
                downloadCsv(
                  "ExecutiveLeadsReport",
                  ["Lead", "Status", "Source", "Assigned By"],
                  executiveLeads.map((lead) => [
                    lead.name,
                    lead.status,
                    lead.leadSource ?? lead.source,
                    lead.createdByName,
                  ]),
                )
              }
              headers={["Lead", "Status", "Source", "Assigned By"]}
              rows={executiveLeads.map((lead) => [
                lead.name ?? "-",
                lead.status ?? "-",
                (lead.leadSource ?? lead.source ?? "-").replace(/_/g, " "),
                lead.createdByName ?? "-",
              ])}
            />
          ) : selectedManager ? (
            <PerformanceTable
              title={`${selectedManager.name} Executives`}
              onBack={() => replaceQuery({ managerId: null })}
              exportAction={() =>
                downloadCsv(
                  "ManagerExecutivesReport",
                  ["Executive", "Leads", "Converted", "Conversion Rate"],
                  executiveRows.map((row) => [
                    row.name,
                    row.leads,
                    row.converted,
                    `${row.conversionRate}%`,
                  ]),
                )
              }
              headers={[
                "Executive",
                "Leads Assigned",
                "Converted",
                "Conversion Rate",
                "Detail",
              ]}
              rows={executiveRows.map((row) => [
                row.name,
                row.leads,
                row.converted,
                <Performance key={`${row.id}-rate`} value={row.conversionRate} />,
                <ViewButton
                  key={`${row.id}-view`}
                  onClick={() => replaceQuery({ executiveId: row.id })}
                />,
              ])}
            />
          ) : (
            <PerformanceTable
              title="Managers"
              exportAction={() =>
                downloadCsv(
                  "OrganizationManagersReport",
                  ["Manager", "Executives", "Leads", "Conversion Rate"],
                  managers.map((manager) => [
                    manager.name,
                    manager.executives.length,
                    manager.leads,
                    `${manager.conversionRate}%`,
                  ]),
                )
              }
              headers={[
                "Manager",
                "Executives",
                "Leads Assigned",
                "Conversion Rate",
                "Detail",
              ]}
              rows={managers.map((manager) => [
                manager.name,
                manager.executives.length,
                manager.leads,
                <Performance
                  key={`${manager.id}-rate`}
                  value={manager.conversionRate}
                />,
                <ViewButton
                  key={`${manager.id}-view`}
                  onClick={() => replaceQuery({ managerId: manager.id })}
                />,
              ])}
            />
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

function Performance({ value }: { value: number }) {
  return (
    <div className="flex min-w-40 items-center gap-3">
      <Progress
        value={value}
        className="h-2 w-24 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-blue-600"
      />
      <span className="text-gray-600">{value}%</span>
    </div>
  );
}

function ViewButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={onClick}
      className="rounded-md bg-blue-50 text-xs font-bold text-blue-600 hover:bg-blue-100"
    >
      View
    </Button>
  );
}

function PerformanceTable({
  title,
  headers,
  rows,
  exportAction,
  onBack,
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
  exportAction: () => void;
  onBack?: () => void;
}) {
  return (
    <section className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="size-9 rounded-md p-0"
              aria-label="Go back"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {title}
          </h2>
        </div>
        <Button
          onClick={exportAction}
          className="h-10 rounded-md bg-green-600 px-4 text-white hover:bg-green-700"
        >
          <Download className="size-4" /> Export
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="border-b border-gray-200 bg-[#7677F41A]">
            <TableRow>
              {headers.map((header) => (
                <TableHead
                  key={header}
                  className="whitespace-nowrap text-sm font-semibold sm:text-base"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    className="py-4 text-sm text-gray-600 sm:text-base"
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className="py-12 text-center text-sm font-semibold text-gray-400"
                >
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

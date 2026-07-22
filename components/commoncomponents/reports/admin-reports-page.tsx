"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";

import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import GlobalLoader from "@/components/commoncomponents/globalloader";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
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
import {
  getLeadSourceAnalytics,
  getReportExecutivesForManager,
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
import { createPaginationMeta } from "@/types/pagination";

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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getUser());
  const canExportReports = useMemo(
    () => canAccess(currentUser, ["reports"], ["export"]),
    [currentUser],
  );

  useEffect(() => {
    const syncUser = () => setCurrentUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);

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
              await getReportExecutivesForManager(manager.id),
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
  const handleHeaderExport = () => {
    if (selectedExecutive) {
      downloadCsv(
        "ExecutiveLeadsReport",
        ["S.NO", "Lead", "Status", "Source", "Assigned By"],
        executiveLeads.map((lead, index) => [
          index + 1,
          lead.name,
          lead.status,
          lead.leadSource ?? lead.source,
          lead.createdByName,
        ]),
      );
      return;
    }

    if (selectedManager) {
      downloadCsv(
        "ManagerExecutivesReport",
        ["S.NO", "Executive", "Leads", "Converted", "Conversion Rate"],
        executiveRows.map((row, index) => [
          index + 1,
          row.name,
          row.leads,
          row.converted,
          `${row.conversionRate}%`,
        ]),
      );
      return;
    }

    downloadCsv(
      "OrganizationManagersReport",
      ["S.NO", "Manager", "Executives", "Leads", "Conversion Rate"],
      managers.map((manager, index) => [
        index + 1,
        manager.name,
        manager.executives.length,
        manager.leads,
        `${manager.conversionRate}%`,
      ]),
    );
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="h-full w-full space-y-6 p-4 sm:p-6">
      <div className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl">
              Reports
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Organization performance and reporting hierarchy
            </p>
          </div>
          {canExportReports && activeTab === "organization-performance" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleHeaderExport}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
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
                key={`executive-${selectedExecutive.id}`}
                title={`${selectedExecutive.name} Leads`}
                totalLabel="leads"
                onBack={() => replaceQuery({ executiveId: null })}
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
                key={`manager-${selectedManager.id}`}
                title={`${selectedManager.name} Executives`}
                totalLabel="executives"
                onBack={() => replaceQuery({ managerId: null })}
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
                key="managers"
                title="Managers"
                totalLabel="managers"
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
  onBack,
  totalLabel,
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
  onBack?: () => void;
  totalLabel: string;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const pagination = createPaginationMeta({ page, limit, total: rows.length });
  const currentPage = Math.min(page, pagination.totalPages);
  const currentPagination =
    currentPage === page
      ? pagination
      : createPaginationMeta({
        page: currentPage,
        limit,
        total: rows.length,
      });
  const startIndex = (currentPage - 1) * limit;
  const paginatedRows = rows.slice(startIndex, startIndex + limit);

  return (
    <section className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              asChild={false}
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="p-2 text-gray-500 hover:text-purple-600 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            {title}
          </h2>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="border-b border-gray-200 bg-[#7677F41A]">
            <TableRow>
              <TableHead className="w-20 whitespace-nowrap text-sm font-semibold sm:text-base">
                S.NO
              </TableHead>
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
            {paginatedRows.map((row, rowIndex) => (
              <TableRow key={startIndex + rowIndex}>
                <TableCell className="py-4 text-sm text-gray-600 sm:text-base">
                  {startIndex + rowIndex + 1}
                </TableCell>
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
      <TablePaginationFooter
        pagination={currentPagination}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        totalLabel={totalLabel}
      />
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Download, Users } from "lucide-react";
import { endOfDay, format, startOfDay } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type AuthUser, getUser } from "@/lib/auth";
import { canAccess } from "@/lib/permissions";
import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/commoncomponents/daterange";
import type { DateRange } from "@/components/commoncomponents/react-day-picker";
import { useExecutiveLeadsExport } from "@/hooks/export";
import { useUrlPagination } from "@/hooks/use-url-pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ExecutiveLeadRow,
  ExecutiveLeadSummary,
  ExecutiveLeadsProps,
  LeadWithStatsApiRow,
  LeadsWithStatsResponse,
} from "@/types/org-reports";
import { createPaginationMeta } from "@/types/pagination";
import { getReportLeads } from "@/services/organizationreports";

const formatSource = (source?: string) => {
  if (!source) {
    return "-";
  }

  return source.replace(/_/g, " ");
};

const isWithinDateRange = (createdAt: string | undefined, range?: DateRange) => {
  if (!range?.from) {
    return true;
  }

  if (!createdAt) {
    return false;
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return false;
  }

  return (
    createdDate >= startOfDay(range.from) &&
    createdDate <= endOfDay(range.to ?? range.from)
  );
};

const mapApiLeadToRow = (lead: LeadWithStatsApiRow): ExecutiveLeadRow => ({
  id: lead.id,
  leadName: lead.name || "-",
  status: lead.status || "-",
  source: formatSource(lead.leadSource || lead.source),
  assignedBy: lead.createdByName || "-",
  createdById: lead.createdById,
});

const parseDate = (value: string | null) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const formatDate = (date: Date) => format(date, "yyyy-MM-dd");

const parseDateRange = (searchParams: URLSearchParams): DateRange | undefined => {
  const from = parseDate(searchParams.get("from"));
  const to = parseDate(searchParams.get("to"));

  if (!from) {
    return undefined;
  }

  return to ? { from, to } : { from };
};

const buildSummary = (
  rows: ExecutiveLeadRow[],
  executiveId: string,
  managerId?: string,
): ExecutiveLeadSummary => ({
  totalCreated: rows.length,
  byExecutives: rows.filter((lead) => lead.createdById === executiveId).length,
  byManager: rows.filter((lead) => lead.createdById === managerId).length,
});

export default function ExecutiveLeadsPage({
  orgCode,
  executiveId,
  summary,
  leads,
}: ExecutiveLeadsProps) {
  const { page, limit, setPage, setLimit } = useUrlPagination();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [leadRows, setLeadRows] = useState(leads || []);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getUser());
  const canExportReports = useMemo(
    () => canAccess(currentUser, ["reports"], ["export"]),
    [currentUser],
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() =>
    parseDateRange(searchParams),
  );
  const appliedDateRange = useMemo(
    () => parseDateRange(searchParams),
    [searchParams],
  );
  const { handleExport } = useExecutiveLeadsExport(leadRows);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getUser());
    window.addEventListener("LMA-auth-changed", syncUser);
    return () => window.removeEventListener("LMA-auth-changed", syncUser);
  }, []);

  const pagination = useMemo(
    () =>
      createPaginationMeta({
        page,
        limit,
        total: leadRows.length,
      }),
    [leadRows.length, limit, page],
  );

  const paginatedLeadRows = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;

    return leadRows.slice(startIndex, startIndex + pagination.limit);
  }, [leadRows, pagination.limit, pagination.page]);

  const [leadSummary, setLeadSummary] = useState(
    summary || {
      totalCreated: 0,
      byExecutives: 0,
      byManager: 0,
    },
  );

  useEffect(() => {
    const fetchLeadStats = async () => {
      try {
        const data = (await getReportLeads()) as LeadsWithStatsResponse;
        const leads = data?.leads;

        const filteredLeads = Array.isArray(leads)
          ? leads.filter(
            (lead) =>
              lead.assignedTo === executiveId &&
              isWithinDateRange(
                lead.createdAt ?? lead.createdat,
                appliedDateRange,
              ),
          )
          : [];

        const rows = filteredLeads.map(mapApiLeadToRow);

        setLeadRows(rows);
        setLeadSummary(buildSummary(rows, executiveId, getUser()?.id));
      } catch (error) {
        console.error("Failed to fetch lead stats:", error);
      }
    };

    fetchLeadStats();
  }, [appliedDateRange, executiveId]);

  useEffect(() => {
    setDateRange(appliedDateRange);
  }, [appliedDateRange]);

  const replaceDateRange = useCallback(
    (range?: DateRange) => {
      const params = new URLSearchParams(searchParams.toString());

      if (range?.from) {
        params.set("from", formatDate(range.from));
        if (range.to) {
          params.set("to", formatDate(range.to));
        } else {
          params.delete("to");
        }
      } else {
        params.delete("from");
        params.delete("to");
      }

      params.set("page", "1");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const handleClearDateRange = () => {
    setDateRange(undefined);
    replaceDateRange(undefined);
  };

  const handleApplyDateRange = () => {
    replaceDateRange(dateRange);
  };

  useEffect(() => {
    if (page > pagination.totalPages) {
      setPage(pagination.totalPages);
    }
  }, [page, pagination.totalPages, setPage]);

  const summaryCards = [
    {
      label: "Total Created",
      value: leadSummary.totalCreated,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "By Executives",
      value: leadSummary.byExecutives,
      icon: BriefcaseBusiness,
      color: "bg-green-500",
    },
    {
      label: "By Manager",
      value: leadSummary.byManager,
      icon: BriefcaseBusiness,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="h-full w-full space-y-6 p-4 sm:p-6">
      <div className="flex w-full flex-col gap-6">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-purple-600 rounded-xl"
            >
              <Link
                href={`/${orgCode}/org-reports/?tab=team-performance`}
                aria-label="Back to reports"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Report Details
              </h1>
              <p className="text-xs text-gray-500">
                Review executive lead activity and performance
              </p>
            </div>
          </div>
          {canExportReports && (
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              disabled={leadRows.length === 0}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-full px-4 sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </header>

        <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <CardContent className="mt-2 p-0">
                <p className="text-5xl font-semibold text-gray-900">
                  {value.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="w-full">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Detailed Breakdown - Leads Created
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Full list of generated leads.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
              <DateRangeFilter
                value={dateRange}
                onChange={setDateRange}
                placeholder="Select date range"
                className="h-10 w-full justify-between rounded-md bg-white px-3 font-normal sm:w-52"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleClearDateRange}
                className="h-10 rounded-md px-4"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={handleApplyDateRange}
                aria-pressed={appliedDateRange === dateRange}
                className="h-10 rounded-md bg-blue-600 px-4 text-white hover:bg-blue-700"
              >
                Apply
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <Table>
              <TableHeader className="border-b border-gray-200 bg-[#7677F41A]">
                <TableRow>
                  <TableHead className="w-[80px] whitespace-nowrap text-xs sm:text-sm">
                    S.No
                  </TableHead>
                  <TableHead className="w-[280px] whitespace-nowrap text-xs sm:text-sm">
                    Lead Name
                  </TableHead>
                  <TableHead className="w-[160px] whitespace-nowrap text-xs sm:text-sm">
                    Status
                  </TableHead>
                  <TableHead className="w-[180px] whitespace-nowrap text-xs sm:text-sm">
                    Source
                  </TableHead>
                  <TableHead className="w-[220px] whitespace-nowrap text-xs sm:text-sm">
                    Assigned By
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {leadRows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-sm font-semibold text-gray-400"
                    >
                      No leads found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeadRows.map((lead, index) => (
                    <TableRow key={lead.id || `${lead.leadName}-${index}`}>
                      <TableCell className="w-[80px] text-gray-600">
                        {(pagination.page - 1) * pagination.limit + index + 1}
                      </TableCell>
                      <TableCell
                        title={lead.leadName}
                        className="w-[280px] max-w-[180px] font-medium text-gray-800 sm:max-w-[220px]"
                      >
                        {lead.leadName}
                      </TableCell>
                      <TableCell className="w-[160px]">
                        {lead.status || "-"}
                      </TableCell>
                      <TableCell className="w-[180px] text-gray-600">
                        {lead.source}
                      </TableCell>
                      <TableCell className="w-[220px] text-gray-600">
                        {lead.assignedBy}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <TablePaginationFooter
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={setLimit}
            totalLabel="leads"
          />
        </section>
      </div>
    </div>
  );
}

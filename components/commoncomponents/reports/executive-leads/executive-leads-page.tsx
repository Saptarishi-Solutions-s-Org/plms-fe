"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Download, Users } from "lucide-react";
import { endOfDay, startOfDay } from "date-fns";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DateRangeFilter } from "@/components/commoncomponents/daterange";
import type { DateRange } from "@/components/commoncomponents/react-day-picker";
import { useExecutiveLeadsExport } from "@/hooks/export";

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
import { getLeadsWithStats } from "@/services/leads";



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
  const [leadRows, setLeadRows] = useState(leads || []);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange>();
  const { handleExport } = useExecutiveLeadsExport(leadRows);

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
        const data = (await getLeadsWithStats()) as LeadsWithStatsResponse;
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
    <div className="min-h-screen w-full bg-slate-50 px-4 py-4 sm:px-6">
      <div className="flex w-full flex-col gap-6">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-full shrink-0"
            >
              <Link
                href={`/${orgCode}/org-reports/?tab=team-performance`}
                aria-label="Back to reports"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Report Details
              </h1>
            </div>
          </div>
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
              <h2 className="text-[1.7rem] font-bold tracking-tight text-slate-900">
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
                className="h-10 w-full justify-between rounded-xl bg-white px-3 font-normal sm:w-52"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDateRange(undefined);
                  setAppliedDateRange(undefined);
                }}
                className="h-10 rounded-xl px-4"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={() => setAppliedDateRange(dateRange)}
                aria-pressed={appliedDateRange === dateRange}
                className="h-10 rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-700"
              >
                Apply
              </Button>
              <Button
                type="button"
                onClick={handleExport}
                className="h-10 rounded-xl bg-green-600 px-4 text-white hover:bg-green-700"
              >
                <Download className="size-4" />
                Export
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
                  leadRows.map((lead, index) => (
                    <TableRow key={lead.id || `${lead.leadName}-${index}`}>
                      <TableCell className="w-[80px] text-gray-600">
                        {index + 1}
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
        </section>
      </div>
    </div>
  );
}

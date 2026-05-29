"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

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
} from "@/types/org-reports";
import { LEAD_SOURCE_OPTIONS } from "@/types/leadtypes";
import { getLeadsWithStats } from "@/services/leads";

type LeadWithStatsApiRow = {
  uuid?: string;
  id?: string;
  leadCode?: string;
  name?: string;
  status?: string;
  leadSource?: string;
  source?: string;
  createdByName?: string;
  assignedTo?: string;
};

type LeadsWithStatsResponse = {
  leads?: LeadWithStatsApiRow[];
  stats?: {
    total?: number | string;
  };
};

const sourceLabels = LEAD_SOURCE_OPTIONS.reduce<Record<string, string>>(
  (labels, option) => {
    labels[option.value.toLowerCase()] = option.label;
    labels[option.label.toLowerCase()] = option.label;
    labels[option.value.replace(/_/g, " ").toLowerCase()] = option.label;
    return labels;
  },
  {
    facebook: "Social Media",
    instagram: "Social Media",
    linkedin: "Social Media",
    "google ads": "Advertisement",
    website: "Manual Entry",
    "cold call": "Manual Entry",
  },
);

const formatSource = (source?: string) => {
  if (!source) {
    return "-";
  }

  return sourceLabels[source.toLowerCase()] || source.replace(/_/g, " ");
};

const mapApiLeadToRow = (
  lead: LeadWithStatsApiRow,
  index: number,
): ExecutiveLeadRow => ({
  id: lead.uuid || lead.id || lead.leadCode || `lead-${index}`,
  leadName: lead.name || "-",
  status: lead.status || "-",
  source: formatSource(lead.leadSource || lead.source),
  assignedBy: lead.createdByName || "-",
});

const buildSummary = (rows: ExecutiveLeadRow[]): ExecutiveLeadSummary => ({
  totalCreated: rows.length,
  byExecutives: rows.filter((lead) => lead.assignedBy !== "System").length,
  byManager: rows.filter((lead) => lead.assignedBy === "System").length,
});

export default function ExecutiveLeadsPage({
  orgCode,
  executiveId,
  executiveName,
  summary,
  leads,
}: ExecutiveLeadsProps) {
  const [leadRows, setLeadRows] = useState(leads || []);

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

        const filteredLeads = Array.isArray(data?.leads)
          ? data.leads.filter((lead) => lead.assignedTo === executiveId)
          : [];

        const rows = filteredLeads.map(mapApiLeadToRow);

        setLeadRows(rows);
        setLeadSummary(buildSummary(rows));
      } catch (error) {
        console.error("Failed to fetch lead stats:", error);
      }
    };

    fetchLeadStats();
  }, [executiveId]);

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
              className="h-9 px-2 text-sm font-semibold text-slate-500"
            >
              <Link href={`/${orgCode}/org-reports`}>
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Report Details
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Leads under {executiveName}
              </p>
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
          <div className="mb-4">
            <h2 className="text-[1.7rem] font-bold tracking-tight text-slate-900">
              Detailed Breakdown - Leads Created
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Full list of leads generated during the selected period.
            </p>
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
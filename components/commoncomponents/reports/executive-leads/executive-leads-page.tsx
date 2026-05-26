"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, FileDown, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeadExport } from "@/hooks/export";
import type { ExecutiveLeadsProps } from "@/types/org-reports";

const statusClasses = {
  New: "bg-blue-50 text-blue-600",
  Contacted: "bg-purple-50 text-purple-600",
  Converted: "bg-emerald-50 text-emerald-600",
  Qualified: "bg-amber-50 text-amber-600",
};

export default function ExecutiveLeadsPage({
  orgCode,
  executiveName,
  summary,
  leads,
}: ExecutiveLeadsProps) {
  const { handleExport: exportCsv } = useLeadExport();

  const summaryCards = [
    {
      label: "Total Created",
      value: summary.totalCreated,
      icon: Users,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "By Executives",
      value: summary.byExecutives,
      icon: BriefcaseBusiness,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "By Manager",
      value: summary.byManager,
      icon: BriefcaseBusiness,
      tone: "bg-amber-50 text-amber-600",
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
              <h1 className="text-xl font-bold text-slate-900">Report Details</h1>
              <p className="text-xs font-medium text-slate-500">
                Leads under {executiveName}
              </p>
            </div>
          </div>

          <Button
            onClick={() => {
              toast.success("Preparing report for PDF export");
              window.print();
            }}
            className="h-10 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700"
          >
            <FileDown className="size-4" />
            Export PDF
          </Button>
        </header>

        <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {summaryCards.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} className="w-full rounded-xl border-slate-200 bg-white">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex size-12 items-center justify-center rounded-full ${tone}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900">
                    {value.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="w-full rounded-xl border-slate-200 bg-white">
          <CardContent className="p-0">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Detailed Breakdown - Leads Created
                </h2>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Full list of leads generated during the selected period.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={exportCsv}
                className="h-9 rounded-lg bg-slate-50 text-xs font-bold"
              >
                <FileDown className="size-4" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="hover:bg-slate-50">
                    <TableHead className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Date
                    </TableHead>
                    <TableHead className="min-w-44 px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Lead Name
                    </TableHead>
                    <TableHead className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </TableHead>
                    <TableHead className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Source
                    </TableHead>
                    <TableHead className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Assigned By
                    </TableHead>
                    <TableHead className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Offer
                    </TableHead>
                    <TableHead className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Converted
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-slate-50/80">
                      <TableCell className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-600">
                        {lead.date}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm font-bold text-slate-900">
                        {lead.leadName}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge className={statusClasses[lead.status]}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-600">
                        {lead.source}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-600">
                        {lead.assignedBy}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm font-medium text-slate-600">
                        {lead.offer}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        <Checkbox checked={lead.converted} disabled />
                      </TableCell>
                    </TableRow>
                  ))}
                  {leads.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="px-5 py-10 text-center text-sm font-semibold text-slate-400"
                      >
                        No leads found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="border-t border-slate-100 px-5 py-4 text-xs font-semibold text-slate-500">
              Showing {leads.length ? 1 : 0} to {leads.length} of{" "}
              {summary.totalCreated} leads
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

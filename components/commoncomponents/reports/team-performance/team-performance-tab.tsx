"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, FileText, Search, Timer, TrendingUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TeamPerformanceProps } from "@/types/org-reports";

const statIcons = [Award, TrendingUp, FileText, Timer];

const statToneClasses = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

export default function TeamPerformanceTab({
  stats,
  rows,
  orgCode,
}: TeamPerformanceProps) {
  const [search, setSearch] = useState("");
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return rows;
    }

    return rows.filter((row) =>
      `${row.executiveName} ${row.role}`.toLowerCase().includes(query),
    );
  }, [rows, search]);

  return (
    <div className="w-full space-y-6">
      <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index % statIcons.length];

          return (
            <Card key={stat.label} className="w-full rounded-lg border-slate-200 bg-white">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                    statToneClasses[stat.tone]
                  }`}
                >
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {stat.helper}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card className="w-full rounded-lg border-slate-200 bg-white">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-900">Team Breakdown</h2>

            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search executive..."
                className="h-10 rounded-none border-slate-200 bg-white pl-9 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="hover:bg-slate-50">
                  <TableHead className="min-w-56 px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Executive
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Leads Assigned
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Offers Assigned
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Offers By Manager
                  </TableHead>
                  <TableHead className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Converted
                  </TableHead>
                  <TableHead className="min-w-36 px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Conv. Rate
                  </TableHead>
                  <TableHead className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Detail
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.executiveId} className="hover:bg-slate-50/80">
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage src={row.avatarUrl} alt={row.executiveName} />
                          <AvatarFallback>
                            {row.executiveName
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {row.executiveName}
                          </p>
                          <p className="text-xs font-medium text-slate-400">
                            {row.role}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-bold text-slate-900">
                      {row.leadsAssigned}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-bold text-slate-900">
                      {row.offersAssigned}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-bold text-slate-900">
                      {row.offersByManager}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm font-bold text-emerald-600">
                      {row.converted}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Progress
                          value={row.conversionRate}
                          className="h-2 w-20 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-blue-600"
                        />
                        <span className="text-sm font-bold text-slate-700">
                          {row.conversionRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="rounded-md bg-blue-50 text-xs font-bold text-blue-600 hover:bg-blue-100"
                      >
                        <Link
                          href={`/${orgCode}/org-reports/executive/${row.executiveId}`}
                        >
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-5 py-10 text-center text-sm font-semibold text-slate-400"
                    >
                      No executives found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs font-semibold text-slate-500">
            <span>
              Showing {filteredRows.length} of {rows.length} executives
            </span>
            <span>1 of 1</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

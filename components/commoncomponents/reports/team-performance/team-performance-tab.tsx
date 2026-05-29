"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import type { ElementType } from "react";
import {
  Award,
  CheckCircle,
  FileText,
  Percent,
  Search,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
import { getExecutiveUsers } from "@/services/leads";
import { getExecutivePerformance } from "@/services/managerdashboard";

type ExecutiveUserRecord = {
  id?: string;
  name?: string;
};

type ExecutivePerformanceRecord = {
  id?: string;
  executiveId?: string;
  executiveName?: string;
  total?: number | string;
  qualified?: number | string;
  converted?: number | string;
};

type TeamPerformanceStatCard = {
  label: string;
  value: string;
  helper: string;
  Icon: ElementType;
  color: string;
};

const fallbackStatIcons = [Users, Award, FileText, CheckCircle, Percent];
const fallbackStatColors = [
  "bg-indigo-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-orange-400",
  "bg-purple-500",
];

const numberValue = (value: unknown) => Number(value || 0);

const normalizeName = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const executivePathId = (id: string, name: string) => {
  if (id) return id;

  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export default function TeamPerformanceTab({
  stats,
  rows,
  orgCode,
}: TeamPerformanceProps) {
  const [executives, setExecutives] = useState(rows);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        setLoading(true);

        const [userData, performanceData] = await Promise.all([
          getExecutiveUsers().catch(() => []),
          getExecutivePerformance().catch(() => []),
        ]);

        const users = Array.isArray(userData)
          ? (userData as ExecutiveUserRecord[])
          : [];
        const performanceRows = Array.isArray(performanceData)
          ? (performanceData as ExecutivePerformanceRecord[])
          : [];

        const performanceByName = new Map(
          performanceRows.map((row) => [normalizeName(row.executiveName), row]),
        );

        const sourceRows =
          users.length > 0
            ? users.map((user) => ({
                executiveId: user.id ?? "",
                executiveName: user.name ?? "Unnamed Executive",
                performance: performanceByName.get(normalizeName(user.name)),
              }))
            : performanceRows.map((performance) => ({
                executiveId: performance.executiveId ?? performance.id ?? "",
                executiveName:
                  performance.executiveName ?? "Unnamed Executive",
                performance,
              }));

        const mappedRows = sourceRows.map((row) => {
          const performance = row.performance;
          const leadsAssigned = numberValue(performance?.total);
          const converted = numberValue(
            performance?.converted ?? performance?.qualified,
          );

          return {
            executiveId: row.executiveId,
            executiveName: row.executiveName,
            role: "Executive",
            avatarUrl: "",
            leadsAssigned,
            offersAssigned: 0,
            offersByManager: 0,
            converted,
            conversionRate:
              leadsAssigned > 0
                ? Math.round((converted / leadsAssigned) * 100)
                : 0,
          };
        });

        setExecutives(mappedRows.length > 0 ? mappedRows : rows);
      } catch (error) {
        console.error("Failed to fetch executives:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutives();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return executives;
    }

    return executives.filter((row) =>
      `${row.executiveName} ${row.role}`.toLowerCase().includes(query),
    );
  }, [executives, search]);

  const performanceRows = useMemo(() => {
    return [...filteredRows].sort((first, second) => {
      if (second.conversionRate !== first.conversionRate) {
        return second.conversionRate - first.conversionRate;
      }

      if (second.converted !== first.converted) {
        return second.converted - first.converted;
      }

      return second.leadsAssigned - first.leadsAssigned;
    });
  }, [filteredRows]);

  const displayStats = useMemo(() => {
    if (stats.length > 0) {
      return stats.map((stat, index) => ({
        ...stat,
        Icon: fallbackStatIcons[index % fallbackStatIcons.length],
        color: fallbackStatColors[index % fallbackStatColors.length],
      })) satisfies TeamPerformanceStatCard[];
    }

    const topExecutive = [...executives].sort((first, second) => {
      if (second.converted !== first.converted) {
        return second.converted - first.converted;
      }

      if (second.conversionRate !== first.conversionRate) {
        return second.conversionRate - first.conversionRate;
      }

      return second.leadsAssigned - first.leadsAssigned;
    })[0];
    const totalExecutives = executives.length;
    const leadsAssigned = executives.reduce(
      (total, row) => total + row.leadsAssigned,
      0,
    );
    const converted = executives.reduce((total, row) => total + row.converted, 0);
    const conversionRate =
      leadsAssigned > 0 ? Math.round((converted / leadsAssigned) * 100) : 0;

    return [
      {
        label: "Executive",
        value: String(totalExecutives),
        helper: "Total active executives",
        Icon: Users,
        color: "bg-indigo-500",
      },
      {
        label: "Top Performer",
        value: topExecutive?.executiveName ?? "No data",
        helper: topExecutive
          ? `${topExecutive.converted} converted - ${topExecutive.conversionRate}%`
          : "No executive performance yet",
        Icon: Award,
        color: "bg-green-500",
      },
      {
        label: "Leads Assigned",
        value: String(leadsAssigned),
        helper: "Total assigned leads",
        Icon: FileText,
        color: "bg-blue-500",
      },
      {
        label: "Converted",
        value: String(converted),
        helper: `${totalExecutives} active executives`,
        Icon: CheckCircle,
        color: "bg-orange-400",
      },
      {
        label: "Conversion Rate",
        value: `${conversionRate}%`,
        helper: "Qualified over assigned",
        Icon: Percent,
        color: "bg-purple-500",
      },
    ] satisfies TeamPerformanceStatCard[];
  }, [executives, stats]);

  return (
    <div className="w-full space-y-6">
      <section className="grid w-full grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        {displayStats.map(({ label, value, helper, Icon, color }) => {
          const isTextValue = label === "Top Performer";

          return (
            <Card key={label} className="min-w-0 p-4">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="truncate text-sm text-gray-500">
                  {label}
                </CardTitle>

                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <CardContent className="min-w-0 p-0 mt-2">
                <p
                  className={`font-semibold text-gray-900 ${
                    isTextValue
                      ? "whitespace-normal break-words text-3xl leading-tight"
                      : "truncate text-5xl"
                  }`}
                  title={value}
                >
                  {value}
                </p>
                <p
                  className="mt-2 whitespace-normal break-words text-xs font-semibold text-slate-500"
                  title={helper}
                >
                  {helper}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="w-full">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[1.7rem] font-bold tracking-tight text-slate-900">
              Team Breakdown
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Executives ordered by conversion performance
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search executive..."
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <Table>
            <TableHeader className="border-b border-gray-200 bg-[#7677F41A]">
              <TableRow>
                <TableHead className="w-[180px] whitespace-nowrap text-xs sm:text-sm">
                  Executive
                </TableHead>
                <TableHead className="w-[160px] whitespace-nowrap text-xs sm:text-sm">
                  Leads Assigned
                </TableHead>
                <TableHead className="w-[140px] whitespace-nowrap text-xs sm:text-sm">
                  Converted
                </TableHead>
                <TableHead className="w-[120px] whitespace-nowrap text-xs sm:text-sm">
                  Conversion Rate
                </TableHead>
                <TableHead className="w-[100px] whitespace-nowrap text-xs sm:text-sm">
                  Detail
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm font-semibold text-gray-400"
                  >
                    Loading executives...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                performanceRows.map((row) => (
                  <TableRow key={row.executiveId || row.executiveName}>
                    <TableCell className="w-[180px]">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="size-10">
                          <AvatarImage
                            src={row.avatarUrl}
                            alt={row.executiveName}
                          />
                          <AvatarFallback>
                            {row.executiveName
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p
                            className="max-w-[180px] truncate font-medium text-gray-800 sm:max-w-[220px]"
                            title={row.executiveName}
                          >
                            {row.executiveName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-[160px] text-gray-600">
                      {row.leadsAssigned}
                    </TableCell>
                    <TableCell className="w-[140px] text-gray-600">
                      {row.converted}
                    </TableCell>
                    <TableCell className="w-[110px]">
                      <div className="flex items-center gap-3">
                        <Progress
                          value={row.conversionRate}
                          className="h-2 w-24 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-blue-600"
                        />
                        <span className="text-gray-600">
                          {row.conversionRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[100px] text-center">
                      {executivePathId(row.executiveId, row.executiveName) ? (
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="rounded-md bg-blue-50 text-xs font-bold text-blue-600 hover:bg-blue-100"
                        >
                          <Link
                            href={`/${orgCode}/org-reports/executive/${executivePathId(
                              row.executiveId,
                              row.executiveName,
                            )}`}
                          >
                            View
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          disabled
                          variant="secondary"
                          size="sm"
                          className="rounded-md bg-blue-50 text-xs font-bold text-blue-600 hover:bg-blue-100"
                        >
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              {!loading && performanceRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm font-semibold text-gray-400"
                  >
                    No executives found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

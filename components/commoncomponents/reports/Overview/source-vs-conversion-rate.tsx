"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLeadSourceLabel } from "@/types/org-reports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SourceVsConversionRateProps } from "@/types/org-reports";

const getRateBadgeClass = (rate: number) => {
  if (rate >= 30) {
    return "bg-emerald-50 text-emerald-600";
  }

  if (rate >= 25) {
    return "bg-blue-50 text-blue-600";
  }

  if (rate >= 20) {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-rose-50 text-rose-600";
};

const SourceVsConversionRate = ({
  title,
  data,
  onViewAll,
}: SourceVsConversionRateProps) => {
  return (
    <Card className="h-full w-full rounded-[2rem] border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 px-6 py-6">
        <CardTitle className="text-xl font-bold text-slate-900">
          {title}
        </CardTitle>

        {onViewAll && (
          <Button
            type="button"
            variant="ghost"
            onClick={onViewAll}
            className="h-auto px-0 text-sm font-bold text-blue-600 hover:bg-transparent hover:text-blue-700"
          >
            View All Details
          </Button>
        )}
      </CardHeader>

      <CardContent className="px-0 pb-5">
        <Table>
          <TableHeader>
            <TableRow className="border-y border-slate-100 hover:bg-transparent">
              <TableHead className="px-6 py-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                Source
              </TableHead>
              <TableHead className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                Leads
              </TableHead>
              <TableHead className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                Rate
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((row) => (
                <TableRow
                  key={row.source}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                >
                  <TableCell className="px-6 py-5 text-sm font-bold text-slate-900">
                    {getLeadSourceLabel(row.source)}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right text-sm font-medium text-slate-600">
                    {row.leads.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-6 py-5 text-right">
                    <span
                      className={`inline-flex min-w-14 items-center justify-center rounded-full px-3 py-1 text-xs font-bold ${getRateBadgeClass(
                        row.rate,
                      )}`}
                    >
                      {row.rate}%
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="px-6 py-10 text-center text-sm font-semibold text-slate-400"
                >
                  No source conversion data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export { SourceVsConversionRate };
export default SourceVsConversionRate;

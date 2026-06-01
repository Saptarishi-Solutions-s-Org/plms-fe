"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SourceVsConversionRateProps } from "@/types/org-reports";

export const SourceVsConversionRate = ({
  title,
  data,
}: SourceVsConversionRateProps) => {
  return (
    <Card className="flex h-[420px] w-full flex-col rounded-[2rem] border border-gray-200 bg-white shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-6 pt-6">
        <CardTitle className="text-[1.7rem] font-bold tracking-tight text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden px-5 pb-5">
        <div className="h-full rounded-lg border border-2 bg-white">
          <Table>
            <TableHeader className="table w-full table-fixed bg-[#7677F41A]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px] py-3 text-base font-semibold text-slate-900">
                  Source
                </TableHead>
                <TableHead className="w-[140px] py-3 text-base font-semibold text-slate-900">
                  Leads
                </TableHead>
                <TableHead className="w-[120px] py-3 text-base font-semibold text-slate-900">
                  Rate
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length > 0 ? (
                data.map((row) => (
                  <TableRow key={row.source} className="table w-full table-fixed">
                    <TableCell
                      title={row.source}
                      className="w-[200px] truncate py-4 text-base font-medium text-gray-800"
                    >
                      {row.source}
                    </TableCell>
                    <TableCell className="w-[140px] py-4 text-base text-gray-600">
                      {row.leads.toLocaleString()}
                    </TableCell>
                    <TableCell className="w-[120px] py-4 text-base text-gray-600">
                      {row.rate}%
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="table h-[260px] w-full">
                  <TableCell
                    colSpan={3}
                    className="h-[260px] text-center align-middle text-sm font-semibold text-gray-400"
                  >
                    No source conversion data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

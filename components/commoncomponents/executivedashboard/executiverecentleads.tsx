"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { RecentLeadsProps } from "@/types/executivestats";
import { ArrowRight } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  Qualified: "bg-blue-50 text-blue-600",
  Contacted: "bg-amber-50 text-amber-600",
  New: "bg-slate-100 text-slate-500",
  Lost: "bg-rose-50 text-rose-600",
};

const RecentLeadsCard = ({ title, leads, onViewAll }: RecentLeadsProps) => {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-md h-full">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {title}
        </CardTitle>

        {onViewAll && (
          <Button
            type="button"
            onClick={onViewAll}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
          >
            <>
              View all
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          </Button>
        )}
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader className="bg-[#7677F41A] table w-full table-fixed">
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="text-sm font-semibold text-slate-900">
                S.No
              </TableHead>
              <TableHead className="text-sm font-semibold text-slate-900">
                Lead Name
              </TableHead>
              <TableHead className="text-sm font-semibold text-slate-900">
                Date
              </TableHead>
              <TableHead className="text-sm font-semibold text-slate-900">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="block max-h-[260px] overflow-y-auto w-full">
            {leads.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-sm font-semibold text-gray-400"
                >
                  No recent leads
                </TableCell>
              </TableRow>
            ) : (
              leads.slice(0, 10).map((lead, idx) => (
                <TableRow
                  key={lead.leadId}
                  className="table w-full table-fixed"
                >
                  <TableCell className="text-gray-600">{idx + 1}</TableCell>

                  <TableCell className="font-medium text-gray-800">
                    {lead.leadName}
                  </TableCell>

                  <TableCell className="text-gray-600">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`font-medium ${STATUS_BADGE[lead.status] ?? "text-gray-500"}`}
                    >
                      {lead.status || "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentLeadsCard;

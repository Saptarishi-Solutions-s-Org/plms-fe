"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { RecentLeadsProps } from "@/types/executivestats";

const STATUS_BADGE: Record<string, string> = {
  Qualified: "bg-blue-50 text-blue-600",
  Contacted: "bg-amber-50 text-amber-600",
  New: "bg-slate-100 text-slate-500",
  Lost: "bg-rose-50 text-rose-600",
};

const RecentLeadsCard = ({
  title,
  leads,
  onViewAll,
}: RecentLeadsProps) => {
  return (
    <Card className="rounded-2xl border-0 bg-white shadow-md h-full">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
        <CardTitle className="text-lg font-semibold text-slate-900">
          {title}
        </CardTitle>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View all →
          </button>
        )}
      </CardHeader>

      <CardContent className="px-0 pb-0">
        <div className="max-h-[260px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#7677F41A]">
                <TableHead>S.No</TableHead>
                <TableHead>Lead Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
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
                leads.map((lead, idx) => (
                  <TableRow key={lead.leadId}>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentLeadsCard;
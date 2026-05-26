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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_BADGE: Record<string, string> = {
  Qualified: "bg-blue-50 text-blue-600",
  Contacted: "bg-amber-50 text-amber-600",
  New: "bg-slate-100 text-slate-500",
  Lost: "bg-rose-50 text-rose-600",
};

const RecentLeadsCard = ({ title, leads, onViewAll }: RecentLeadsProps) => {
  return (
    <Card className="w-full h-[420px] rounded-[2rem] border border-gray-200 shadow-md flex flex-col">
      {/* Header */}
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-6 pt-6">
        <CardTitle className="text-[1.7rem] font-bold tracking-tight text-slate-900">
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

      <CardContent className="px-5 pb-5 flex-1 overflow-hidden">
        <div className="h-full overflow-hidden rounded-lg border border-2 bg-white">
          <Table>
            <TableHeader className="bg-[#7677F41A] table w-full table-fixed ">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[60px] text-sm font-semibold text-slate-900">
                  S.No
                </TableHead>
                <TableHead className="w-[250px] text-sm font-semibold text-slate-900">
                  Lead Name
                </TableHead>
                <TableHead className="w-[150px] text-sm font-semibold text-slate-900">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="block h-[260px] overflow-y-auto w-full custom-scrollbar">
              {leads.length === 0 ? (
                <TableRow className="table w-full h-[260px]">
                  <TableCell
                    colSpan={3}
                    className="h-[260px] align-middle text-center text-sm font-semibold text-gray-400"
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
                    <TableCell className="w-[60px] text-gray-600">
                      {idx + 1}
                    </TableCell>

                    <TableCell className="w-[250px] font-medium text-gray-800 truncate">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block truncate cursor-pointer">
                              {lead.leadName}
                            </span>
                          </TooltipTrigger>

                          <TooltipContent className="max-w-[230px] whitespace-normal break-words">
                            <p>{lead.leadName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>

                    <TableCell className="w-[150px]">
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

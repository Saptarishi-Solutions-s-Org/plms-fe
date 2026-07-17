"use client";

import { useEffect } from "react";

import TablePaginationFooter from "@/components/commoncomponents/table-pagination-footer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExecutiveLeadRow } from "@/types/org-reports";
import type { PaginationMeta } from "@/types/pagination";

type LeadsDetailsTabProps = {
  leads: ExecutiveLeadRow[];
  loading: boolean;
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const getStatusClassName = (status: string) => {
  switch (status.toLowerCase()) {
    case "qualified":
      return "bg-emerald-50 text-emerald-700";
    case "contacted":
      return "bg-blue-50 text-blue-700";
    case "lost":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
};

export default function LeadsDetailsTab({
  leads,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
}: LeadsDetailsTabProps) {
  useEffect(() => {
    if (pagination.page > pagination.totalPages) {
      onPageChange(pagination.totalPages);
    }
  }, [onPageChange, pagination.page, pagination.totalPages]);

  return (
    <section className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            My Leads
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Detailed information for every lead assigned to you.
          </p>
        </div>

      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-[#7677F41A]">
            <TableRow>
              <TableHead className="w-20">S.No</TableHead>
              <TableHead className="min-w-60">Lead Name</TableHead>
              <TableHead className="min-w-36">Status</TableHead>
              <TableHead className="min-w-44">Source</TableHead>
              <TableHead className="min-w-52">Assigned By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-36 text-center text-slate-500">
                  Loading lead details...
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-36 text-center text-slate-500">
                  No leads are assigned to you yet.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead, index) => (
                <TableRow key={lead.id}>
                  <TableCell className="text-slate-500">
                    {(pagination.page - 1) * pagination.limit + index + 1}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {lead.leadName}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClassName(lead.status)}`}
                    >
                      {lead.status}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize text-slate-600">
                    {lead.source}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {lead.assignedBy}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && (
        <TablePaginationFooter
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          totalLabel="leads"
        />
      )}
    </section>
  );
}

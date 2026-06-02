"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExecutiveOption, Lead } from "@/types/leadtypes";

export interface LeadTableProps {
  leads: Lead[];
  executives?: ExecutiveOption[];
  renderActions?: (lead: Lead) => React.ReactNode;
  showAssignedTo?: boolean;
  emptyMessage?: string;
}

export default function LeadTable({
  leads,
  executives = [],
  renderActions,
  showAssignedTo = true,
  emptyMessage,
}: LeadTableProps) {
  const showActionsColumn = renderActions !== undefined;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader className="border-b border-gray-200 bg-[#7677F41A]">
          <TableRow>
            <TableHead className="whitespace-nowrap text-xs sm:text-sm">
              S.No
            </TableHead>
            <TableHead className="whitespace-nowrap text-xs sm:text-sm">
              Lead Name
            </TableHead>
            <TableHead className="whitespace-nowrap text-xs sm:text-sm">
              Email
            </TableHead>
            <TableHead className="whitespace-nowrap text-xs sm:text-sm">
              Phone
            </TableHead>
            <TableHead className="whitespace-nowrap text-xs sm:text-sm">
              Status
            </TableHead>
            <TableHead className="whitespace-nowrap text-xs sm:text-sm">
              Priority
            </TableHead>
            <TableHead className="whitespace-nowrap text-xs sm:text-sm">
              Source
            </TableHead>
            {showAssignedTo && (
              <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                Assigned To
              </TableHead>
            )}
            {showActionsColumn && (
              <TableHead className="w-20 whitespace-nowrap text-center text-xs sm:text-sm">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  7 + (showAssignedTo ? 1 : 0) + (showActionsColumn ? 1 : 0)
                }
                className="py-12 text-center text-sm font-semibold text-gray-400"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead, idx) => (
              <TableRow key={lead.uuid ?? idx}>
                <TableCell className="text-gray-600">{idx + 1}</TableCell>
                <TableCell
                  title={lead.name}
                  className="max-w-[180px] font-medium text-gray-800 sm:max-w-[220px]"
                >
                  {lead.name}
                </TableCell>
                <TableCell
                  title={lead.email}
                  className="max-w-[200px] text-gray-600 sm:max-w-[260px]"
                >
                  {lead.email}
                </TableCell>
                <TableCell className="text-gray-600">{lead.phone}</TableCell>
                <TableCell>{lead.status || "-"}</TableCell>
                <TableCell>{lead.priority || "-"}</TableCell>
                <TableCell className="text-gray-600">
                  {lead.leadSource?.replace(/_/g, " ") || "-"}
                </TableCell>
                {showAssignedTo && (
                  <TableCell className="text-gray-600">
                    {executives.find(
                      (executive) => executive.id === lead.assignedTo,
                    )?.name ||
                      lead.assignedToName ||
                      "-"}
                  </TableCell>
                )}
                {showActionsColumn && (
                  <TableCell className="w-20 text-center">
                    <div className="flex justify-center">
                      {renderActions?.(lead)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

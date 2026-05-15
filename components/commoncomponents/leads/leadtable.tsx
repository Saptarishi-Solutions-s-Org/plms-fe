"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ExecutiveOption,
  Lead,
  LEAD_SOURCE_OPTIONS,
} from "@/types/leadtypes";

export interface LeadTableProps {
  leads: Lead[];
  executives?: ExecutiveOption[];
  renderActions?: (lead: Lead) => React.ReactNode;
  showAssignedTo?: boolean;
  emptyMessage?: string;
  search?: string;
  sourceFilter?: string;
  statusFilter?: string;
  priorityFilter?: string;
  assignedToFilter?: string;
}

export default function LeadTable({
  leads,
  executives = [],
  renderActions,
  showAssignedTo = true,
  emptyMessage,
  search = "",
  sourceFilter = "All",
  statusFilter = "All",
  priorityFilter = "All",
  assignedToFilter = "All",
}: LeadTableProps) {
  const filtered = leads.filter((lead) => {
    const matchSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase());

    const matchSource =
      sourceFilter === "All" || lead.leadSource === sourceFilter;
    const matchStatus = statusFilter === "All" || lead.status === statusFilter;
    const matchPriority =
      priorityFilter === "All" || lead.priority === priorityFilter;
    const matchAssignedTo =
      assignedToFilter === "All" || lead.assignedTo === assignedToFilter;

    return (
      matchSearch &&
      matchSource &&
      matchStatus &&
      matchPriority &&
      matchAssignedTo
    );
  });

  const showActionsColumn = renderActions !== undefined;
  const defaultEmpty =
    leads.length === 0 ? "No leads found" : "No leads match your search.";

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
              <TableHead className="whitespace-nowrap text-xs sm:text-sm">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  7 + (showAssignedTo ? 1 : 0) + (showActionsColumn ? 1 : 0)
                }
                className="py-12 text-center text-sm font-semibold text-gray-400"
              >
                {emptyMessage ?? defaultEmpty}
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((lead, idx) => (
              <TableRow key={lead.uuid ?? idx}>
                <TableCell className="text-gray-600">{idx + 1}</TableCell>
                <TableCell className="font-medium text-gray-800">
                  {lead.name}
                </TableCell>
                <TableCell className="text-gray-600">{lead.email}</TableCell>
                <TableCell className="text-gray-600">{lead.phone}</TableCell>
                <TableCell>{lead.status || "-"}</TableCell>
                <TableCell>{lead.priority || "-"}</TableCell>
                <TableCell className="text-gray-600">
                  {LEAD_SOURCE_OPTIONS.find(
                    (option) => option.value === lead.leadSource,
                  )?.label || "-"}
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
                  <TableCell className="text-right">
                    {renderActions?.(lead)}
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

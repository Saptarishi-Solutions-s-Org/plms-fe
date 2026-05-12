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
  Lead,
  STATUS_BADGE,
  PRIORITY_BADGE,
  LEAD_SOURCE_OPTIONS,
} from "@/types/leadtypes";

export interface LeadTableProps {
  leads: Lead[];
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
      assignedToFilter === "All" || lead.assignedToId === assignedToFilter;

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
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#7677F41A]">
            <TableHead>S.No</TableHead>
            <TableHead>Lead Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Source</TableHead>
            {showAssignedTo && <TableHead>Assigned To</TableHead>}
            {showActionsColumn && <TableHead>Actions</TableHead>}
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
                <TableCell>
                  <span
                    className={`font-medium ${STATUS_BADGE[lead.status] ?? "text-gray-500"}`}
                  >
                    {lead.status || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-semibold ${PRIORITY_BADGE[lead.priority] ?? "text-gray-600"}`}
                  >
                    {lead.priority || "—"}
                  </span>
                </TableCell>
                <TableCell className="text-gray-600">
                  {LEAD_SOURCE_OPTIONS.find(
                    (option) => option.value === lead.leadSource,
                  )?.label || "—"}
                </TableCell>
                {showAssignedTo && (
                  <TableCell className="text-gray-600">
                    {lead.assignedToName || "—"}
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

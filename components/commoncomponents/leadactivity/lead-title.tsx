import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS, STATUS_COLORS } from "@/types/leadActivity";
import {LeadTitleCardProps} from "@/types/leadActivity";

export default function LeadTitleCard({ lead }: LeadTitleCardProps) {
  const status = lead.status || "Unknown";
  const priority = lead.priority || "Unknown";

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-bold text-gray-900">
            {lead.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${STATUS_COLORS[status] ?? ""}`}
            >
              {status.toUpperCase()}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${
                PRIORITY_COLORS[priority] ?? ""
              }`}
            >
              {priority.toUpperCase()} PRIORITY
            </Badge>
          </div>
        </div>

        <div className="shrink-0 text-right text-sm">
          <p className="text-xs text-gray-400">Created By</p>
          <p className="font-semibold text-gray-800">{lead.createdByName}</p>
          <p className="mt-2 text-xs text-gray-400">Source</p>
          <p className="font-semibold text-gray-800">
            {lead.leadSource?.replace(/_/g, " ")}
          </p>
        </div>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
import { PRIORITY_COLORS, STATUS_COLORS } from "@/types/leadActivity";
import { LeadTitleCardProps } from "@/types/leadActivity";
import { Mail, MapPin, Phone } from "lucide-react";

function ContactMeta({
  icon: Icon,
  value,
}: {
  icon: typeof Phone;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-600">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <span className="truncate">{value}</span>
    </div>
  );
}

export default function LeadTitleCard({ lead }: LeadTitleCardProps) {
  const status = lead.status ?? "-";
  const priority = lead.priority;
  const source = lead.leadSource?.replace(/_/g, " ") || "-";
  const location = [
    lead.city,
    lead.stateName ?? lead.state,
    lead.countryName ?? lead.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-6 py-5">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 truncate text-2xl font-bold text-gray-900">
              {lead.name}
            </h2>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${STATUS_COLORS[status] ?? ""}`}
            >
              {status.toUpperCase()}
            </Badge>
            {priority && (
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  PRIORITY_COLORS[priority] ?? ""
                }`}
              >
                {priority.toUpperCase()} PRIORITY
              </Badge>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <ContactMeta icon={Phone} value={lead.phone || "-"} />
              <ContactMeta icon={Mail} value={lead.email || "-"} />
            </div>
            <ContactMeta icon={MapPin} value={location || "-"} />
          </div>
        </div>

        <div className="shrink-0 text-right text-sm">
          <p className="text-xs text-gray-400">Created By</p>
          <p className="font-semibold text-gray-800">{lead.createdByName}</p>
          <p className="mt-2 text-xs text-gray-400">Source</p>
          <p className="font-semibold text-gray-800">{source}</p>
        </div>
      </div>
    </div>
  );
}

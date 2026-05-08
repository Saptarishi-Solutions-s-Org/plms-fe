"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { RecentLeadsProps } from "@/types/executivestats";

const statusStyles: Record<string, string> = {
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
    <Card className="rounded-2xl border-0 bg-white shadow-md">
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

        <div className="grid grid-cols-2 border-y bg-slate-50 px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
          <p>Lead</p>
          <p>Status</p>
        </div>

        <div className="max-h-[220px] overflow-y-auto">
          {leads.length > 0 ? (
            leads.map((lead) => (
              <div
                key={lead.leadId}
                className="grid grid-cols-2 items-center border-b px-5 py-4 last:border-none"
              >
                
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {lead.leadName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>

                
                <div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium ${
                      statusStyles[lead.status] ||
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {lead.status}
                  </span>
                </div>

                
                
              </div>
            ))
          ) : (
            <div className="px-8 py-10 text-center text-slate-500">
              No recent leads
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentLeadsCard;
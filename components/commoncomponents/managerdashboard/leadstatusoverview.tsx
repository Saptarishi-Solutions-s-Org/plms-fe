"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { CommonOverviewProps } from "@/types/org-manager";

const leadStatusColors = [
  "bg-blue-600",
  "bg-indigo-400",
  "bg-indigo-300",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-cyan-500",
];

const CommonOverview = ({
  title,
  subtitle,
  data,
  onViewDetails,
}: CommonOverviewProps) => {
  const max = data.length ? Math.max(...data.map((row) => row.value), 1) : 1;

  return (
    <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] h-full">      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-[1.7rem] font-bold tracking-tight text-slate-900">
            {title}
          </CardTitle>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="text-lg font-semibold text-blue-600 transition hover:text-blue-700"
          >
            View Details
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6 pt-2">
        {data.length > 0 ? (
          data.map((row, index) => (
            <div key={row.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-slate-800">
                  {row.label}
                </p>
                <p
  className={`text-lg font-bold ${
                    index === data.length - 1
                      ? "text-emerald-600"
                      : "text-slate-900"
                  }`}
                >
                  {row.value}
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full ${leadStatusColors[index % leadStatusColors.length]}`}
                  style={{
                    width: `${Math.min((row.value / max) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-base text-slate-500">No data</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CommonOverview;

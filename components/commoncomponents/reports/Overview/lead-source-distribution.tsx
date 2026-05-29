"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { LeadSourceDistributionProps } from "@/types/org-reports";
import { Progress } from "@/components/ui/progress";

const sourceColors = [
  "[&_[data-slot=progress-indicator]]:bg-blue-600",
  "[&_[data-slot=progress-indicator]]:bg-blue-400",
  "[&_[data-slot=progress-indicator]]:bg-slate-400",
  "[&_[data-slot=progress-indicator]]:bg-pink-500",
  "[&_[data-slot=progress-indicator]]:bg-emerald-500",
  "[&_[data-slot=progress-indicator]]:bg-cyan-500",
];

const LeadSourceDistribution = ({
  title,
  subtitle,
  data,
}: LeadSourceDistributionProps) => {
  const max = data.length ? Math.max(...data.map((row) => row.leads), 1) : 1;

  return (
    <Card className="flex h-[420px] w-full flex-col rounded-[2rem] border border-gray-200 bg-white shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-[1.7rem] font-bold tracking-tight text-slate-900">
            {title}
          </CardTitle>

          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>

      </CardHeader>

      <CardContent className="flex-1 space-y-4 overflow-hidden px-6 pb-6 pt-2">
        {data.length > 0 ? (
          data.map((row, index) => (
            <div key={row.source} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <p
                  className="truncate text-base font-semibold text-slate-800"
                  title={row.source}
                >
                  {row.source}
                </p>

                <p className="shrink-0 text-base font-bold text-slate-900">
                  {row.leads}
                </p>
              </div>

              <Progress
                value={Math.min((row.leads / max) * 100, 100)}
                className={`h-2 bg-slate-100 ${
                  sourceColors[index % sourceColors.length]
                }`}
              />
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-base font-semibold text-slate-400">No data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadSourceDistribution;

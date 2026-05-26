"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { LeadSourceDistributionProps } from "@/types/org-reports";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getLeadSourceLabel } from "@/types/org-reports";

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
    <Card className="h-full w-full rounded-[2rem] border-0 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-slate-900">
            {title}
          </CardTitle>

          {subtitle && (
            <p className="text-sm font-medium text-slate-500">{subtitle}</p>
          )}
        </div>

        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
          >
          View Details
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-7 pt-4">
        {data.length > 0 ? (
          data.map((row, index) => (
            <div key={row.source} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  {getLeadSourceLabel(row.source)}
                </p>

                <p className="text-sm font-bold text-slate-900">
                  {row.leads}
                </p>
              </div>

              <Progress
                value={Math.min((row.leads / max) * 100, 100)}
                className={`h-3 bg-slate-100 ${
                  sourceColors[index % sourceColors.length]
                }`}
              />
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No data</p>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadSourceDistribution;

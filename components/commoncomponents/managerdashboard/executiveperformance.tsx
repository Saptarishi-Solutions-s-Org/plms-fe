
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExecutivePerformanceProps } from "@/types/org-manager";

const progressColors = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
];

const ExecutivePerformance = ({
  title = "Executive Performance",
  subtitle = "Target achievement by executive",
  data,
}: ExecutivePerformanceProps) => {
  return (
    <Card className="flex h-[420px] w-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-5 pt-5">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {title}
          </CardTitle>

          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </CardHeader>

      <CardContent className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-5 pt-2">
        {data.length > 0 ? (
          data.map((executive, index) => (
            <div
              key={executive.executiveName}
              className="flex items-start gap-3"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-gray-700">
                    {executive.executiveName}
                  </p>

                  <p className="text-sm font-semibold text-indigo-500">
                    {executive.achievement}%
                  </p>
                </div>

                {/* Progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${progressColors[index % progressColors.length]
                      }`}
                    style={{
                      width: `${Math.min(executive.achievement, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-base font-semibold text-slate-400">
              No performance data
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutivePerformance;

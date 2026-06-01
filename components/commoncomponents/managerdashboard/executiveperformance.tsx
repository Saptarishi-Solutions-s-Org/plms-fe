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
    <Card className="w-full h-[420px] rounded-[2rem] border border-gray-200 bg-white shadow-md flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-[1.7rem] font-bold tracking-tight text-slate-900">
            {title}
          </CardTitle>

          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6 px-6 pb-6 pt-2 overflow-y-auto custom-scrollbar">
        {data.length > 0 ? (
          data.map((executive, index) => (
            <div
              key={executive.executiveName}
              className="flex items-start gap-3"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                {executive.executiveName?.charAt(0)}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-lg font-semibold text-slate-800">
                    {executive.executiveName}
                  </p>

                  <p className="text-lg font-bold text-indigo-500">
                    {executive.achievement}%
                  </p>
                </div>

                {/* Progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      progressColors[index % progressColors.length]
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

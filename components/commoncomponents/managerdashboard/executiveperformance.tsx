"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MoreVertical } from "lucide-react";
import { ExecutivePerformanceProps } from "@/types/org-manager";
import { Button } from "@/components/ui/button";

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
    <Card className="rounded-[2rem] border-0 bg-white h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-[1.7rem] font-bold tracking-tight text-slate-900">
            {title}
          </CardTitle>

          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6 px-6 pb-6 pt-2">
        {data.length > 0 ? (
          data.map((executive, index) => (
            <div
              key={executive.executiveName}
              className="flex items-start gap-3"
            >
              {/* Avatar */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                {executive.executiveName.charAt(0)}
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
          <p className="text-base text-slate-500">No performance data</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExecutivePerformance;

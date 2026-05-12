"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { MoreVertical } from "lucide-react";

type ExecutivePerformanceRow = {
  executiveName: string;
  achievement: number;
};

type ExecutivePerformanceProps = {
  title?: string;
  subtitle?: string;
  data: ExecutivePerformanceRow[];
};

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
    <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 px-8 pt-8">
        <div className="space-y-2">
          <CardTitle className="text-[2rem] font-bold tracking-tight text-slate-900">
            {title}
          </CardTitle>

          <p className="text-lg text-slate-500">{subtitle}</p>
        </div>

        <button
          type="button"
          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </CardHeader>

      <CardContent className="space-y-8 px-8 pb-10 pt-4">
        {data.length > 0 ? (
          data.map((executive, index) => (
            <div
              key={executive.executiveName}
              className="flex items-start gap-4"
            >
              {/* Avatar */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-xl font-bold text-white">
                {executive.executiveName.charAt(0)}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xl font-semibold text-slate-800">
                    {executive.executiveName}
                  </p>

                  <p className="text-xl font-bold text-indigo-500">
                    {executive.achievement}%
                  </p>
                </div>

                {/* Progress bar */}
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
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
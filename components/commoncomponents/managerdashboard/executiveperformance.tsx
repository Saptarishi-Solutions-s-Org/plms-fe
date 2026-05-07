"use client";

import { MoreVertical } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExecutivePerformanceProps } from "@/types/mdashboard/page";

const avatarAccents = [
  "from-slate-900 to-slate-700",
  "from-amber-200 to-orange-300",
  "from-slate-800 to-slate-600",
  "from-blue-200 to-indigo-300",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const getAvatarTone = (index: number) => avatarAccents[index % avatarAccents.length];

const getClampedAchievement = (achievement: number) =>
  Math.min(Math.max(achievement, 0), 100);

const getTextColor = (achievement: number) => {
  if (achievement >= 85) return "text-blue-600";
  if (achievement >= 70) return "text-blue-500";
  return "text-slate-700";
};

const ExecutivePerformance = ({ performance }: ExecutivePerformanceProps) => {
  return (
    <Card className="rounded-[2rem] border-0 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-8 pt-8">
        <div className="space-y-2">
          <CardTitle className="text-[2rem] font-bold tracking-tight text-slate-900">
            Executive Performance
          </CardTitle>
          <p className="text-lg text-slate-500">Target achievement by executive</p>
        </div>
        <button
          type="button"
          aria-label="More options"
          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <MoreVertical className="h-6 w-6" />
        </button>
      </CardHeader>

      <CardContent className="space-y-10 px-8 pb-10 pt-6">
        {performance.length > 0 ? (
          performance.map((row, index) => (
            <div key={row.executiveName} className="flex items-start gap-5">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarTone(index)} text-lg font-semibold text-white shadow-sm`}
              >
                {getInitials(row.executiveName)}
              </div>
              <div className="min-w-0 flex-1 space-y-3 pt-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-2xl font-semibold text-slate-900">
                    {row.executiveName}
                  </p>
                  <p
                    className={`text-2xl font-bold ${getTextColor(row.achievement)}`}
                  >
                    {row.achievement}%
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${getClampedAchievement(row.achievement)}%`,
                    }}
                  />
                </div>
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

export default ExecutivePerformance;

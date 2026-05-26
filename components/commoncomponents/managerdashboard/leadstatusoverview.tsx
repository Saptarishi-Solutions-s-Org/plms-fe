"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { CommonOverviewProps } from "@/types/org-manager";
import { ArrowRight } from "lucide-react";

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
    <Card className="w-full h-[420px] rounded-[2rem] border border-gray-200 bg-white shadow-md flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-6 pt-6">
        <div className="space-y-1">
          <CardTitle className="text-[1.7rem] font-bold tracking-tight text-slate-900">
            {title}
          </CardTitle>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        {onViewDetails && (
          <Button
            type="button"
            onClick={onViewDetails}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition"
          >
            <>
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-6 px-6 pb-6 pt-2 overflow-y-auto custom-scrollbar">
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
          <div className="flex h-full items-center justify-center">
            <p className="text-base font-semibold text-slate-400">No data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommonOverview;

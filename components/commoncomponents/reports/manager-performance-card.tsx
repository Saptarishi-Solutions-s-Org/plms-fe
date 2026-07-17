"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type ManagerPerformanceCardRow = {
  id: string;
  name: string;
  leads: number;
  converted: number;
  conversionRate: number;
};

type ManagerPerformanceCardProps = {
  managers: ManagerPerformanceCardRow[];
  title?: string;
};

export default function ManagerPerformanceCard({
  managers,
  title = "Manager Performance",
}: ManagerPerformanceCardProps) {
  return (
    <Card className="flex h-[420px] w-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-xl font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-7 overflow-y-scroll px-6 pb-6 pr-4 [scrollbar-color:#cbd5e1_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-2">
        {managers.map((manager) => (
          <div key={manager.id} className="space-y-3">
            <div className="flex justify-between gap-4 text-base">
              <span className="font-semibold text-gray-800">{manager.name}</span>
              <span className="text-gray-600">{manager.conversionRate}%</span>
            </div>
            <Progress
              value={manager.conversionRate}
              className="h-2 bg-slate-100 [&_[data-slot=progress-indicator]]:bg-blue-600"
            />
          </div>
        ))}
        {!managers.length && (
          <p className="py-12 text-center text-sm text-slate-400">
            No manager performance data
          </p>
        )}
      </CardContent>
    </Card>
  );
}

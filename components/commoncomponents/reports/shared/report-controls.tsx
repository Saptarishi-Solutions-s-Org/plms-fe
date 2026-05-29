"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ReportControlsProps, ReportPeriod } from "@/types/org-reports";

const periodLabels: Record<ReportPeriod, string> = {
  "this-month": "This Month",
};

export default function ReportControls({
  period,
  onPeriodChange,
}: ReportControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Tabs
        value={period}
        onValueChange={(value) => {
          const nextPeriod = value as ReportPeriod;

          onPeriodChange(nextPeriod);
        }}
      >
        <TabsList className="h-10 w-full rounded-[2rem] border border-gray-200 sm:w-auto">
          <TabsTrigger
            value="this-month"
            className="h-8 rounded-full px-4 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            {periodLabels["this-month"]}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

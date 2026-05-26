"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ReportControlsProps, ReportPeriod } from "@/types/org-reports";

const periodLabels: Record<ReportPeriod, string> = {
  "this-month": "This Month",
  "last-month": "Last Month",
  custom: "Custom",
};

export default function ReportControls({
  period,
  onPeriodChange,
  dateRange,
  onDateRangeChange,
  onExport,
}: ReportControlsProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const customLabel =
    dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
      : "Custom";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Tabs
        value={period}
        onValueChange={(value) => {
          const nextPeriod = value as ReportPeriod;

          onPeriodChange(nextPeriod);

          if (nextPeriod === "custom") {
            setIsCalendarOpen(true);
          }
        }}
      >
        <TabsList className="h-10 w-full rounded-xl bg-white p-1 shadow-sm sm:w-auto">
          <TabsTrigger
            value="this-month"
            className="h-8 rounded-lg px-4 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            {periodLabels["this-month"]}
          </TabsTrigger>
          <TabsTrigger
            value="last-month"
            className="h-8 rounded-lg px-4 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            {periodLabels["last-month"]}
          </TabsTrigger>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <TabsTrigger
                value="custom"
                className="h-8 rounded-lg px-4 text-xs font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <CalendarIcon className="size-3.5" />
                {customLabel}
              </TabsTrigger>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  onDateRangeChange(range);

                  if (range?.from && range?.to) {
                    setIsCalendarOpen(false);
                  }
                }}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </TabsList>
      </Tabs>

      <Button
        type="button"
        onClick={onExport}
        className="h-10 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700"
      >
        <FileDown className="size-4" />
        Export PDF
      </Button>
    </div>
  );
}

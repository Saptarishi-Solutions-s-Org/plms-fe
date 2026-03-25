"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ReactDayPicker as Calendar } from "@/components/commoncomponents/react-day-picker";
import { CalendarIcon, ChevronDown } from "lucide-react";
import type { DateRange } from "@/components/commoncomponents/react-day-picker";
import { format } from "date-fns";

interface DateRangeFilterProps {
  value?: DateRange;
  onChange: (dateRange: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangeFilter({
  value,
  onChange,
  placeholder = "Select Range",
  className = "w-full sm:w-48 lg:w-52 justify-between bg-white px-3 font-normal h-9 shrink-0",
}: DateRangeFilterProps) {
  const [calendarMonthsToShow, setCalendarMonthsToShow] = useState(2);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const updateCalendarMonths = () => {
      setCalendarMonthsToShow(media.matches ? 1 : 2);
    };

    updateCalendarMonths();
    media.addEventListener("change", updateCalendarMonths);

    return () => media.removeEventListener("change", updateCalendarMonths);
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 shrink-0 text-gray-500" />
            <span
              className={`truncate text-sm ${
                value?.from ? "text-gray-900" : "text-gray-400 font-medium"
              }`}
            >
              {value?.from
                ? value.to
                  ? `${format(value.from, "dd MMM")} - ${format(value.to, "dd MMM")}`
                  : format(value.from, "dd MMM yyyy")
                : placeholder}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 ml-1" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={calendarMonthsToShow}
          showOutsideDays={false}
        />
      </PopoverContent>
    </Popover>
  );
}

"use client"

import { Calendar, CalendarDayButton } from "@/components/ui/calendar"

export { CalendarDayButton }
export { type DateRange, type DayPickerProps } from "react-day-picker"

export function ReactDayPicker(props: React.ComponentProps<typeof Calendar>) {
  return <Calendar {...props} />
}

export default ReactDayPicker
 
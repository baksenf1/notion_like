import { useState } from "react";
import { CalendarDays } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";

const SidebarCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  return (
    <div className="group-data-[collapsible=icon]:hidden">
      <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium text-sidebar-foreground/70">
        <CalendarDays className="size-4" />
        <span>Calendar</span>
      </div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="rounded-md border border-sidebar-border bg-sidebar p-2"
        classNames={{
          month: "space-y-2",
          caption: "flex justify-center relative items-center h-7",
          caption_label: "text-xs font-medium",
          nav_button: "h-6 w-6 bg-transparent p-0 opacity-60",
          head_cell: "w-7 text-[0.68rem] font-normal text-muted-foreground",
          row: "flex w-full mt-1",
          cell: "relative h-7 w-7 p-0 text-center text-xs",
          day: "h-7 w-7 p-0 text-xs font-normal",
        }}
      />
    </div>
  );
};

export default SidebarCalendar;

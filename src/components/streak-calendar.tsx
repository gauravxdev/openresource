"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StreakCalendarProps {
  activeDates: string[]; // YYYY-MM-DD format
  isFullYear?: boolean;
}

function formatDateString(date: Date) {
  return date.toISOString().split("T")[0] ?? "";
}

export function StreakCalendar({
  activeDates,
  isFullYear = false,
}: StreakCalendarProps) {
  const activeSet = React.useMemo(() => new Set(activeDates), [activeDates]);

  // Calculate the dates for the current calendar year (starting Jan 1st)
  const { days, months } = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentYear = today.getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of CURRENT YEAR

    // Align to the Sunday of that week to keep the Sun-Sat rows consistent
    const startDayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDayOfWeek);

    // Default: 182 days (approx 6 months, e.g., Jan-Jun)
    // Full Year: 364 days (approx 12 months, e.g., Jan-Dec)
    const totalDays = isFullYear ? 364 : 182;

    const daysRes = [];
    const monthsRes: { name: string; weekIndex: number }[] = [];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      daysRes.push(d);

      // If it's the first day of a week (Sunday)
      if (i % 7 === 0) {
        const weekIndex = i / 7;
        const currentMonthName = monthNames[d.getMonth()] ?? "Unknown";

        // If it's the very first week, force the "Jan" label as requested
        if (monthsRes.length === 0) {
          monthsRes.push({ name: "Jan", weekIndex });
        } else {
          const lastMonth = monthsRes[monthsRes.length - 1];
          if (lastMonth && lastMonth.name !== currentMonthName) {
            // Avoid labels being too close together
            if (lastMonth.weekIndex <= weekIndex - 2) {
              monthsRes.push({ name: currentMonthName, weekIndex });
            }
          }
        }
      }
    }
    return { days: daysRes, months: monthsRes };
  }, [isFullYear]);

  const todayStr = formatDateString(new Date());

  const cells = days.map((date) => {
    const dateStr = formatDateString(date);
    const isActive = activeSet.has(dateStr);
    const isToday = dateStr === todayStr;

    let bgClass = "bg-muted/30";
    if (isActive) bgClass = "bg-emerald-500 dark:bg-emerald-500/80";

    return (
      <div
        key={dateStr}
        className={`h-3 w-3 shrink-0 rounded-[2px] transition-all duration-300 ${bgClass} ${isToday ? "ring-primary ring-1 ring-offset-1" : ""}`}
        title={`${dateStr}${isActive ? " - Active" : ""}${isToday ? " (Today)" : ""}`}
      />
    );
  });

  return (
    <div className="flex flex-col gap-2 pt-2">
      <div className="flex items-start gap-4 overflow-hidden">
        {/* Day labels (Sunday to Saturday) */}
        <div className="mt-6 grid grid-rows-7 gap-1.5 py-0.5 text-[10px] leading-none text-muted-foreground opacity-70">
          <div className="h-3"></div>
          <div className="h-3 leading-3">Mon</div>
          <div className="h-3"></div>
          <div className="h-3 leading-3">Wed</div>
          <div className="h-3"></div>
          <div className="h-3 leading-3">Fri</div>
          <div className="h-3"></div>
        </div>

        {/* Activity Grid and Month Labels - Scrollable if full year overflows */}
        <div className="scrollbar-hide flex-1 overflow-x-auto pb-2">
          {/* Month labels container */}
          <div className="relative mb-2 h-4 w-full text-[10px] text-muted-foreground">
            {months.map((month) => (
              <span
                key={`${month.name}-${month.weekIndex}`}
                className="absolute font-medium opacity-80"
                style={{
                  left: `calc(${month.weekIndex} * (0.75rem + 0.375rem))`, // (h-3 width + gap-1.5)
                }}
              >
                {month.name}
              </span>
            ))}
          </div>

          <div className="grid w-fit grid-flow-col grid-rows-7 gap-1.5">
            {cells}
          </div>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="h-2 w-2 rounded-[1px] bg-muted/30"></div>
          <div className="h-2 w-2 rounded-[1px] bg-emerald-500/30"></div>
          <div className="h-2 w-2 rounded-[1px] bg-emerald-500/60"></div>
          <div className="h-2 w-2 rounded-[1px] bg-emerald-500"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

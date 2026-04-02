"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function ToggleGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("inline-flex items-center rounded-md shadow-xs", className)}
      role="group"
      {...props}
    >
      {children}
    </div>
  );
}

function ToggleGroupItem({
  className,
  children,
  pressed,
  ...props
}: React.ComponentProps<"button"> & { pressed?: boolean }) {
  return (
    <button
      className={cn(
        "border-input focus-visible:border-ring focus-visible:ring-ring/50 inline-flex items-center justify-center gap-2 border bg-transparent px-3 py-2 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "first:rounded-l-md last:rounded-r-md [&:not(:first-child)]:-ml-px",
        pressed
          ? "bg-accent text-accent-foreground"
          : "hover:bg-accent/50 hover:text-accent-foreground",
        className,
      )}
      data-state={pressed ? "on" : "off"}
      aria-pressed={pressed}
      {...props}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };

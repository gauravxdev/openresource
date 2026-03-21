"use client";

import * as React from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TechItem {
  name: string;
  slug: string;
}

interface TechStackProps {
  items: TechItem[];
  limit?: number;
}

export function TechStack({ items, limit = 12 }: TechStackProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!items || items.length === 0) return null;

  const displayedItems = isExpanded ? items : items.slice(0, limit);
  const remainingCount = items.length - limit;

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-3">
      {displayedItems.map((item) => (
        <TooltipProvider key={item.slug}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-muted/50 p-1">
                  <Image
                    src={`https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${item.slug}.svg`}
                    alt={item.name}
                    width={16}
                    height={16}
                    className="h-full w-full object-contain dark:invert"
                    loading="lazy"
                    unoptimized
                    onError={(e) => {
                      (e.target as HTMLImageElement).parentElement!.style.display = "none";
                    }}
                  />
                </div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {item.name}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{item.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {!isExpanded && remainingCount > 0 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors ml-1"
        >
          +{remainingCount} more
        </button>
      )}
    </div>
  );
}

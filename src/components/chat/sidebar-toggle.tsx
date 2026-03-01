"use client";

import type { ComponentProps } from "react";
import { PanelLeftIcon } from "lucide-react";
import { type SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SidebarToggle({
    className,
}: ComponentProps<typeof SidebarTrigger>) {
    const { toggleSidebar } = useSidebar();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        className={cn("h-8 px-2 md:h-fit md:px-2", className)}
                        data-testid="sidebar-toggle-button"
                        onClick={toggleSidebar}
                        variant="outline"
                        size="sm"
                    >
                        <PanelLeftIcon className="size-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent align="start" className="hidden md:block">
                    Toggle Sidebar
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

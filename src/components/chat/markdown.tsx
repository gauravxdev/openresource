"use client";

import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type MarkdownProps = ComponentProps<typeof ReactMarkdown> & {
    className?: string;
};

export function Markdown({ className, children, ...props }: MarkdownProps) {
    return (
        <div
            className={cn(
                "prose prose-sm dark:prose-invert max-w-none",
                "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
                "[&_code]:whitespace-pre-wrap [&_code]:break-words",
                "[&_pre]:max-w-full [&_pre]:overflow-x-auto",
                "[&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3",
                "[&_p]:leading-relaxed",
                className,
            )}
        >
            <ReactMarkdown {...props}>{children as string}</ReactMarkdown>
        </div>
    );
}

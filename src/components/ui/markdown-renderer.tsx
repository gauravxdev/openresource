"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import * as React from "react";

const MarkdownPreview = dynamic(
    () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-2/3" />
            </div>
        ),
    }
);

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    const { theme } = useTheme();

    return (
        <div className={className} data-color-mode={theme === "dark" ? "dark" : "light"}>
            <MarkdownPreview
                source={content}
                style={{ backgroundColor: "transparent", color: "inherit" }}
                wrapperElement={{
                    "data-color-mode": theme === "dark" ? "dark" : "light"
                }}
            />
        </div>
    );
}


"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import { useTheme } from "next-themes";
import * as React from "react";

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

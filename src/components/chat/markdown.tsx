/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unused-vars */
"use client";

import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";
import dynamic from "next/dynamic";
import type { BundledLanguage } from "shiki";

const CodeBlock = dynamic(() => import("@/components/ai-elements/code-block").then(mod => mod.CodeBlock), {
    ssr: false,
    loading: () => <div className="h-32 w-full animate-pulse bg-muted rounded-md my-4" />
});

const CodeBlockHeader = dynamic(() => import("@/components/ai-elements/code-block").then(mod => mod.CodeBlockHeader), { ssr: false });
const CodeBlockTitle = dynamic(() => import("@/components/ai-elements/code-block").then(mod => mod.CodeBlockTitle), { ssr: false });
const CodeBlockFilename = dynamic(() => import("@/components/ai-elements/code-block").then(mod => mod.CodeBlockFilename), { ssr: false });
const CodeBlockActions = dynamic(() => import("@/components/ai-elements/code-block").then(mod => mod.CodeBlockActions), { ssr: false });
const CodeBlockCopyButton = dynamic(() => import("@/components/ai-elements/code-block").then(mod => mod.CodeBlockCopyButton), { ssr: false });

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
                "[&_pre]:rounded-lg [&_pre]:bg-transparent [&_pre]:p-0",
                "[&_p]:leading-relaxed",
                className,
            )}
        >
            <ReactMarkdown
                {...props}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        if (!inline && match) {
                            return (
                                <CodeBlock
                                    code={String(children).replace(/\n$/, "")}
                                    language={match[1] as BundledLanguage}
                                    showLineNumbers
                                    className="my-4"
                                >
                                    <CodeBlockHeader>
                                        <CodeBlockTitle>
                                            <FileIcon size={14} />
                                            <CodeBlockFilename>{match[1]}</CodeBlockFilename>
                                        </CodeBlockTitle>
                                        <CodeBlockActions>
                                            <CodeBlockCopyButton />
                                        </CodeBlockActions>
                                    </CodeBlockHeader>
                                </CodeBlock>
                            );
                        }
                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    ...props.components,
                }}
            >
                {children!}
            </ReactMarkdown>
        </div>
    );
}

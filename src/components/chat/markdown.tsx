"use client";

import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";
import {
    CodeBlock,
    CodeBlockActions,
    CodeBlockCopyButton,
    CodeBlockFilename,
    CodeBlockHeader,
    CodeBlockTitle,
} from "@/components/ai-elements/code-block";
import type { BundledLanguage } from "shiki";

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
                    // @ts-expect-error - inline prop exists in react-markdown v9 but types might be weird
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
                {children as string}
            </ReactMarkdown>
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/prefer-nullish-coalescing, @typescript-eslint/no-unused-vars */
"use client";

import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";
import dynamic from "next/dynamic";
import type { BundledLanguage } from "shiki";

const CodeBlock = dynamic(
  () =>
    import("@/components/ai-elements/code-block").then((mod) => mod.CodeBlock),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted my-4 h-32 w-full animate-pulse rounded-lg" />
    ),
  },
);

const CodeBlockHeader = dynamic(
  () =>
    import("@/components/ai-elements/code-block").then(
      (mod) => mod.CodeBlockHeader,
    ),
  { ssr: false },
);
const CodeBlockTitle = dynamic(
  () =>
    import("@/components/ai-elements/code-block").then(
      (mod) => mod.CodeBlockTitle,
    ),
  { ssr: false },
);
const CodeBlockFilename = dynamic(
  () =>
    import("@/components/ai-elements/code-block").then(
      (mod) => mod.CodeBlockFilename,
    ),
  { ssr: false },
);
const CodeBlockActions = dynamic(
  () =>
    import("@/components/ai-elements/code-block").then(
      (mod) => mod.CodeBlockActions,
    ),
  { ssr: false },
);
const CodeBlockCopyButton = dynamic(
  () =>
    import("@/components/ai-elements/code-block").then(
      (mod) => mod.CodeBlockCopyButton,
    ),
  { ssr: false },
);

type MarkdownProps = ComponentProps<typeof ReactMarkdown> & {
  className?: string;
};

export function Markdown({ className, children, ...props }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-[15px] dark:prose-invert max-w-none",
        // ── Headings ──
        "[&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:tracking-tight",
        "[&_h2]:text-foreground [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight",
        "[&_h3]:text-foreground [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
        "[&_h4]:text-foreground [&_h4]:mt-3 [&_h4]:mb-1.5 [&_h4]:text-sm [&_h4]:font-semibold",
        // ── Paragraphs ──
        "[&_p]:text-foreground/85 [&_p]:my-2.5 [&_p]:leading-7",
        // ── Unordered lists (bullets) ──
        "[&_ul]:my-3 [&_ul]:space-y-1.5 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ul_li::marker]:text-primary/60",
        "[&_ul_li]:text-foreground/85 [&_ul_li]:pl-1",
        // ── Ordered lists (numbers) ──
        "[&_ol]:my-3 [&_ol]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_ol_li::marker]:text-primary/70 [&_ol_li::marker]:font-semibold",
        "[&_ol_li]:text-foreground/85 [&_ol_li]:pl-1",
        // ── Nested lists ──
        "[&_ol_ol]:my-1 [&_ol_ul]:my-1 [&_ul_ol]:my-1 [&_ul_ul]:my-1",
        // ── Blockquotes ──
        "[&_blockquote]:border-primary/40 [&_blockquote]:bg-muted/40 [&_blockquote]:text-foreground/80 [&_blockquote]:my-3 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-[3px] [&_blockquote]:px-4 [&_blockquote]:py-2 [&_blockquote]:italic",
        // ── Inline code ──
        "[&_code:not(pre_code)]:bg-muted [&_code:not(pre_code)]:text-foreground [&_code:not(pre_code)]:rounded-md [&_code:not(pre_code)]:px-1.5 [&_code:not(pre_code)]:py-0.5 [&_code:not(pre_code)]:text-[13px] [&_code:not(pre_code)]:font-medium",
        // ── Pre/code blocks ──
        "[&_pre]:my-4 [&_pre]:rounded-lg [&_pre]:bg-transparent [&_pre]:p-0",
        "[&_code]:font-mono [&_code]:text-[13px]",
        // ── Links ──
        "[&_a]:text-primary [&_a]:decoration-primary/30 hover:[&_a]:decoration-primary [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2",
        // ── Tables ──
        "[&_table]:border-border/60 [&_table]:my-4 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:border [&_table]:border-collapse",
        "[&_thead]:bg-muted/80",
        "[&_th]:text-muted-foreground [&_th]:border-border/60 [&_th]:border-b [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wider [&_th]:uppercase",
        "[&_td]:border-border/40 [&_td]:border-b [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-sm",
        "[&_tr:last-child_td]:border-b-0",
        "[&_tbody_tr]:bg-background [&_tbody_tr:hover]:bg-muted/30",
        // ── Horizontal rule ──
        "[&_hr]:border-border/50 [&_hr]:my-6",
        // ── Strong / Em ──
        "[&_strong]:text-foreground [&_strong]:font-bold",
        "[&_em]:text-foreground/80",
        // ── Task lists ──
        "[&_li]:has([type=checkbox]):list-none [&_li]:has([type=checkbox]):pl-0",
        "[&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:rounded [&_input[type=checkbox]]:border-border",
        // ── First/last child ──
        "[&_*:first-child]:mt-0 [&_*:last-child]:mb-0",
        className,
      )}
    >
      <ReactMarkdown
        {...props}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
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
          // Custom table rendering
          table({ children, ...props }: any) {
            return (
              <div className="border-border/60 my-4 overflow-x-auto rounded-lg border">
                <table className="w-full border-collapse" {...props}>
                  {children}
                </table>
              </div>
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

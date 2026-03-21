"use client";

import { memo } from "react";
import { CollapsibleContent } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@/lib/mermaid-plugin";
import type { ReasoningContentProps } from "./reasoning";

export const ReasoningContentInner = memo(
  ({ className, children, ...props }: ReasoningContentProps) => (
    <CollapsibleContent
      className={cn(
        "mt-4 text-sm",
        "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 text-muted-foreground data-[state=closed]:animate-out data-[state=open]:animate-in outline-none",
        className,
      )}
      {...props}
    >
      <Streamdown plugins={{ cjk, code, math, mermaid }} {...props}>
        {children}
      </Streamdown>
    </CollapsibleContent>
  ),
);

ReasoningContentInner.displayName = "ReasoningContentInner";

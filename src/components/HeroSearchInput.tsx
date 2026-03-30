"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const PROMPT_TEXTS = [
  "Find me a React charting library",
  "What are the best CLI tools for developers?",
  "Suggest open-source alternatives to Notion",
  "Show me machine learning frameworks in Python",
  "Find self-hosted analytics tools",
];

export function HeroSearchInput() {
  const router = useRouter();
  const [displayedText, setDisplayedText] = React.useState("");
  const [promptIndex, setPromptIndex] = React.useState(0);
  const [charIndex, setCharIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<"typing" | "pausing" | "deleting">(
    "typing",
  );

  React.useEffect(() => {
    const currentPrompt = PROMPT_TEXTS[promptIndex] ?? "";

    if (phase === "typing") {
      if (charIndex < currentPrompt.length) {
        const timeout = setTimeout(
          () => {
            setDisplayedText(currentPrompt.slice(0, charIndex + 1));
            setCharIndex((prev) => prev + 1);
          },
          55 + Math.random() * 35,
        );
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setPhase("deleting"), 2800);
        return () => clearTimeout(timeout);
      }
    }

    if (phase === "deleting") {
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentPrompt.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        }, 30);
        return () => clearTimeout(timeout);
      } else {
        setPhase("typing");
        setPromptIndex((prev) => (prev + 1) % PROMPT_TEXTS.length);
      }
    }
  }, [charIndex, phase, promptIndex]);

  const handleGenerate = () => {
    const prompt = (displayedText || PROMPT_TEXTS[promptIndex]) ?? "";
    if (!prompt.trim()) return;
    router.push(`/ai/chat?prompt=${encodeURIComponent(prompt.trim())}`);
  };

  return (
    <div className="mb-14 w-full max-w-2xl px-3 sm:mb-16 sm:px-4">
      <div
        className={cn(
          "glow-generate",
          "border-border bg-background/80 mx-auto flex w-full items-center rounded-full border p-1 backdrop-blur-sm sm:p-1.5",
        )}
      >
        <div className="flex items-center justify-center pl-2.5 sm:pl-3">
          <Sparkles className="text-primary h-4 w-4 sm:h-4.5 sm:w-4.5" />
        </div>
        <div className="min-w-0 flex-1 overflow-hidden px-2 py-2 sm:px-3 sm:py-2.5">
          <span className="text-foreground block truncate text-sm select-none sm:text-base">
            {displayedText}
            <span className="bg-primary/80 ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full align-text-bottom sm:h-5" />
          </span>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className={cn(
            "bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-medium sm:px-4",
            "transition-all duration-200 hover:opacity-90",
            "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
          style={{ animation: "glow-pulse 2.5s ease-in-out infinite" }}
        >
          <ArrowUp className="h-4 w-4" />
          <span className="hidden sm:inline">Generate</span>
        </button>
      </div>
    </div>
  );
}

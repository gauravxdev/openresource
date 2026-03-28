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
  const [text, setText] = React.useState("");
  const [displayedText, setDisplayedText] = React.useState("");
  const [promptIndex, setPromptIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<"typing" | "pausing" | "deleting">(
    "typing",
  );
  const [charIndex, setCharIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Typing animation effect
  React.useEffect(() => {
    if (text) return; // Pause animation while user types

    const currentPrompt = PROMPT_TEXTS[promptIndex] ?? "";

    if (phase === "typing") {
      if (charIndex < currentPrompt.length) {
        const timeout = setTimeout(
          () => {
            setDisplayedText(currentPrompt.slice(0, charIndex + 1));
            setCharIndex((prev) => prev + 1);
          },
          50 + Math.random() * 30,
        );
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => setPhase("deleting"), 2500);
        return () => clearTimeout(timeout);
      }
    }

    if (phase === "deleting") {
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentPrompt.slice(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        }, 25);
        return () => clearTimeout(timeout);
      } else {
        setPhase("typing");
        setPromptIndex((prev) => (prev + 1) % PROMPT_TEXTS.length);
      }
    }
  }, [charIndex, phase, promptIndex, text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = text || displayedText;
    if (!prompt.trim()) return;
    router.push(`/ai/chat?prompt=${encodeURIComponent(prompt.trim())}`);
  };

  const handleFocus = () => {
    if (!text) {
      setDisplayedText("");
      setCharIndex(0);
      setPhase("typing");
    }
  };

  return (
    <div className="mb-14 w-full max-w-2xl px-4 sm:mb-16">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "glow-generate",
          "border-border bg-background/80 mx-auto flex w-full items-center rounded-full border p-1.5 backdrop-blur-sm",
          "focus-within:ring-primary/30 transition-shadow focus-within:ring-2",
        )}
      >
        <div className="flex items-center justify-center pl-3">
          <Sparkles className="text-primary h-4.5 w-4.5" />
        </div>
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={handleFocus}
            onBlur={() => {
              if (!text) {
                setDisplayedText("");
                setCharIndex(0);
                setPhase("typing");
              }
            }}
            className="text-foreground placeholder:text-muted-foreground/70 w-full bg-transparent px-3 py-2.5 text-base focus:outline-none"
            aria-label="Search resources"
            placeholder=""
          />
          {!text && !inputRef.current?.matches(":focus") && (
            <span
              className="text-muted-foreground/50 pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-base select-none"
              aria-hidden="true"
            >
              {displayedText}
              <span className="animate-pulse">|</span>
            </span>
          )}
        </div>
        <button
          type="submit"
          className={cn(
            "bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium",
            "transition-all duration-200 hover:opacity-90",
            "focus-visible:outline-ring focus-visible:outline-2 focus-visible:outline-offset-2",
          )}
          style={{ animation: "glow-pulse 2.5s ease-in-out infinite" }}
        >
          <ArrowUp className="h-4 w-4" />
          <span className="hidden sm:inline">Generate</span>
        </button>
      </form>
    </div>
  );
}

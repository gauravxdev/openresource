"use client";

import { SparklesIcon } from "./icons";
import { Search, Code, FileText, Lightbulb } from "lucide-react";

export const Greeting = () => {
  const capabilities = [
    { icon: Search, label: "Search the web" },
    { icon: Code, label: "Write code" },
    { icon: FileText, label: "Analyze content" },
    { icon: Lightbulb, label: "Answer questions" },
  ];

  return (
    <div className="mx-auto flex size-full max-w-2xl flex-col items-center justify-center px-4 md:px-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex flex-col items-center gap-4 text-center duration-700">
        {/* Logo */}
        <div className="from-primary to-primary/70 text-primary-foreground shadow-primary/20 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
          <SparklesIcon size={24} />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            OpenResource AI
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            How can I help you today?
          </p>
        </div>

        {/* Capabilities */}
        <div
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both mt-4 flex flex-wrap justify-center gap-2 duration-500"
          style={{ animationDelay: "300ms" }}
        >
          {capabilities.map((cap) => (
            <div
              key={cap.label}
              className="border-border/60 bg-muted/40 text-muted-foreground flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs"
            >
              <cap.icon size={13} className="text-muted-foreground/70" />
              {cap.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

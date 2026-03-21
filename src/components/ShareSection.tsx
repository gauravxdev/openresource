"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, Facebook, Linkedin, MessageCircle, Twitter } from "lucide-react";

interface ShareSectionProps {
  url: string;
  title: string;
}

export function ShareSection({ url, title }: ShareSectionProps) {
  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard", {
        icon: <Copy className="h-4 w-4" />,
      });
    } catch {
      toast.error("Failed to copy link");
    }
  }, [url]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger if 'c' is pressed and not in an input/textarea
      if (
        e.key.toLowerCase() === "c" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        void handleCopy();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCopy]);

  const shareLinks = [
    {
      name: "X",
      icon: <Twitter className="h-3.5 w-3.5" />,
      url: `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-3.5 w-3.5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-3.5 w-3.5" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
        name: "WhatsApp",
        icon: <MessageCircle className="h-3.5 w-3.5" />,
        url: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      },
  ];

  return (
    <div className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900/50">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <span>Copy Link</span>
        <kbd className="pointer-events-none hidden h-4 select-none items-center gap-1 rounded border border-neutral-200 bg-white px-1 font-mono text-[10px] font-medium text-neutral-500 opacity-100 dark:border-neutral-800 dark:bg-neutral-950 sm:inline-flex">
          C
        </kbd>
      </button>

      <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800" />

      <div className="flex items-center gap-2">
        <span className="text-neutral-500">Share:</span>
        <div className="flex items-center gap-1.5">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              title={`Share on ${link.name}`}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

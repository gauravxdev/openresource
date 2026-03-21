"use client";

import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "use-debounce";

export function AdminSearch({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState(defaultValue);
  const [query] = useDebounce(text, 500);

  // Use stable string reference to prevent infinite loops
  const queryString = searchParams.toString();

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const currentQuery = params.get("q") ?? "";

    // Only update if search query has actually changed
    if (query === currentQuery) return;

    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    // Always reset to page 1 on NEW search
    params.set("page", "1");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [query, pathname, router, queryString]);

  const handleClear = () => {
    setText("");
  };

  return (
    <div className="relative max-w-md min-w-[200px] flex-1">
      <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
      <Input
        type="search"
        placeholder="Search resources..."
        className="[&::-ms-clear]:display-none border-none bg-neutral-900/50 pr-20 pl-8 focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-1">
        {isPending ? (
          <div className="border-primary mx-1 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
        ) : text ? (
          <button
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

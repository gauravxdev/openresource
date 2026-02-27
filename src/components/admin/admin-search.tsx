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

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
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
    }, [query, pathname, router, searchParams]);

    const handleClear = () => {
        setText("");
    };

    return (
        <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search resources..."
                className="pl-8 pr-20 border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-neutral-900/50 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-ms-clear]:display-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isPending ? (
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-1" />
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

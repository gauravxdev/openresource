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
        if (query) {
            params.set("q", query);
        } else {
            params.delete("q");
        }
        // Always reset to page 1 on search
        params.set("page", "1");

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [query, pathname, router, searchParams]);

    const handleClear = () => {
        setText("");
    };

    return (
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search resources..."
                className="pl-8 pr-8"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            {text && (
                <button
                    onClick={handleClear}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    title="Clear search"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
            {isPending && (
                <div className="absolute right-10 top-3">
                    <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            )}
        </div>
    );
}

"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  selectedSort: string;
}

const SORT_OPTIONS = [
  { label: "Latest", value: "latest" },
  { label: "Most Popular", value: "popularity" },
  { label: "Name (A to Z)", value: "alphabetical" },
  { label: "Name (Z to A)", value: "alphabetical-reverse" },
  { label: "Most Stars", value: "stars" },
  { label: "Most Forks", value: "forks" },
  { label: "Last Commit", value: "last-commit" },
  { label: "Repository Age", value: "age" },
];

export const SearchFilters = React.memo(function SearchFilters({
  selectedSort,
}: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = React.useState(initialSearch);
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Use stable string reference to prevent infinite loops from searchParams object identity changes
  const queryString = searchParams.toString();

  // Update URL when debounced search term changes
  React.useEffect(() => {
    const params = new URLSearchParams(queryString);
    const currentQuery = params.get("q") ?? "";

    // Only update if the search term actually changed
    if (debouncedSearch === currentQuery) return;

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    params.set("page", "1"); // Reset to page 1 on new search

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, pathname, router, queryString]);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "latest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.set("page", "1"); // Reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 border-neutral-200 bg-white pl-10 dark:border-neutral-800 dark:bg-neutral-900/50"
        />
      </div>

      {/* Sort Select — Premium UI with Shadcn Select */}
      <div className="flex items-center gap-2">
        <Select value={selectedSort} onValueChange={handleSortChange}>
          <SelectTrigger className="h-10 w-[200px] border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="text-muted-foreground h-4 w-4" />
              <SelectValue placeholder="Order by" />
            </div>
          </SelectTrigger>
          <SelectContent className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            {SORT_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer focus:bg-neutral-100 dark:focus:bg-neutral-900"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

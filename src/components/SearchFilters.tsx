"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SearchFiltersProps {
  selectedSort: string
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
]

export const SearchFilters = React.memo(function SearchFilters({
  selectedSort,
}: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const initialSearch = searchParams.get("q") ?? ""
  const [searchTerm, setSearchTerm] = React.useState(initialSearch)
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Update URL when debounced search term changes
  React.useEffect(() => {
    const currentQuery = searchParams.get("q") ?? ""
    
    // Only update if the search term actually changed
    if (debouncedSearch === currentQuery) return

    const params = new URLSearchParams(searchParams.toString())
    if (debouncedSearch) {
      params.set("q", debouncedSearch)
    } else {
      params.delete("q")
    }
    params.set("page", "1") // Reset to page 1 on new search
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [debouncedSearch, pathname, router, searchParams])

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "latest") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }
    params.set("page", "1") // Reset to page 1 on filter
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50"
        />
      </div>

      {/* Sort Select — Premium UI with Shadcn Select */}
      <div className="flex items-center gap-2">
        <Select value={selectedSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[200px] h-10 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Order by" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
            {SORT_OPTIONS.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="focus:bg-neutral-100 dark:focus:bg-neutral-900 cursor-pointer"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
})


"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { searchResources, type ResourceWithCategories } from "@/actions/resources"

export function NavbarSearchDialog() {
    const router = useRouter()
    const [searchOpen, setSearchOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<ResourceWithCategories[]>([])
    const [isSearching, setIsSearching] = React.useState(false)

    // Fetch real search results with debounce
    React.useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                const result = await searchResources(searchQuery)
                if (result.success && result.data) {
                    setSearchResults(result.data)
                } else {
                    setSearchResults([])
                }
            } catch (error) {
                console.error("Search failed:", error)
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }

        const timer = setTimeout(() => {
            void fetchResults()
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleSearchSelect = (href: string) => {
        setSearchOpen(false)
        setSearchQuery("")
        router.push(href)
    }

    return (
        <Dialog open={searchOpen} onOpenChange={(open) => {
            setSearchOpen(open)
            if (!open) setSearchQuery("")
        }}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Search</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Search Resources</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search open-source resources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            autoFocus
                        />
                    </div>

                    {/* Filtered Results */}
                    {searchQuery.trim() && (
                        <div className="max-h-64 overflow-y-auto rounded-md border border-border">
                            {isSearching ? (
                                <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">
                                    Searching...
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {searchResults.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleSearchSelect(`/resource/${result.slug}`)}
                                            className="w-full flex flex-col items-start gap-1 p-3 text-left hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span className="font-medium">{result.name}</span>
                                                {result.categories[0] && (
                                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                        {result.categories[0].name}
                                                    </span>
                                                )}
                                            </div>
                                            {result.oneLiner && (
                                                <span className="text-xs text-muted-foreground line-clamp-1">{result.oneLiner}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                    No results found for &ldquo;{searchQuery}&rdquo;
                                </div>
                            )}
                        </div>
                    )}

                    {!searchQuery.trim() && (
                        <p className="text-xs text-muted-foreground text-center">
                            Start typing to search resources...
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

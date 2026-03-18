"use client"

import React, { useState, useMemo } from "react"
import { WindowsAppCard } from "@/components/WindowsAppCard"
import { WindowsAppFilters } from "@/components/WindowsAppFilters"
import { WindowsAppResultsSummary } from "@/components/WindowsAppResultsSummary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Pagination } from "@/components/ui/pagination-wrapper"
import { type WindowsApp, type SortOption } from "@/lib/windows-apps-data"

interface WindowsAppsClientProps {
    initialApps: WindowsApp[]
}

export default function WindowsAppsClient({ initialApps }: WindowsAppsClientProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState<SortOption>("popular")
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6

    const filteredAndSortedApps = useMemo(() => {
        const filtered = initialApps.filter(app =>
            app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.developer.toLowerCase().includes(searchTerm.toLowerCase())
        )

        switch (sortBy) {
            case "atoz":
                filtered.sort((a, b) => a.title.localeCompare(b.title))
                break
            case "ztoa":
                filtered.sort((a, b) => b.title.localeCompare(a.title))
                break
            case "rating":
                filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
                break
            case "downloads":
                filtered.sort((a, b) => {
                    const getVal = (val: string) => {
                        if (!val) return 0;
                        if (val.includes('B')) return parseFloat(val) * 1000000000;
                        if (val.includes('M')) return parseFloat(val) * 1000000;
                        if (val.includes('k')) return parseFloat(val) * 1000;
                        return parseFloat(val) || 0;
                    }
                    return getVal(b.downloads) - getVal(a.downloads);
                })
                break
            case "popular":
            default:
                filtered.sort((a, b) => {
                    const getVal = (val: string) => {
                        if (!val) return 0;
                        if (val.includes('B')) return parseFloat(val) * 1000000000;
                        if (val.includes('M')) return parseFloat(val) * 1000000;
                        if (val.includes('k')) return parseFloat(val) * 1000;
                        return parseFloat(val) || 0;
                    }
                    return getVal(b.downloads) - getVal(a.downloads);
                })
                break
        }

        return filtered
    }, [searchTerm, sortBy, initialApps])

    const totalPages = Math.ceil(filteredAndSortedApps.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedApps = filteredAndSortedApps.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    React.useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1)
        }
    }, [searchTerm, sortBy, currentPage, totalPages])

    return (
        <div className="w-full bg-background min-h-screen">
            <div className="mx-auto max-w-[1152px] px-5 pb-20 pt-8 md:px-6 md:pt-12">
                <div className="mb-6">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Windows Apps</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Windows Apps</h1>
                    <p className="text-muted-foreground">
                        Discover popular Windows applications and software
                    </p>
                </div>

                <WindowsAppFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />

                <WindowsAppResultsSummary
                    filteredCount={paginatedApps.length}
                    totalCount={filteredAndSortedApps.length}
                    sortBy={sortBy}
                    searchTerm={searchTerm}
                />

                {filteredAndSortedApps.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {paginatedApps.map((app) => (
                            <WindowsAppCard key={app.id} app={app} />
                        ))}
                    </div>
                ) : (
                    <Card className="border border-neutral-200 bg-neutral-100 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
                        <CardContent className="flex flex-col items-center gap-4">
                            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                No apps found matching your criteria.
                            </p>
                            <Button
                                variant="outline"
                                className="rounded-full border-neutral-300 bg-neutral-200 px-5 text-sm text-neutral-700 hover:bg-neutral-300 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200 dark:hover:bg-neutral-800"
                                onClick={() => {
                                    setSearchTerm("")
                                    setSortBy("popular")
                                }}
                            >
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {filteredAndSortedApps.length > 0 && totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

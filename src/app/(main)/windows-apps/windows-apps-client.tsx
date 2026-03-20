"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WindowsAppCard } from "@/components/WindowsAppCard";
import { WindowsAppFilters } from "@/components/WindowsAppFilters";
import { WindowsAppResultsSummary } from "@/components/WindowsAppResultsSummary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination-wrapper";
import { type WindowsApp, type SortOption } from "@/lib/windows-apps-data";

interface WindowsAppsClientProps {
  initialApps: WindowsApp[];
  totalCount: number;
  currentPage: number;
}

export default function WindowsAppsClient({
  initialApps,
  totalCount,
  currentPage,
}: WindowsAppsClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const itemsPerPage = 12;

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  // Client-side filtering within the current page
  const filteredApps = useMemo(() => {
    return initialApps.filter(
      (app) =>
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, initialApps]);

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-5 pt-8 pb-20 md:px-6 md:pt-12">
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
          <h1 className="mb-2 text-3xl font-bold">Windows Apps</h1>
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
          filteredCount={filteredApps.length}
          totalCount={totalCount}
          sortBy={sortBy}
          searchTerm={searchTerm}
        />

        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredApps.map((app) => (
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
                  setSearchTerm("");
                  router.push(window.location.pathname);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {totalCount > itemsPerPage && (
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
  );
}

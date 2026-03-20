"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GitHubRepoCard } from "@/components/GitHubRepoCard";
import { Badge } from "@/components/ui/badge";
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
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
}

interface GitHubReposClientProps {
  initialRepos: GitHubRepo[];
  totalCount: number;
  currentPage: number;
}

type SortOption =
  | "trending"
  | "newest"
  | "oldest"
  | "atoz"
  | "ztoa"
  | "stars"
  | "forks";

export default function GitHubReposClient({
  initialRepos,
  totalCount,
  currentPage,
}: GitHubReposClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("trending");
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
  const filteredRepos = useMemo(() => {
    return initialRepos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.language.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, initialRepos]);

  return (
    <div className="bg-background min-h-screen w-full">
      {/* Main content container with same width as navbar */}
      <div className="mx-auto max-w-[1152px] px-5 pt-8 pb-20 md:px-6 md:pt-12">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>GitHub Repositories</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Page Title and Description */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">GitHub Repositories</h1>
          <p className="text-muted-foreground">
            Discover popular open source projects and repositories
          </p>
        </div>

        {/* Search and Filters - Exact same layout as MainContainer */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <Filter className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px] pl-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="atoz">A to Z</SelectItem>
                <SelectItem value="ztoa">Z to A</SelectItem>
                <SelectItem value="stars">Most Stars</SelectItem>
                <SelectItem value="forks">Most Forks</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary - Exact same layout as MainContainer */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {filteredRepos.length} of {totalCount} repositories
          </p>
          <div className="flex gap-2">
            {sortBy !== "trending" && (
              <Badge
                variant="secondary"
                className="border-gray-700/50 bg-gray-800/80 text-gray-300"
              >
                {sortBy}
              </Badge>
            )}
            {sortBy === "trending" && (
              <Badge
                variant="secondary"
                className="border-gray-700/50 bg-gray-800/80 text-gray-300"
              >
                Trending
              </Badge>
            )}
            {searchTerm && (
              <Badge
                variant="outline"
                className="border-gray-700/50 text-gray-400"
              >
                &ldquo;{searchTerm ?? ""}&rdquo;
              </Badge>
            )}
          </div>
        </div>

        {/* Repository Cards Grid */}
        {filteredRepos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRepos.map((repo, index) => (
              <GitHubRepoCard
                key={index}
                name={repo.name}
                description={repo.description}
                language={repo.language}
                stars={repo.stars}
                forks={repo.forks}
                url={repo.url}
              />
            ))}
          </div>
        ) : (
          <Card className="border border-neutral-200 bg-neutral-100 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                No repositories found matching your criteria.
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

        {/* Pagination */}
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

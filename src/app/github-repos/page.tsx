"use client"

import React, { useState, useMemo } from "react"
import { GitHubRepoCard } from "@/components/GitHubRepoCard"
import { Badge } from "@/components/ui/badge"
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
import { Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for demonstration
const mockRepos = [
  {
    name: "react",
    description: "A declarative, efficient, and flexible JavaScript library for building user interfaces. React makes it painless to create interactive UIs.",
    language: "JavaScript",
    stars: 224000,
    forks: 47000,
    url: "https://github.com/facebook/react"
  },
  {
    name: "next.js",
    description: "The React Framework for Production. Next.js gives you the best developer experience with all the features you need for production.",
    language: "JavaScript",
    stars: 122000,
    forks: 27000,
    url: "https://github.com/vercel/next.js"
  },
  {
    name: "tailwindcss",
    description: "A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
    language: "CSS",
    stars: 80000,
    forks: 8500,
    url: "https://github.com/tailwindlabs/tailwindcss"
  },
  {
    name: "typescript",
    description: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.",
    language: "TypeScript",
    stars: 98000,
    forks: 12000,
    url: "https://github.com/microsoft/TypeScript"
  },
  {
    name: "vercel",
    description: "Develop. Preview. Ship. Vercel is the platform for frontend developers, providing the speed and reliability innovators need.",
    language: "TypeScript",
    stars: 12000,
    forks: 2200,
    url: "https://github.com/vercel/vercel"
  },
  {
    name: "prisma",
    description: "Next-generation ORM for Node.js & TypeScript. Prisma helps developers build faster and make fewer errors with an intuitive data model.",
    language: "TypeScript",
    stars: 37000,
    forks: 1400,
    url: "https://github.com/prisma/prisma"
  },
  {
    name: "vue",
    description: "Progressive JavaScript framework for building user interfaces.",
    language: "JavaScript",
    stars: 206000,
    forks: 35000,
    url: "https://github.com/vuejs/vue"
  },
  {
    name: "angular",
    description: "Platform for building mobile and desktop web applications.",
    language: "TypeScript",
    stars: 95000,
    forks: 26000,
    url: "https://github.com/angular/angular"
  },
  {
    name: "svelte",
    description: "Cybernetically enhanced web apps - build apps faster.",
    language: "JavaScript",
    stars: 76000,
    forks: 4200,
    url: "https://github.com/sveltejs/svelte"
  },
  {
    name: "express",
    description: "Fast, unopinionated, minimalist web framework for Node.js.",
    language: "JavaScript",
    stars: 63000,
    forks: 17000,
    url: "https://github.com/expressjs/express"
  },
  {
    name: "django",
    description: "The Web framework for perfectionists with deadlines.",
    language: "Python",
    stars: 75000,
    forks: 25000,
    url: "https://github.com/django/django"
  },
  {
    name: "flask",
    description: "The Python micro framework for building web applications.",
    language: "Python",
    stars: 66000,
    forks: 18000,
    url: "https://github.com/pallets/flask"
  }
]

type SortOption = "trending" | "newest" | "oldest" | "atoz" | "ztoa" | "stars" | "forks"

export default function GitHubRepos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("trending")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3 // Show 3 items per page to demonstrate pagination

  const filteredAndSortedRepos = useMemo(() => {
    let filtered = mockRepos.filter(repo =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.language.toLowerCase().includes(searchTerm.toLowerCase())
    )

    switch (sortBy) {
      case "atoz":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "ztoa":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "stars":
        filtered.sort((a, b) => b.stars - a.stars)
        break
      case "forks":
        filtered.sort((a, b) => b.forks - a.forks)
        break
      case "trending":
      default:
        filtered.sort((a, b) => b.stars - a.stars)
        break
    }

    return filtered
  }, [searchTerm, sortBy])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSortedRepos.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRepos = filteredAndSortedRepos.slice(startIndex, startIndex + itemsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset to first page when filters change
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [searchTerm, sortBy, currentPage, totalPages])

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Main content container with same width as navbar */}
      <div className="mx-auto max-w-[1152px] px-5 pb-20 pt-8 md:px-6 md:pt-12">
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
          <h1 className="text-3xl font-bold mb-2">GitHub Repositories</h1>
          <p className="text-muted-foreground">
            Discover popular open source projects and repositories
          </p>
        </div>

        {/* Search and Filters - Exact same layout as MainContainer */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-400 text-sm">
            Showing {paginatedRepos.length} of {filteredAndSortedRepos.length} repositories
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-gray-800/80 text-gray-300 border-gray-700/50">
              {sortBy === "trending" ? "Trending" : sortBy}
            </Badge>
            {searchTerm && (
              <Badge variant="outline" className="border-gray-700/50 text-gray-400">
                "{searchTerm}"
              </Badge>
            )}
          </div>
        </div>

        {/* Repository Cards Grid */}
        {filteredAndSortedRepos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedRepos.map((repo, index) => (
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
                  setSearchTerm("")
                  setSortBy("trending")
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination - Always at bottom */}
        {filteredAndSortedRepos.length > 0 && totalPages > 1 && (
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

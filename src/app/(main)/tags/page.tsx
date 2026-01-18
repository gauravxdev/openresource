"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { Home, Search } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TagItem = {
  name: string
  count: number
}

const tagItems: TagItem[] = [
  { name: "ai", count: 51 },
  { name: "authentication", count: 12 },
  { name: "agent", count: 8 },
  { name: "anthropic", count: 6 },
  { name: "airtable", count: 6 },
  { name: "alerting", count: 5 },
  { name: "aws", count: 4 },
  { name: "apm", count: 4 },
  { name: "analytics", count: 35 },
  { name: "automation", count: 11 },
  { name: "angular", count: 9 },
  { name: "api", count: 22 },
  { name: "api-client", count: 7 },
  { name: "accounting", count: 5 },
  { name: "activitypub", count: 4 },
  { name: "app", count: 4 },
  { name: "authorization", count: 4 },
  { name: "android", count: 4 },
  { name: "ai-agents", count: 9 },
  { name: "agents", count: 7 },
  { name: "azure", count: 6 },
  { name: "aisdk", count: 2 },
]

const alphabetFilters = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), "&"] as const
type LetterFilter = (typeof alphabetFilters)[number]

type SortOption = "popular" | "atoz" | "ztoa"

export default function TagsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLetter, setSelectedLetter] = useState<LetterFilter>("All")
  const [sortBy, setSortBy] = useState<SortOption>("popular")

  const filteredTags = useMemo(() => {
    const matches = tagItems.filter((tag) => {
      const lowerName = tag.name.toLowerCase()
      const matchesSearch = lowerName.includes(searchTerm.toLowerCase())

      let matchesLetter = true
      if (selectedLetter !== "All") {
        if (selectedLetter === "&") {
          matchesLetter = !/^[a-z]/i.test(lowerName)
        } else {
          matchesLetter = lowerName.startsWith(selectedLetter.toLowerCase())
        }
      }

      return matchesSearch && matchesLetter
    })

    const sorted = [...matches]
    switch (sortBy) {
      case "atoz":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "ztoa":
        sorted.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "popular":
      default:
        sorted.sort((a, b) => b.count - a.count)
        break
    }

    return sorted
  }, [searchTerm, selectedLetter, sortBy])

  const handleReset = () => {
    setSearchTerm("")
    setSelectedLetter("All")
    setSortBy("popular")
  }

  return (
    <div className="w-full bg-background min-h-screen">
      <div className="mx-auto max-w-[1152px] px-4 pb-20 pt-12 md:px-6">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="inline-flex items-center gap-1 text-sm">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Tags</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-10 space-y-3">
          <div className="text-sm text-muted-foreground">Tags</div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Browse Open Source Tags
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            Discover topics to find your best Open Source resource options.
          </p>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-12 h-11 rounded-full"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleReset}
                className="rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground hover:border-border hover:bg-neutral-100/40 hover:text-foreground dark:hover:bg-neutral-800/50"
              >
                Reset
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Order by</span>
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                >
                  <SelectTrigger className="w-[180px] rounded-full border-border/60 bg-background/80 text-sm h-11">
                    <SelectValue placeholder="Order by" />
                  </SelectTrigger>
                  <SelectContent className="text-sm">
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="atoz">A to Z</SelectItem>
                    <SelectItem value="ztoa">Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-between">
            {alphabetFilters.map((letter) => {
              const isActive = selectedLetter === letter
              return (
                <Button
                  key={letter}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLetter(letter)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide min-w-[32px] ${isActive
                      ? "bg-foreground text-background hover:bg-foreground"
                      : "border-border/60 text-muted-foreground hover:border-border hover:bg-neutral-100/40 hover:text-foreground dark:hover:bg-neutral-800/40"
                    }`}
                >
                  {letter}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTags.map((tag) => (
              <div key={tag.name} className="group flex items-center justify-between rounded-2xl border border-border/50 bg-background/60 px-5 py-4 transition-all hover:border-border hover:bg-muted/40">
                <span className="text-base font-medium capitalize text-foreground group-hover:text-foreground">
                  {tag.name}
                </span>
                <span className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{tag.count}</span>
              </div>
            ))}
          </div>

          {filteredTags.length === 0 && (
            <div className="mt-12 rounded-2xl border border-dashed border-border/60 px-8 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No tags match your filters. Try adjusting your search or letter selection.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

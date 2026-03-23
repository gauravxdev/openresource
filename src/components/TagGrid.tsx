"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TagItem = {
  name: string;
  count: number;
};

const PAGE_SIZE = 20;

const alphabetFilters = [
  "All",
  ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  "&",
] as const;
type LetterFilter = (typeof alphabetFilters)[number];

type SortOption = "popular" | "atoz" | "ztoa";

export function TagGrid({ tags }: { tags: TagItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<LetterFilter>("All");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filteredTags = useMemo(() => {
    const matches = tags.filter((tag) => {
      const lowerName = tag.name.toLowerCase();
      const matchesSearch = lowerName.includes(searchTerm.toLowerCase());

      let matchesLetter = true;
      if (selectedLetter !== "All") {
        if (selectedLetter === "&") {
          matchesLetter = !/^[a-z]/i.test(lowerName);
        } else {
          matchesLetter = lowerName.startsWith(selectedLetter.toLowerCase());
        }
      }

      return matchesSearch && matchesLetter;
    });

    const sorted = [...matches];
    switch (sortBy) {
      case "atoz":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "ztoa":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "popular":
      default:
        sorted.sort((a, b) => b.count - a.count);
        break;
    }

    return sorted;
  }, [tags, searchTerm, selectedLetter, sortBy]);

  const visibleTags = filteredTags.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTags.length;

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSelectedLetter("All");
    setSortBy("popular");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              className="h-11 rounded-full pl-12"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleReset}
              className="border-border/60 text-muted-foreground hover:border-border hover:text-foreground rounded-full border px-4 py-2 text-sm font-medium hover:bg-neutral-100/40 dark:hover:bg-neutral-800/50"
            >
              Reset
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Order by</span>
              <Select
                value={sortBy}
                onValueChange={(value) => {
                  setSortBy(value as SortOption);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                <SelectTrigger className="border-border/60 bg-background/80 h-11 w-[180px] rounded-full text-sm">
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
            const isActive = selectedLetter === letter;
            return (
              <Button
                key={letter}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedLetter(letter);
                  setVisibleCount(PAGE_SIZE);
                }}
                className={`min-w-[32px] rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide uppercase ${
                  isActive
                    ? "bg-foreground text-background hover:bg-foreground"
                    : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground hover:bg-neutral-100/40 dark:hover:bg-neutral-800/40"
                }`}
              >
                {letter}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="mt-10">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleTags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags?filter=${encodeURIComponent(tag.name)}`}
              className="group border-border/50 bg-background/60 hover:border-border hover:bg-muted/40 flex items-center justify-between rounded-2xl border px-5 py-4 transition-all"
            >
              <span className="text-foreground group-hover:text-foreground text-base font-medium capitalize">
                {tag.name}
              </span>
              <span className="text-muted-foreground bg-muted/50 rounded-full px-3 py-1 text-sm">
                {tag.count}
              </span>
            </Link>
          ))}
        </div>

        {filteredTags.length === 0 && (
          <div className="border-border/60 mt-12 rounded-2xl border border-dashed px-8 py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No tags match your filters. Try adjusting your search or letter
              selection.
            </p>
          </div>
        )}

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              onClick={handleShowMore}
              className="border-border/60 text-muted-foreground hover:border-border hover:text-foreground rounded-full px-6 py-2 text-sm font-medium hover:bg-neutral-100/40 dark:hover:bg-neutral-800/50"
            >
              Show More
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

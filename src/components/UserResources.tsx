"use client";

import * as React from "react";
import { ResourceCard } from "@/components/ResourceCard";
import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination-wrapper";

const ITEMS_PER_PAGE = 9;

interface Resource {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  shortDescription: string | null;
  oneLiner: string | null;
  alternative: string | null;
  categories: { name: string }[];
  stars: number;
  forks: number;
  lastCommit: Date | null;
  logo: string | null;
  image: string | null;
}

interface UserResourcesProps {
  resources: Resource[];
}

export function UserResources({ resources }: UserResourcesProps) {
  const [currentPage, setCurrentPage] = React.useState(1);

  const totalPages = Math.ceil(resources.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResources = resources.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  if (resources.length === 0) {
    return (
      <Card className="border border-neutral-200 bg-neutral-100 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
        <CardContent className="flex flex-col items-center gap-4 py-8">
          <Package className="text-muted-foreground h-12 w-12 opacity-20" />
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            This user hasn&apos;t added any resources yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={{
              id: resource.id,
              slug: resource.slug,
              title: resource.name,
              description: resource.description ?? "",
              shortDescription: resource.shortDescription,
              oneLiner: resource.oneLiner,
              alternative: resource.alternative,
              category: resource.categories[0]?.name ?? "Uncategorized",
              stars: resource.stars.toString(),
              forks: resource.forks.toString(),
              lastCommit: timeAgo(resource.lastCommit),
              logo: resource.logo,
              image: resource.image ?? "/api/placeholder/400/250",
            }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

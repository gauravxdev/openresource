import React from "react";
import Link from "next/link";
import { ArrowLeft, FolderOpen, Home, Tag } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { TagGrid } from "@/components/TagGrid";
import { ResourceCard } from "@/components/ResourceCard";
import { MainPagination } from "@/components/MainPagination";
import { getAllTagsWithCount, getResourcesByTag } from "@/actions/resources";

export const metadata = {
  title: "Tags - OpenResource",
  description: "Browse open-source resources by tags.",
};

const ITEMS_PER_PAGE = 12;

const serializeDate = (date: Date | string | null) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

export default async function TagsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const { filter, page: pageStr } = await searchParams;

  if (filter) {
    const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);
    return <TagResourcesView tag={filter} page={page} />;
  }

  return <AllTagsView />;
}

async function AllTagsView() {
  const { data: tags } = await getAllTagsWithCount();

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-4 pt-6 pb-20 md:px-6">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-sm"
                  >
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
          <div className="text-muted-foreground text-sm">Tags</div>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight md:text-5xl">
            Browse Open Source Tags
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg md:text-xl">
            Discover topics to find your best Open Source resource options.
          </p>
        </div>

        {tags.length === 0 ? (
          <div className="border-border/60 mt-12 rounded-2xl border border-dashed px-8 py-12 text-center">
            <p className="text-muted-foreground text-sm">
              No tags found yet. Tags will appear once resources are added.
            </p>
          </div>
        ) : (
          <TagGrid tags={tags} />
        )}
      </div>
    </div>
  );
}

async function TagResourcesView({ tag, page }: { tag: string; page: number }) {
  const { data: resources, totalCount } = await getResourcesByTag(
    tag,
    page,
    ITEMS_PER_PAGE,
  );


  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-4 pt-6 pb-20 md:px-6">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-sm"
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/tags" className="text-sm">
                    Tags
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize">{tag}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-10 space-y-3">
          <div className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <Tag className="h-4 w-4" />
            <span className="capitalize">{tag}</span>
            <span className="text-muted-foreground/60">
              {totalCount} resource{totalCount !== 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight capitalize md:text-5xl">
            {tag} Resources
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg md:text-xl">
            Open-source resources tagged with &quot;{tag}&quot;.
          </p>
        </div>

        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="border-border/60 text-muted-foreground hover:border-border hover:text-foreground rounded-full border px-4 py-2 text-sm font-medium hover:bg-neutral-100/40 dark:hover:bg-neutral-800/50"
          >
            <Link href="/tags" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              All Tags
            </Link>
          </Button>
        </div>

        {!resources || resources.length === 0 ? (
          <div className="border-border/60 bg-muted/10 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-20 text-center">
            <div className="bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <FolderOpen className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No resources found</h3>
            <p className="text-muted-foreground max-w-sm">
              No resources have been tagged with &quot;{tag}&quot; yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <div key={resource.id} className="h-full">
                  <ResourceCard
                    resource={{
                      id: resource.id,
                      slug: resource.slug,
                      title: resource.name,
                      description: resource.description,
                      shortDescription: resource.shortDescription,
                      oneLiner: resource.oneLiner,
                      alternative: resource.alternative,
                      category: resource.categories[0]?.name ?? "Uncategorized",
                      stars: resource.stars.toString(),
                      forks: resource.forks.toString(),
                      lastCommit: resource.lastCommit
                        ? serializeDate(resource.lastCommit).split("T")[0]!
                        : serializeDate(resource.createdAt).split("T")[0]!,
                      image: resource.image ?? "/images/placeholder.png",
                      logo: resource.logo,
                    }}
                  />
                </div>
              ))}
            </div>

            <MainPagination
              currentPage={page}
              totalCount={totalCount}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </>
        )}
      </div>
    </div>
  );
}

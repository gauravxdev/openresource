/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { getMostForkedResources } from "@/actions/resources";
import { ResourceCard } from "@/components/ResourceCard";
import { MainPagination } from "@/components/MainPagination";
import { GitFork } from "lucide-react";

export const metadata = {
  title: "Most Forked - OpenResource",
  description:
    "Discover the most popular and widely forked open-source projects. Browse trending GitHub repositories and developer tools.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

const serializeDate = (date: Date | string | null) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

export default async function MostForkedResourcesPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const {
    data: resources,
    totalCount,
    success,
  } = await getMostForkedResources(page);

  return (
    <div className="mx-auto max-w-[1152px] px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 text-center md:mb-12 md:text-left">
        <h1 className="mb-3 text-3xl font-bold tracking-tight">Most Forked</h1>
        <p className="text-muted-foreground w-full text-lg md:max-w-3xl">
          Discover the most popular open-source projects based on fork count.
          These projects have been widely adopted and modified by the community.
        </p>
      </div>

      {!success || !resources || resources.length === 0 ? (
        <div className="border-border/60 bg-muted/10 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-20 text-center">
          <div className="bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <GitFork className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">No resources found</h3>
          <p className="text-muted-foreground max-w-sm">
            Check back later! We are constantly adding new resources.
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
                    category: resource.categories[0]?.name || "Uncategorized",
                    stars: resource.stars.toString(),
                    forks: resource.forks.toString(),
                    lastCommit: serializeDate(resource.createdAt).split(
                      "T",
                    )[0]!,
                    image: resource.image || "/images/placeholder.png",
                    logo: resource.logo,
                  }}
                />
              </div>
            ))}
          </div>

          <MainPagination
            currentPage={page}
            totalCount={totalCount}
            itemsPerPage={9}
          />
        </>
      )}
    </div>
  );
}

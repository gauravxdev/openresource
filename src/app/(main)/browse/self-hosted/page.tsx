/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { getSelfHostedResources } from "@/actions/resources";
import { ResourceCard } from "@/components/ResourceCard";
import { MainPagination } from "@/components/MainPagination";
import { Server } from "lucide-react";

export const metadata = {
  title: "Self-Hosted Resources - OpenResource",
  description:
    "Discover self-hosted open-source tools and applications. Browse projects you can run on your own servers for full control and privacy.",
};

interface Props {
  searchParams: Promise<{ page?: string }>;
}

const serializeDate = (date: Date | string | null) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

export default async function SelfHostedResourcesPage({ searchParams }: Props) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const {
    data: resources,
    totalCount,
    success,
  } = await getSelfHostedResources(page);

  return (
    <div className="mx-auto max-w-[1152px] px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 text-center md:mb-12 md:text-left">
        <h1 className="mb-3 text-3xl font-bold tracking-tight">
          Self-Hosted Resources
        </h1>
        <p className="text-muted-foreground w-full text-lg md:max-w-3xl">
          Discover open-source tools that you can host on your own
          infrastructure for full control and privacy.
        </p>
      </div>

      {!success || !resources || resources.length === 0 ? (
        <div className="border-border/60 bg-muted/10 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-20 text-center">
          <div className="bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <Server className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            No self-hosted resources found
          </h3>
          <p className="text-muted-foreground max-w-sm">
            Check back later! We are constantly adding new self-hosted
            alternatives.
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

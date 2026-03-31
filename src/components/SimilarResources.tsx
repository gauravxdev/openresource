import Link from "next/link";
import { getSimilarResources } from "@/actions/similar-resources";
import { ResourceCard } from "@/components/ResourceCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface SimilarResourcesProps {
  currentSlug: string;
  currentName: string;
}

export async function SimilarResources({
  currentSlug,
  currentName,
}: SimilarResourcesProps) {
  const { success, data: resources } = await getSimilarResources(
    currentSlug,
    6,
  );

  if (!success || resources.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-neutral-200 pt-12 dark:border-neutral-800">
      <div className="mb-8">
        <h2 className="text-foreground text-xl font-semibold">
          Similar Resources
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Discover more open-source projects like {currentName}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
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
              lastCommit: timeAgo(resource.lastCommit),
              logo: resource.logo,
              image: resource.image ?? "/api/placeholder/300/200",
            }}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="outline" asChild className="gap-2">
          <Link href="/categories">
            Browse All Resources
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

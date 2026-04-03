import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/server/db";
import {
  ResourceDetailView,
  type Resource,
} from "@/components/ResourceDetailView";
import { ResourceViewTracker } from "@/components/analytics/ResourceViewTracker";
import { SimilarResources } from "@/components/SimilarResources";
import { getContributors, parseGitHubUrl } from "@/lib/github";

interface ResourcePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://openresource.site";

  const resource = await db.resource.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      shortDescription: true,
      oneLiner: true,
    },
  });

  if (!resource) {
    return {
      title: "Resource Not Found - OpenResource",
    };
  }

  const title = resource.name;
  const description =
    resource.oneLiner ?? resource.shortDescription ?? resource.description;

  return {
    title: `${title} - OpenResource`,
    description: description.slice(0, 160),
    alternates: {
      canonical: `${baseUrl}/resource/${slug}`,
    },
    openGraph: {
      title: `${title} - OpenResource`,
      description: description.slice(0, 160),
      url: `${baseUrl}/resource/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - OpenResource`,
      description: description.slice(0, 160),
    },
  };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;

  const resource = await db.resource.findUnique({
    where: { slug },
    include: {
      categories: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
      },
      user: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
    },
  });

  if (!resource) {
    notFound();
  }

  // Cast to unknown then to Resource to handle Prisma type mismatches gracefully
  // and satisfy the linter without using 'any'
  const rawResource = resource as unknown as Resource;
  const resourceData: Resource = {
    ...rawResource,
    builtWith: rawResource.builtWith ?? null,
    tags: rawResource.tags ?? [],
  };

  const parsed = parseGitHubUrl(resourceData.repositoryUrl);
  const contributors = parsed
    ? await getContributors(parsed.owner, parsed.repo, 5)
    : [];

  return (
    <>
      <ResourceViewTracker
        resourceId={resourceData.id}
        resourceName={resourceData.name}
        resourceSlug={resourceData.slug}
      />
      <ResourceDetailView resource={resourceData} contributors={contributors}>
        <SimilarResources currentSlug={slug} currentName={resourceData.name} />
      </ResourceDetailView>
    </>
  );
}

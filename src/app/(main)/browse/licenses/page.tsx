/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import Link from "next/link";
import {
  getAllLicenses,
  getResourcesByLicense,
  getResources,
} from "@/actions/resources";
import { ResourceCard } from "@/components/ResourceCard";
import { MainPagination } from "@/components/MainPagination";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Browse by License - OpenResource",
  description:
    "Browse open-source projects by license type. Find MIT, Apache, GPL, and other open-source licensed software and developer resources.",
};

interface Props {
  searchParams: Promise<{ license?: string; page?: string }>;
}

const serializeDate = (date: Date | string | null) => {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
};

export default async function LicensesPage({ searchParams }: Props) {
  const { license, page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const { data: licenses, success: licensesSuccess } = await getAllLicenses();

  let resources: Awaited<ReturnType<typeof getResourcesByLicense>>["data"] = [];
  let totalCount = 0;
  let resourcesSuccess = true;

  if (license) {
    const result = await getResourcesByLicense(license, page);
    resources = result.data;
    totalCount = result.totalCount;
    resourcesSuccess = result.success;
  } else {
    const result = await getResources(page, 9);
    resources = result.data;
    totalCount = result.totalCount;
    resourcesSuccess = result.success;
  }

  return (
    <div className="mx-auto max-w-[1152px] px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8 text-center md:mb-12 md:text-left">
        <h1 className="mb-3 text-3xl font-bold tracking-tight">
          Browse by License
        </h1>
        <p className="text-muted-foreground w-full text-lg md:max-w-3xl">
          Explore open-source resources filtered by their license type.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Button variant={!license ? "default" : "outline"} size="sm" asChild>
          <Link href="/browse/licenses">All</Link>
        </Button>
        {licensesSuccess &&
          licenses.map((lic) => (
            <Button
              key={lic}
              variant={license === lic ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link
                href={`/browse/licenses?license=${encodeURIComponent(lic)}`}
              >
                {lic}
              </Link>
            </Button>
          ))}
      </div>

      {!resourcesSuccess || !resources || resources.length === 0 ? (
        <div className="border-border/60 bg-muted/10 flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-20 text-center">
          <div className="bg-muted mb-6 flex h-16 w-16 items-center justify-center rounded-full">
            <Scale className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">
            {!resourcesSuccess || !resources?.length
              ? "No resources found"
              : "Select a license"}
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {!resourcesSuccess || !resources?.length
              ? "No resources available yet."
              : "Choose a license type above to browse resources."}
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

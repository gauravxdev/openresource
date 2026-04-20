import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getResourcesByCategory } from "@/actions/resources";
import { getCategoryBySlug } from "@/actions/categories";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import MainContainer from "@/components/MainContainer";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://openresource.site";
  const { success, categoryName } = await getCategoryBySlug(slug);

  if (!success || !categoryName) {
    return {
      title: "Category Not Found - OpenResource",
    };
  }

  return {
    title: `${categoryName} Resources - OpenResource`,
    description: `Explore open-source ${categoryName} resources, tools, and projects. Find the best ${categoryName} solutions for your needs.`,
    alternates: {
      canonical: `${baseUrl}/category/${slug}`,
    },
    openGraph: {
      title: `${categoryName} Resources - OpenResource`,
      description: `Explore open-source ${categoryName} resources, tools, and projects.`,
      url: `${baseUrl}/category/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} Resources - OpenResource`,
      description: `Explore open-source ${categoryName} resources, tools, and projects.`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const currentPage = Number(pageStr) || 1;

  const {
    success,
    data: resources,
    totalCount,
    categoryName,
  } = await getResourcesByCategory(slug, currentPage);

  if (!success || !categoryName) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen w-full pt-4 md:pt-8">
      <div className="mx-auto max-w-[1152px] px-5 pb-4 md:px-6">
        <div className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/categories">Categories</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{categoryName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-6">
          <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
            {categoryName} Resources
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore projects in the {categoryName} category.
          </p>
        </div>
      </div>

      <MainContainer
        initialResources={resources}
        totalCount={totalCount || 0}
        currentPage={currentPage}
      />
    </div>
  );
}

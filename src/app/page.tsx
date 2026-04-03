import HeroSection from "@/components/HeroSection";
import { getResources } from "@/actions/resources";
import { getCategories } from "@/actions/categories";
import MainContainer from "@/components/MainContainer";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "OpenResource - Open Source Projects Directory",
  description:
    "Browse a curated collection of open-source projects, self-hosted tools, and applications. Find GitHub repos, Windows apps, Android apps, and developer resources.",
  alternates: {
    canonical: "https://openresource.site/",
  },
  openGraph: {
    title: "OpenResource - Open Source Projects Directory",
    description:
      "Browse a curated collection of open-source projects, self-hosted tools, and applications. Find GitHub repos, Windows apps, Android apps, and developer resources.",
    url: "https://openresource.site/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenResource - Open Source Projects Directory",
    description:
      "Browse a curated collection of open-source projects, self-hosted tools, and applications. Find GitHub repos, Windows apps, Android apps, and developer resources.",
  },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const { page: pageStr, category, q, sort } = await searchParams;
  const currentPage = Number(pageStr) || 1;
  const { data: resources, totalCount } = await getResources(
    currentPage,
    12,
    category,
    q,
    sort,
  );
  const { data: categories = [] } = await getCategories();

  return (
    <div>
      <HeroSection />
      <MainContainer
        initialResources={resources || []}
        totalCount={totalCount || 0}
        currentPage={currentPage}
        categories={categories.map((c) => c.name)}
        selectedCategory={category ?? "all"}
        searchTerm={q ?? ""}
        selectedSort={sort ?? "latest"}
      />
    </div>
  );
}

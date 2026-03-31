import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/server/db";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const revalidate = 60;

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { resources: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-6xl px-5 pt-12 pb-20 md:px-6">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Categories</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-12">
          <div className="text-muted-foreground text-sm">Categories</div>
          <h1 className="text-foreground mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Open Source Resource Categories
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-base md:text-lg">
            Browse top categories to find your best Open Source resource
            options.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group block"
              >
                <div className="border-border bg-card hover:bg-accent/50 flex items-center justify-between rounded-xl border p-4 transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <span className="text-foreground group-hover:text-primary font-medium transition-colors">
                      {category.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {category._count.resources} resources
                    </span>
                  </div>
                  <ChevronRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
                </div>
              </Link>
            ))
          ) : (
            <div className="text-muted-foreground col-span-full py-10 text-center">
              No categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

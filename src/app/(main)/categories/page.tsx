import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { db } from "@/server/db"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const dynamic = "force-dynamic"

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { resources: true }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  return (
    <div className="w-full bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-6">
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
          <div className="text-sm text-muted-foreground">Categories</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Open Source Resource Categories
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            Browse top categories to find your best Open Source resource options.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.length > 0 ? (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/?category=${encodeURIComponent(category.name)}`}
                className="group block"
              >
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-all duration-200">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {category._count.resources} resources
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No categories found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

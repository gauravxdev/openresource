import { ChevronRight } from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const categoryGroups = [
  {
    title: "AI & Machine Learning",
    items: [
      "AI Development Platforms",
      "Machine Learning Infrastructure",
      "AI Security & Privacy",
      "AI Interaction & Interfaces",
    ],
  },
  {
    title: "Business Software",
    items: [
      "CRM & Sales",
      "ERP & Operations",
      "Finance & Accounting",
      "Human Resources (HR)",
      "Marketing & Customer Engagement",
      "Customer Support & Success",
      "E-commerce Platforms",
    ],
  },
  {
    title: "Data & Analytics",
    items: [
      "Web & Product Analytics",
      "Business Intelligence & Reporting",
      "Data Engineering & Integration",
      "Data Warehousing & Processing",
      "Data Extraction & Web Scraping",
    ],
  },
  {
    title: "Developer Tools",
    items: [
      "Website Builders",
      "IDEs & Code Editors",
      "Frameworks & Libraries",
      "API Development & Testing",
      "Version Control & Hosting",
      "Team Collaboration",
    ],
  },
  {
    title: "Miscellaneous",
    items: [
      "Design & Prototyping",
      "Cryptocurrency & Blockchain",
      "Finance & Fintech",
      "Gaming",
      "Internet of Things (IoT)",
      "Logistics & Supply Chain",
      "Media & Streaming",
    ],
  },
  {
    title: "Productivity & Utilities",
    items: [
      "Note Taking & Knowledge Management",
      "Password & Secret Management",
      "Screen Capture & Recording",
      "File Management & Sync",
      "Task & Project Management",
      "Automation & RPA",
      "Time Tracking",
    ],
  },
]

export default function CategoriesPage() {
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
            Open Source Software Categories
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground md:text-lg">
            Browse top categories to find your best Open Source software options.
          </p>
        </div>

        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {categoryGroups.map((category) => (
            <section key={category.title} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                {category.title}
              </h2>
              <ul className="space-y-3">
                {category.items.map((item) => (
                  <li key={item}>
                    <div className="group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                      <span className="leading-relaxed">{item}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

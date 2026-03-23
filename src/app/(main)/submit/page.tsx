"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Globe, Zap, ArrowRightLeft } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const SubmitForm = dynamic(
  () => import("@/components/submit-form").then((mod) => mod.SubmitForm),
  {
    ssr: false,
    loading: () => (
      <div className="w-full animate-pulse space-y-4">
        <div className="bg-muted h-10 rounded-md" />
        <div className="bg-muted h-10 rounded-md" />
        <div className="bg-muted h-32 rounded-md" />
        <div className="bg-muted h-10 rounded-md" />
      </div>
    ),
  },
);

export default function SubmitPage() {
  const router = useRouter();

  return (
    <div className="text-foreground min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-5 pt-4 pb-20 md:px-6 md:pt-6">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-border" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground">
                  Submit Resource
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-10 space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Submit your Resource
          </h1>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed">
            The ultimate hub for discovering open-source projects, websites, and
            developer tools.
            <br />
            Join the OpenResource community by sharing the innovations that
            empower the future.
          </p>
        </div>

        <div className="space-y-12">
          {/* Form Section */}
          <div className="w-full">
            <SubmitForm mode="public" onSuccess={() => router.push("/")} />
          </div>

          {/* Guidelines Section (Moved below form) */}
          <div className="border-border border-t pt-12">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Submission Guidelines</h2>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We review all submissions to ensure high quality and relevance
                  to the open-source community.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex gap-3">
                  <div className="mt-1">
                    <Globe className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      Public Repository
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Must be hosted on GitHub and not archived.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      Custom Domain
                    </p>
                    <p className="text-muted-foreground text-sm">
                      No temporary subdomains (vercel.app, netlify.app, etc.).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1">
                    <Zap className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      Available Now
                    </p>
                    <p className="text-muted-foreground text-sm">
                      No waitlist or &quot;coming soon&quot; products.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1">
                    <ArrowRightLeft className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold">
                      Clear Alternative
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Must be an alternative to proprietary software.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

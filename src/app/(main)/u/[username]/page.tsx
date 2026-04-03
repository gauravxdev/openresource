/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/server/db";
import { UserResources } from "@/components/UserResources";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Calendar, Package } from "lucide-react";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://openresource.site";

  const user = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      name: true,
      username: true,
      image: true,
      _count: {
        select: { resources: { where: { status: "APPROVED" } } },
      },
    },
  });

  if (!user) {
    return {
      title: "User Not Found - OpenResource",
    };
  }

  const displayName = user.name || `@${user.username}`;
  const contributionCount = user._count.resources;

  return {
    title: `${displayName} - OpenResource`,
    description: `View ${displayName}'s open-source contributions on OpenResource. ${contributionCount} resources shared.`,
    alternates: {
      canonical: `${baseUrl}/u/${username}`,
    },
    openGraph: {
      title: `${displayName} - OpenResource`,
      description: `View ${displayName}'s open-source contributions on OpenResource. ${contributionCount} resources shared.`,
      url: `${baseUrl}/u/${username}`,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} - OpenResource`,
      description: `View ${displayName}'s open-source contributions on OpenResource.`,
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;

  const user = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      resources: {
        where: { status: "APPROVED" },
        include: {
          categories: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user.username?.[0]?.toUpperCase() ?? "U");

  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-[1152px] px-5 pt-8 pb-20 md:px-6 md:pt-12">
        {/* Header Profil */}
        <div className="mb-12 flex flex-col items-center gap-8 md:flex-row md:items-start">
          <Avatar className="border-background h-32 w-32 border-4 shadow-xl">
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? user.username ?? "User"}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-foreground text-3xl font-bold">
                {user.name || `@${user.username}`}
              </h1>
              <p className="text-primary text-lg font-medium">
                @{user.username}
              </p>
            </div>

            <div className="text-muted-foreground flex flex-wrap justify-center gap-6 text-sm md:justify-start">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    year: "numeric",
                  }).format(user.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>{user.resources.length} Contributions</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Submissions Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-foreground text-2xl font-bold">
              Contributions
            </h2>
            <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-sm font-bold">
              {user.resources.length}
            </span>
          </div>

          <UserResources resources={user.resources} />
        </div>
      </div>
    </div>
  );
}

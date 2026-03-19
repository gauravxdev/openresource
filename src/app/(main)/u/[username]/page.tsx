/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { ResourceCard } from "@/components/ResourceCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { timeAgo } from "@/lib/utils";
import { Calendar, Package } from "lucide-react";

interface PublicProfilePageProps {
    params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
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
        ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
        : (user.username?.[0]?.toUpperCase() ?? "U");

    return (
        <div className="w-full bg-background min-h-screen">
            <div className="mx-auto max-w-[1152px] px-5 pb-20 pt-8 md:px-6 md:pt-12">
                {/* Header Profil */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                        <AvatarImage src={user.image ?? undefined} alt={user.name ?? user.username ?? "User"} />
                        <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                {user.name || `@${user.username}`}
                            </h1>
                            <p className="text-lg text-primary font-medium">@{user.username}</p>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Joined {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(user.createdAt)}</span>
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
                        <h2 className="text-2xl font-bold text-foreground">Contributions</h2>
                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-sm font-bold">
                            {user.resources.length}
                        </span>
                    </div>

                    {user.resources.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {user.resources.map((resource) => (
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
                                        image: resource.image ?? "/api/placeholder/400/250"
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="border border-neutral-200 bg-neutral-100 p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/60">
                            <CardContent className="flex flex-col items-center gap-4 py-8">
                                <Package className="h-12 w-12 text-muted-foreground opacity-20" />
                                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                    This user hasn&apos;t added any resources yet.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

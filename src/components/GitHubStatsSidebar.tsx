"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, GitFork, Clock, Calendar, Scale, ExternalLink } from "lucide-react";

export interface GitHubStats {
    stars: number;
    forks: number;
    lastCommit: string | null;
    repositoryCreatedAt: string | null;
    license: string | null;
    repositoryUrl?: string;
}

interface GitHubStatsSidebarProps {
    stats: GitHubStats;
    className?: string;
}

/**
 * Formats a number for display (e.g., 57203 -> "57,203")
 */
function formatNumber(num: number): string {
    return num.toLocaleString();
}

/**
 * Calculates the repository age from creation date.
 */
function calculateRepoAge(createdAt: string | null): string {
    if (!createdAt) return "Unknown";

    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months !== 1 ? "s" : ""}`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years !== 1 ? "s" : ""}`;
    }
}

/**
 * Formats the last commit time as a relative string (e.g., "8 hours ago").
 */
function formatLastCommit(lastCommit: string | null): string {
    if (!lastCommit) return "Unknown";

    const commitDate = new Date(lastCommit);
    const now = new Date();
    const diffMs = now.getTime() - commitDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) {
        return "just now";
    } else if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 30) {
        return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months !== 1 ? "s" : ""} ago`;
    }
}

export function GitHubStatsSidebar({ stats, className }: GitHubStatsSidebarProps) {
    const statItems = [
        {
            label: "Stars",
            value: formatNumber(stats.stars),
            Icon: Star,
            iconClassName: "text-amber-400",
        },
        {
            label: "Forks",
            value: formatNumber(stats.forks),
            Icon: GitFork,
            iconClassName: "text-blue-400",
        },
        {
            label: "Last commit",
            value: formatLastCommit(stats.lastCommit),
            Icon: Clock,
            iconClassName: "text-green-400",
        },
        {
            label: "Repository age",
            value: calculateRepoAge(stats.repositoryCreatedAt),
            Icon: Calendar,
            iconClassName: "text-purple-400",
        },
        {
            label: "License",
            value: stats.license ?? "Not specified",
            Icon: Scale,
            iconClassName: "text-orange-400",
        },
    ];

    return (
        <Card className={`border-neutral-800 bg-neutral-900/80 backdrop-blur-sm ${className ?? ""}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-neutral-200">
                    Repository Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {statItems.map(({ label, value, Icon, iconClassName }) => (
                    <div
                        key={label}
                        className="flex items-center justify-between text-sm"
                    >
                        <div className="flex items-center gap-2.5 text-neutral-400">
                            <Icon className={`h-4 w-4 ${iconClassName}`} />
                            <span>{label}</span>
                        </div>
                        <span className="font-medium text-neutral-100">{value}</span>
                    </div>
                ))}

                {stats.repositoryUrl && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4 gap-2 border-neutral-700 bg-transparent hover:bg-neutral-800 text-neutral-300"
                        asChild
                    >
                        <a href={stats.repositoryUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            View Repository
                        </a>
                    </Button>
                )}

                <p className="text-xs text-neutral-500 text-center pt-2">
                    Auto-fetched from GitHub
                </p>
            </CardContent>
        </Card>
    );
}

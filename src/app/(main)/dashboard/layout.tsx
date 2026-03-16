"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FolderOpen,
    BarChart3,
    Plus,
    ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/resources", label: "My Resources", icon: FolderOpen, exact: false },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, exact: false },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const isActive = (href: string, exact: boolean) => {
        if (exact) return pathname === href;
        return pathname.startsWith(href);
    };

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-background">
            <div className="mx-auto max-w-[1152px] px-5 md:px-6">
                <div className="flex gap-8 py-8">
                    {/* Sidebar */}
                    <aside className="hidden md:flex w-[220px] shrink-0 flex-col gap-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Profile
                            </Link>
                        </div>

                        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 px-3">
                            Dashboard
                        </h2>

                        <nav className="flex flex-col gap-1">
                            {sidebarLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                        isActive(link.href, link.exact)
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-4 pt-4 border-t border-border/40">
                            <Button asChild size="sm" className="w-full gap-2">
                                <Link href="/submit">
                                    <Plus className="h-4 w-4" />
                                    Submit Resource
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-auto pt-8">
                            <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Manage your submitted resources, track their
                                    approval status, and view performance analytics.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Nav */}
                    <div className="md:hidden w-full mb-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Profile
                            </Link>
                            <Button asChild size="sm" variant="outline" className="gap-1.5">
                                <Link href="/submit">
                                    <Plus className="h-3.5 w-3.5" />
                                    Submit
                                </Link>
                            </Button>
                        </div>
                        <nav className="flex gap-1 overflow-x-auto pb-1">
                            {sidebarLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all",
                                        isActive(link.href, link.exact)
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">{children}</main>
                </div>
            </div>
        </div>
    );
}

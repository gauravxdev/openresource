/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  Github,
  Globe,
  ExternalLink,
  Star,
  GitFork,
  User,
  CalendarDays,
} from "lucide-react";
import Image from "next/image";

interface ResourceWithRelations {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  status: string;
  rejectionReason?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
  oneLiner?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  repositoryUrl?: string | null;
  websiteUrl?: string | null;
  categories?: any[];
  tags?: string[];
  builtWith?: any;
  alternative?: string | null;
  license?: string | null;
  stars?: number | null;
  forks?: number | null;
  addedBy?: string | null;
}

interface ViewResourceDialogProps {
  resource: ResourceWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewResourceDialog({
  resource,
  open,
  onOpenChange,
}: ViewResourceDialogProps) {
  if (!resource) return null;

  const getDisplayUrl = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname + (parsed.pathname === "/" ? "" : parsed.pathname);
    } catch {
      return urlStr;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[700px] md:max-w-3xl lg:max-w-4xl [&>button:last-child]:hidden sm:[&>button:last-child]:top-6 sm:[&>button:last-child]:right-6 sm:[&>button:last-child]:flex">
        {/* Header Section */}
        <div className="bg-muted/20 border-border/40 border-b p-6 pb-5">
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="flex min-w-0 flex-1 items-center gap-4">
                {resource.logo && (
                  <div className="bg-background flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-sm">
                    <Image
                      src={resource.logo}
                      alt={resource.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <span className="text-foreground truncate font-bold tracking-tight">
                    {resource.name}
                  </span>
                  <Badge
                    variant={
                      resource.status === "APPROVED"
                        ? "default"
                        : resource.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                    }
                    className="shrink-0 px-2.5 py-0.5"
                  >
                    {resource.status}
                  </Badge>
                </div>
              </DialogTitle>

              {/* Mobile close button space preserved via Dialog component default */}
            </div>
            <DialogDescription className="text-sm">
              <span className="bg-background/50 text-foreground/80 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5">
                <User className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                <span>Submitted by</span>
                <span className="text-foreground font-medium">
                  {resource.user?.name ?? "Admin / Unknown"}
                </span>
                {resource.user?.email && (
                  <span className="text-muted-foreground/75 hidden sm:inline">
                    ({resource.user.email})
                  </span>
                )}
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Content - renders first, full width */}
          <div className="space-y-8 p-6 sm:p-8">
            {/* Rejection alert */}
            {resource.status === "REJECTED" && resource.rejectionReason && (
              <div className="border-destructive/30 bg-destructive/10 rounded-xl border p-4 shadow-sm">
                <h4 className="text-destructive mb-2 flex items-center gap-2 font-semibold">
                  <span className="bg-destructive h-2 w-2 rounded-full shadow-[0_0_8px_hsl(var(--destructive))]" />
                  Reason for Rejection
                </h4>
                <p className="text-destructive/90 text-sm leading-relaxed">
                  {resource.rejectionReason}
                </p>
              </div>
            )}

            {/* Elevator Pitch */}
            {(resource.oneLiner ?? resource.shortDescription) && (
              <div className="space-y-6">
                {resource.oneLiner && (
                  <div className="space-y-2">
                    <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      One Liner
                    </h4>
                    <p className="text-foreground text-xl leading-snug font-medium">
                      {resource.oneLiner}
                    </p>
                  </div>
                )}
                {resource.shortDescription && (
                  <div className="space-y-2">
                    <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      Short Description
                    </h4>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {resource.shortDescription}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Description containing MDX rendering */}
            {resource.description && (
              <div className="space-y-4">
                <h4 className="text-muted-foreground border-border/40 border-b pb-3 text-xs font-bold tracking-widest uppercase">
                  Full Description
                </h4>
                <div className="prose prose-sm md:prose-base dark:prose-invert prose-a:text-primary hover:prose-a:text-primary/80 prose-headings:font-semibold max-w-none">
                  <MarkdownRenderer content={resource.description} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - renders below main content, full width */}
          <div className="border-border/40 bg-muted/30 border-t p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Links */}
              <div className="space-y-3">
                <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  Links
                </h4>
                <div className="flex flex-col gap-2">
                  {resource.repositoryUrl && (
                    <a
                      href={resource.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/80 hover:text-primary group bg-background hover:bg-muted/50 border-border/40 hover:border-border flex items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors"
                    >
                      <Github className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors" />
                      <span className="truncate">
                        {getDisplayUrl(resource.repositoryUrl ?? "")}
                      </span>
                    </a>
                  )}
                  {resource.websiteUrl && (
                    <a
                      href={resource.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/80 hover:text-primary group bg-background hover:bg-muted/50 border-border/40 hover:border-border flex items-center gap-2.5 rounded-lg border p-2.5 text-sm transition-colors"
                    >
                      <Globe className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors" />
                      <span className="truncate">
                        {getDisplayUrl(resource.websiteUrl ?? "")}
                      </span>
                    </a>
                  )}
                </div>
              </div>

              {/* Categories */}
              {(resource.categories?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {resource.categories?.map((cat: any) => (
                      <Badge
                        key={cat.slug}
                        variant={
                          cat.status === "APPROVED" || !cat.status
                            ? "secondary"
                            : cat.status === "PENDING"
                              ? "outline"
                              : "destructive"
                        }
                        className={`font-medium ${
                          cat.status === "APPROVED" || !cat.status
                            ? "bg-secondary/60 hover:bg-secondary"
                            : cat.status === "PENDING"
                              ? "border-yellow-500/50 text-yellow-600"
                              : ""
                        }`}
                      >
                        {cat.name}
                        {cat.status && cat.status !== "APPROVED" && (
                          <span className="ml-1 text-xs opacity-70">
                            ({cat.status})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {(resource.tags?.length ?? 0) > 0 && (
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {resource.tags?.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-background text-muted-foreground border-border/60 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Stack / Built With */}
              {resource.builtWith &&
                Array.isArray(resource.builtWith) &&
                (resource.builtWith?.length ?? 0) > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      Built With
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {resource.builtWith?.map((tech: any) => (
                        <Badge
                          key={tech.name ?? tech}
                          variant="outline"
                          className="bg-primary/5 text-primary/80 border-primary/20 text-xs"
                        >
                          {tech.name ?? tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Alternative To */}
              {resource.alternative && (
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    Alternative To
                  </h4>
                  <p className="text-foreground/90 text-sm font-medium">
                    {resource.alternative}
                  </p>
                </div>
              )}

              {/* License */}
              {resource.license && (
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                    License
                  </h4>
                  <Badge
                    variant="outline"
                    className="bg-background text-xs font-medium"
                  >
                    {resource.license}
                  </Badge>
                </div>
              )}

              {/* Stats */}
              <div className="space-y-3">
                <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  Stats
                </h4>
                <div className="flex flex-col gap-2">
                  <div className="bg-background border-border/40 flex items-center gap-2 rounded-lg border px-3 py-2">
                    <Star className="text-muted-foreground h-3.5 w-3.5" />
                    <span className="text-sm font-semibold">
                      {resource.stars?.toLocaleString() ?? 0}
                    </span>
                    <span className="text-muted-foreground text-xs">stars</span>
                  </div>
                  <div className="bg-background border-border/40 flex items-center gap-2 rounded-lg border px-3 py-2">
                    <GitFork className="text-muted-foreground h-3.5 w-3.5" />
                    <span className="text-sm font-semibold">
                      {resource.forks?.toLocaleString() ?? 0}
                    </span>
                    <span className="text-muted-foreground text-xs">forks</span>
                  </div>
                </div>
              </div>

              {/* Added By */}
              <div className="mt-2 space-y-3 sm:mt-0">
                <h4 className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                  Added By
                </h4>
                <div className="bg-background border-border/40 flex items-center gap-2 rounded-lg border px-3 py-2">
                  <CalendarDays className="text-muted-foreground h-3.5 w-3.5" />
                  <span className="truncate text-sm font-medium">
                    {resource.addedBy ?? "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-muted/20 border-border/40 shrink-0 border-t p-4 sm:p-5">
          <DialogFooter className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="order-2 flex flex-col items-stretch gap-2 sm:order-1 sm:flex-row sm:items-center sm:gap-3">
              {resource.repositoryUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={resource.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Repository
                  </a>
                </Button>
              )}
              {resource.websiteUrl && (
                <Button variant="default" size="sm" asChild>
                  <a
                    href={resource.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Site
                  </a>
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="order-1 sm:order-2 sm:ml-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

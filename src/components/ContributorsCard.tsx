import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ExternalLink } from "lucide-react";
import Image from "next/image";

export interface ContributorData {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface ContributorsCardProps {
  contributors: ContributorData[];
  repositoryUrl?: string;
}

export function ContributorsCard({
  contributors,
  repositoryUrl,
}: ContributorsCardProps) {
  if (contributors.length === 0) {
    return null;
  }

  const contributorsPageUrl = repositoryUrl
    ? `${repositoryUrl}/graphs/contributors`
    : null;

  return (
    <Card className="border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-neutral-900 dark:text-neutral-200">
          <Users className="h-4 w-4 text-blue-400" />
          Contributors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {contributors.map((contributor) => (
          <a
            key={contributor.login}
            href={contributor.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Image
              src={contributor.avatar_url}
              alt={contributor.login}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {contributor.login}
              </p>
            </div>
            <span className="text-muted-foreground text-xs">
              {contributor.contributions}
            </span>
          </a>
        ))}

        {contributorsPageUrl && (
          <a
            href={contributorsPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-black p-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View all contributors
          </a>
        )}
      </CardContent>
    </Card>
  );
}

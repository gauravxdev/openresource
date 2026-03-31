"use client";

import Link from "next/link";
import Image from "next/image";

interface ContributedByProps {
  user: {
    name: string | null;
    username: string | null;
    image: string | null;
  };
}

export function ContributedBy({ user }: ContributedByProps) {
  return (
    <div className="flex items-center justify-between border-t border-neutral-200 pt-6 dark:border-neutral-800">
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground font-medium">
          Contributed by
        </span>
        <Link
          href={user.username ? `/u/${user.username}` : "#"}
          className="group/user hover:bg-muted/50 hover:border-border flex items-center gap-2 rounded-full border border-transparent p-1.5 pr-3 transition-colors"
        >
          {user.image ? (
            <Image
              src={user.image}
              className="border-border h-8 w-8 rounded-full border shadow-sm transition-transform group-hover/user:scale-105"
              alt={user.name ?? "User"}
              width={32}
              height={32}
            />
          ) : (
            <div className="bg-primary/10 text-primary border-primary/20 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold">
              {user.name?.[0] ?? user.username?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <div className="flex flex-col -space-y-0.5">
            {user.name && (
              <span className="text-foreground group-hover/user:text-primary text-sm font-semibold transition-colors">
                {user.name}
              </span>
            )}
            <span
              className={
                user.name
                  ? "text-muted-foreground text-xs"
                  : "text-foreground group-hover/user:text-primary text-sm font-semibold transition-colors"
              }
            >
              {user.username ? `@${user.username}` : "Anonymous"}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}

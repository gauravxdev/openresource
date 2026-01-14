"use client";

import { api } from "@/trpc/react";

export function LatestPost() {
  const { data } = api.post.hello.useQuery({ text: "World" });

  return (
    <div className="w-full max-w-xs">
      <p className="truncate">{data?.greeting ?? "Loading..."}</p>
    </div>
  );
}

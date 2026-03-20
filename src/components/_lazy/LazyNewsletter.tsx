"use client";

import dynamic from "next/dynamic";

const NewsletterSubscribe = dynamic(
  () => import("@/components/NewsletterSubscribe"),
  { ssr: false },
);

export function LazyNewsletter() {
  return <NewsletterSubscribe />;
}

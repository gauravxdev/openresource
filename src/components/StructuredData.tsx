"use client";

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://openresource.site";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OpenResource",
    url: baseUrl,
    description:
      "Browse a curated collection of open-source projects, self-hosted tools, and applications. Find GitHub repos, Windows apps, Android apps, and developer resources.",
    publisher: {
      "@type": "Organization",
      name: "OpenResource",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/og-image.svg`,
      },
      sameAs: [
        "https://github.com/gauravxdev",
        "https://x.com/bitsbygaurav",
        "https://www.instagram.com/openresourceai",
      ],
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={websiteJsonLd} />;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://openresource.site";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };

  return <JsonLd data={breadcrumbJsonLd} />;
}

interface SoftwareAppJsonLdProps {
  name: string;
  description: string;
  url: string;
  category?: string;
  operatingSystem?: string;
  license?: string;
}

export function SoftwareAppJsonLd({
  name,
  description,
  url,
  category,
  operatingSystem,
  license,
}: SoftwareAppJsonLdProps) {
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description: description.slice(0, 500),
    url,
    applicationCategory: category ?? "DeveloperApplication",
    operatingSystem: operatingSystem ?? "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    ...(license && {
      license: {
        "@type": "CreativeWork",
        name: license,
      },
    }),
  };

  return <JsonLd data={softwareJsonLd} />;
}

"use client";

import Link from "next/link";
import { Github, Twitter, Instagram } from "lucide-react";

const browseLinks = [
  { href: "/browse/alternatives", label: "Alternatives" },
  { href: "/categories", label: "Categories" },
  { href: "/browse/self-hosted", label: "Self-hosted" },
  { href: "/tags", label: "Tags" },
  { href: "/browse/licenses", label: "Licenses" },
];

const quickLinks = [
  { href: "/submit", label: "Submit Resource" },
  { href: "/github-repos", label: "GitHub Repos" },
  { href: "/android-apps", label: "Android Apps" },
  { href: "/windows-apps", label: "Windows Apps" },
];

const socialLinks = [
  {
    href: "https://github.com/gauravxdev",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://x.com/bitsbygaurav",
    label: "Twitter",
    icon: Twitter,
  },
  {
    href: "https://www.instagram.com/openresourceai",
    label: "Instagram",
    icon: Instagram,
  },
];

export function Footer() {
  return (
    <footer className="border-foreground/10 mt-auto border-t pt-12">
      <div className="mx-auto max-w-[1152px] px-5 md:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Branding and Social Links */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="group/logo inline-flex items-center gap-2"
            >
              <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text font-[family-name:var(--font-righteous)] text-lg font-bold text-transparent">
                OpenResource
              </span>
            </Link>

            <p className="text-muted-foreground mt-3 text-sm">
              Discover and explore open source alternatives to popular software.
              Find free and self-hosted solutions for your needs.
            </p>

            {/* Social Links */}
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Browse Links */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">Browse:</h3>
            <ul className="space-y-2">
              {browseLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">Quick Links:</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Other Products */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-white">
              Other Products:
            </h3>
            <p className="text-muted-foreground text-sm">Coming soon</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-foreground/10 mt-12 flex flex-row flex-wrap items-end justify-between border-t py-6">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} OpenResource. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            Built with ❤️ by{" "}
            <a
              href="https://gauravxdev.site"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline transition-colors"
            >
              Gaurav Sharma
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

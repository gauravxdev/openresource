"use client";

import Link from "next/link";
import { Github, Twitter, Instagram } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

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
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Column 1: Branding and Social Links */}
          <div className="col-span-2 flex flex-col items-center text-center lg:col-span-1 lg:items-start lg:text-left">
            <Link
              href="/"
              className="group/logo inline-flex items-center gap-2"
            >
              <BrandLogo className="text-primary h-6 w-6" />
              <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text font-[family-name:var(--font-righteous)] text-lg font-bold text-transparent">
                OpenResource
              </span>
            </Link>

            <p className="text-muted-foreground mt-3 text-sm">
              A curated directory of open-source projects, tools, and
              applications for developers.
            </p>

            {/* Social Links */}
            <div className="mt-4 flex items-center justify-center gap-3 lg:justify-start">
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
          <div className="col-span-1 flex flex-col items-center text-center lg:items-start lg:text-left">
            <h3 className="text-foreground mb-3 text-sm font-bold">Browse:</h3>
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
          <div className="col-span-1 flex flex-col items-center text-center lg:items-start lg:text-left">
            <h3 className="text-foreground mb-3 text-sm font-bold">
              Quick Links:
            </h3>
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
          <div className="col-span-2 flex flex-col items-center text-center lg:col-span-1 lg:items-start lg:text-left">
            <h3 className="text-foreground mb-3 text-sm font-bold">
              Other Products:
            </h3>
            <p className="text-muted-foreground text-sm">Coming soon</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-foreground/10 mt-12 flex flex-col items-center gap-4 border-t py-6 text-center md:flex-row md:justify-between md:text-left">
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

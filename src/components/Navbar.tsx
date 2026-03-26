"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Menu,
  X,
  Plus,
  ChevronDown,
  LogIn,
  Clock,
  Server,
  Rocket,
  ArrowLeftRight,
  FolderOpen,
  Layers,
  Scale,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Lazy-load heavy sub-components (search dialog imports Dialog + Input + searchResources action,
// user menu imports auth-client + Avatar + DropdownMenu)
const NavbarSearchDialog = dynamic(
  () =>
    import("@/components/NavbarSearchDialog").then(
      (mod) => mod.NavbarSearchDialog,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted/30 h-9 w-9 animate-pulse rounded-md" />
    ),
  },
);

const NavbarUserMenu = dynamic(
  () => import("@/components/NavbarUserMenu").then((mod) => mod.NavbarUserMenu),
  {
    ssr: false,
    loading: () => (
      <div className="bg-muted h-9 w-16 animate-pulse rounded-md" />
    ),
  },
);

const NavbarBrowseMenu = dynamic(
  () =>
    import("@/components/NavbarBrowseMenu").then((mod) => mod.NavbarBrowseMenu),
  {
    ssr: false,
  },
);

const browseOptions = [
  { href: "/browse/latest", label: "Latest", icon: Clock },
  { href: "/browse/self-hosted", label: "Self-hosted", icon: Server },
  { href: "/browse/most-forked", label: "Most Forked", icon: Rocket },
  { href: "/browse/alternatives", label: "Alternatives", icon: ArrowLeftRight },
  { href: "/categories", label: "Categories", icon: FolderOpen },
  { href: "/android-apps", label: "Android Apps", icon: Layers },
  { href: "/windows-apps", label: "Windows Apps", icon: Monitor },
  { href: "/browse/licenses", label: "Licenses", icon: Scale },
];

const navLinks = [
  { href: "/browse/alternatives", label: "Alternatives" },
  { href: "/github-repos", label: "GitHub Repos" },
  { href: "/categories", label: "Categories" },
  { href: "/android-apps", label: "Android Apps" },
  { href: "/windows-apps", label: "Windows Apps" },
];

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [browseOpen, setBrowseOpen] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Hover handlers for Browse dropdown
  const handleBrowseMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setBrowseOpen(true);
  };

  const handleBrowseMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setBrowseOpen(false);
    }, 150);
  };

  return (
    <nav className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto max-w-[1152px] px-5 md:px-6">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center space-x-2">
            <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text font-[family-name:var(--font-righteous)] text-lg font-bold text-transparent">
              OpenResource
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {/* Browse Dropdown - Opens on Hover */}
            <div
              onMouseEnter={handleBrowseMouseEnter}
              onMouseLeave={handleBrowseMouseLeave}
            >
              <DropdownMenu open={browseOpen} onOpenChange={setBrowseOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground gap-1"
                  >
                    Browse
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <NavbarBrowseMenu
                  onMouseEnter={handleBrowseMouseEnter}
                  onMouseLeave={handleBrowseMouseLeave}
                />
              </DropdownMenu>
            </div>

            {/* Nav Links */}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side: Search, Theme, Submit, Auth */}
          <div className="flex items-center space-x-1">
            {/* Search Button - Lazy loaded */}
            <NavbarSearchDialog />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Submit Button */}
            <Button
              size="sm"
              variant="outline"
              asChild
              className="hidden gap-1.5 sm:flex"
            >
              <Link href="/submit">
                <Plus className="h-4 w-4" />
                Submit
              </Link>
            </Button>

            {/* Auth Buttons - Lazy loaded */}
            <NavbarUserMenu />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-border/40 border-t py-4 lg:hidden">
            <div className="flex flex-col space-y-1">
              {/* Browse Section */}
              <p className="text-muted-foreground px-2 py-1 text-xs font-semibold tracking-wider uppercase">
                Browse
              </p>
              {browseOptions.map((option) => (
                <Link
                  key={option.href}
                  href={option.href}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-3 px-2 py-2 text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </Link>
              ))}

              <div className="border-border/40 my-2 border-t" />

              {/* Quick Links */}
              <p className="text-muted-foreground px-2 py-1 text-xs font-semibold tracking-wider uppercase">
                Quick Links
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground px-2 py-2 text-sm font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-border/40 my-2 border-t" />

              {/* Submit */}
              <Link
                href="/submit"
                className="text-primary hover:text-primary/80 flex items-center gap-2 px-2 py-2 text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Plus className="h-4 w-4" />
                Submit Resource
              </Link>

              <Link
                href="/sign-in"
                className="text-muted-foreground hover:text-foreground flex items-center gap-2 px-2 py-2 text-sm font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

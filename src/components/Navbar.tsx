"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import {
    Moon, Sun, Menu, X, Plus, ChevronDown, LogIn,
    Clock, Server, Rocket, ArrowLeftRight, FolderOpen, Layers, Scale, Monitor
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Lazy-load heavy sub-components (search dialog imports Dialog + Input + searchResources action,
// user menu imports auth-client + Avatar + DropdownMenu)
const NavbarSearchDialog = dynamic(
    () => import("@/components/NavbarSearchDialog").then((mod) => mod.NavbarSearchDialog),
    {
        ssr: false,
        loading: () => (
            <div className="h-9 w-9 rounded-md bg-muted/30 animate-pulse" />
        ),
    }
)

const NavbarUserMenu = dynamic(
    () => import("@/components/NavbarUserMenu").then((mod) => mod.NavbarUserMenu),
    {
        ssr: false,
        loading: () => (
            <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
        ),
    }
)

const browseOptions = [
    { href: "/browse/latest", label: "Latest", description: "Fresh arrivals added recently.", icon: Clock },
    { href: "/browse/self-hosted", label: "Self-hosted", description: "Deploy on your own infra.", icon: Server },
    { href: "/browse/coming-soon", label: "Coming Soon", description: "Projects launching soon.", icon: Rocket },
    { href: "/browse/alternatives", label: "Alternatives", description: "Explore replacements for tools.", icon: ArrowLeftRight },
    { href: "/categories", label: "Categories", description: "Browse curated categories.", icon: FolderOpen },
    { href: "/android-apps", label: "Android Apps", description: "Discover apps for android.", icon: Layers },
    { href: "/windows-apps", label: "Windows Apps", description: "Discover apps for windows.", icon: Monitor },
    { href: "/browse/licenses", label: "Licenses", description: "Filter by software licenses.", icon: Scale },
]

const navLinks = [
    { href: "/browse/alternatives", label: "Alternatives" },
    { href: "/github-repos", label: "GitHub Repos" },
    { href: "/categories", label: "Categories" },
    { href: "/android-apps", label: "Android Apps" },
    { href: "/windows-apps", label: "Windows Apps" }
]

export default function Navbar() {
    const { theme, setTheme } = useTheme()
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
    const [browseOpen, setBrowseOpen] = React.useState(false)
    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    // Hover handlers for Browse dropdown
    const handleBrowseMouseEnter = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }
        setBrowseOpen(true)
    }

    const handleBrowseMouseLeave = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setBrowseOpen(false)
        }, 150)
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-[1152px] px-5 md:px-6">
                <div className="flex h-14 items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 shrink-0">
                        <span className="text-lg font-bold font-[family-name:var(--font-righteous)] bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
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
                                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                                        Browse
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-64"
                                    onMouseEnter={handleBrowseMouseEnter}
                                    onMouseLeave={handleBrowseMouseLeave}
                                >
                                    {browseOptions.map((option) => (
                                        <DropdownMenuItem key={option.href} asChild>
                                            <Link href={option.href} className="flex items-start gap-3 p-2">
                                                <option.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium">{option.label}</p>
                                                    <p className="text-xs text-muted-foreground">{option.description}</p>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Nav Links */}
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>

                        {/* Submit Button */}
                        <Button size="sm" variant="outline" asChild className="hidden sm:flex gap-1.5">
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
                            className="lg:hidden h-9 w-9"
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
                    <div className="lg:hidden border-t border-border/40 py-4">
                        <div className="flex flex-col space-y-1">
                            {/* Browse Section */}
                            <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Browse
                            </p>
                            {browseOptions.map((option) => (
                                <Link
                                    key={option.href}
                                    href={option.href}
                                    className="flex items-center gap-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-2 py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <option.icon className="h-4 w-4" />
                                    {option.label}
                                </Link>
                            ))}

                            <div className="border-t border-border/40 my-2" />

                            {/* Quick Links */}
                            <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Quick Links
                            </p>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-2 py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="border-t border-border/40 my-2" />

                            {/* Submit */}
                            <Link
                                href="/submit"
                                className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 px-2 py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Plus className="h-4 w-4" />
                                Submit Resource
                            </Link>

                            <Link
                                href="/sign-in"
                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-2 py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <LogIn className="h-4 w-4" />
                                Sign In
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav >
    )
}

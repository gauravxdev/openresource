"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
    Moon, Sun, Menu, X, LogIn, LogOut, User, Search, Plus, ChevronDown,
    Clock, Server, Rocket, ArrowLeftRight, FolderOpen, Layers, Scale
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { authClient } from "@/lib/auth-client"
import { searchResources, type ResourceWithCategories } from "@/actions/resources"

const browseOptions = [
    { href: "/browse/latest", label: "Latest", description: "Fresh arrivals added recently.", icon: Clock },
    { href: "/browse/self-hosted", label: "Self-hosted", description: "Deploy on your own infra.", icon: Server },
    { href: "/browse/coming-soon", label: "Coming Soon", description: "Projects launching soon.", icon: Rocket },
    { href: "/browse/alternatives", label: "Alternatives", description: "Explore replacements for tools.", icon: ArrowLeftRight },
    { href: "/categories", label: "Categories", description: "Browse curated categories.", icon: FolderOpen },
    { href: "/android-apps", label: "Android Apps", description: "Discover apps for android.", icon: Layers },
    { href: "/browse/licenses", label: "Licenses", description: "Filter by software licenses.", icon: Scale },
]

const navLinks = [
    { href: "/browse/alternatives", label: "Alternatives" },
    { href: "/github-repos", label: "GitHub Repos" },
    { href: "/categories", label: "Categories" },
    { href: "/android-apps", label: "Android Apps" }
]

// Removed mockSearchData


export default function Navbar() {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
    const [searchOpen, setSearchOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<ResourceWithCategories[]>([])
    const [isSearching, setIsSearching] = React.useState(false)
    const [browseOpen, setBrowseOpen] = React.useState(false)
    const { data: session, isPending, refetch: refetchSession } = authClient.useSession()

    // Local state for avatar image to enable instant updates
    const [avatarImage, setAvatarImage] = React.useState<string | null | undefined>(session?.user?.image)

    // Sync avatarImage with session when session changes (e.g., on initial load)
    React.useEffect(() => {
        if (session?.user?.image !== undefined) {
            setAvatarImage(session.user.image)
        }
    }, [session?.user?.image])

    // Listen for session refresh events with optional image URL payload
    React.useEffect(() => {
        const handleSessionRefresh = (event: Event) => {
            const customEvent = event as CustomEvent<{ imageUrl?: string | null }>
            if (customEvent.detail?.imageUrl !== undefined) {
                // Direct update with new image URL
                setAvatarImage(customEvent.detail.imageUrl)
            }
            // Also refetch session for other data
            void refetchSession()
        }
        window.addEventListener('session-refresh', handleSessionRefresh)
        return () => window.removeEventListener('session-refresh', handleSessionRefresh)
    }, [refetchSession])

    const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    // Fetch real search results with debounce
    React.useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                const result = await searchResources(searchQuery)
                if (result.success && result.data) {
                    setSearchResults(result.data)
                } else {
                    setSearchResults([])
                }
            } catch (error) {
                console.error("Search failed:", error)
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }

        const timer = setTimeout(() => {
            void fetchResults()
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleSearchSelect = (href: string) => {
        setSearchOpen(false)
        setSearchQuery("")
        router.push(href)
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
        }, 150) // Small delay to allow moving to dropdown content
    }

    const handleSignOut = async () => {
        await authClient.signOut()
        router.refresh()
        router.push("/")
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
                        {/* Search Button with Filtered Results */}
                        <Dialog open={searchOpen} onOpenChange={(open) => {
                            setSearchOpen(open)
                            if (!open) setSearchQuery("")
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Search className="h-4 w-4" />
                                    <span className="sr-only">Search</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Search Resources</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search open-source resources..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Filtered Results */}
                                    {searchQuery.trim() && (
                                        <div className="max-h-64 overflow-y-auto rounded-md border border-border">
                                            {isSearching ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">
                                                    Searching...
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <div className="divide-y divide-border">
                                                    {searchResults.map((result) => (
                                                        <button
                                                            key={result.id}
                                                            onClick={() => handleSearchSelect(`/resource/${result.slug}`)}
                                                            className="w-full flex flex-col items-start gap-1 p-3 text-left hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="flex items-center justify-between w-full">
                                                                <span className="font-medium">{result.name}</span>
                                                                {result.categories[0] && (
                                                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                                                        {result.categories[0].name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {result.oneLiner && (
                                                                <span className="text-xs text-muted-foreground line-clamp-1">{result.oneLiner}</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No results found for &ldquo;{searchQuery}&rdquo;
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!searchQuery.trim() && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            Start typing to search resources...
                                        </p>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

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

                        {/* Auth Buttons */}
                        {isPending ? (
                            <div className="h-9 w-16 animate-pulse rounded-md bg-muted" />
                        ) : session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage
                                                src={avatarImage ?? undefined}
                                                alt={session.user?.name || "User"}
                                                className="object-cover"
                                            />
                                            <AvatarFallback>
                                                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button size="sm" asChild className="hidden sm:flex">
                                <Link href="/sign-in">Sign In</Link>
                            </Button>
                        )}

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

                            {/* Submit & Auth */}
                            <Link
                                href="/submit"
                                className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 px-2 py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Plus className="h-4 w-4" />
                                Submit Resource
                            </Link>

                            {!session && (
                                <Link
                                    href="/sign-in"
                                    className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground px-2 py-2"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav >
    )
}

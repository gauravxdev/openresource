"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  Search,
  Plus,
  Sun,
  Moon,
  Clock3,
  Server,
  Layers,
  Tag,
  FileText,
  Ticket,
  Sparkles,
  ChevronDown,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const browseItems = [
  { label: "Latest", description: "Fresh arrivals added recently.", icon: Clock3 },
  { label: "Self-hosted", description: "Deploy on your own infra.", icon: Server },
  { label: "Coming Soon", description: "Projects launching soon.", icon: Sparkles },
  { label: "Alternatives", description: "Explore replacements for tools.", icon: Layers },
  { label: "Categories", description: "Browse curated categories.", icon: Tag },
  { label: "Tech Stacks", description: "Discover stacks from top teams.", icon: FileText },
  { label: "Licenses", description: "Filter by software licenses.", icon: Ticket },
]

const themeOptions = [
  { label: "Light", value: "light" as const },
  { label: "Dark", value: "dark" as const },
  { label: "System", value: "system" as const },
]

const Navbar = () => {
  const { setTheme, theme } = useTheme()
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isBrowseOpen, setIsBrowseOpen] = React.useState(false)
  const [isBrowseHovered, setIsBrowseHovered] = React.useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = React.useState(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const searchContainerRef = React.useRef<HTMLDivElement>(null)
  const themeMenuRef = React.useRef<HTMLDivElement>(null)
  const browseMenuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (!searchContainerRef.current?.contains(target)) {
        setIsSearchOpen(false)
      }
      if (!themeMenuRef.current?.contains(target)) {
        setIsThemeMenuOpen(false)
      }
      if (!browseMenuRef.current?.contains(target)) {
        setIsBrowseOpen(false)
        setIsBrowseHovered(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false)
        setIsThemeMenuOpen(false)
        setIsBrowseOpen(false)
        setIsBrowseHovered(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const toggleSearch = () => {
    setIsSearchOpen((open) => {
      if (open) {
        searchInputRef.current?.blur()
      }
      return !open
    })
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="flex w-full items-center justify-center px-4 py-1.5">
        <div className="relative flex w-full max-w-[1152px] items-center justify-between gap-1 rounded-[22px] border border-border/50 bg-background/95 px-4 py-1.5 shadow-sm transition-colors backdrop-blur supports-[backdrop-filter]:backdrop-blur-sm dark:border-neutral-800/70 dark:bg-neutral-950/90" style={{ minWidth: 'fit-content' }}>
          {/* Dotted background pattern - only within navbar */}
          <div
            className="absolute inset-0 rounded-[22px] opacity-20 dark:opacity-10 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 25% 25%, ${theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.4)'} 0.3px, transparent 1px),
                radial-gradient(circle at 75% 75%, ${theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'} 0.3px, transparent 1px)
              `,
              backgroundSize: '8px 8px',
              imageRendering: 'pixelated',
            }}
          />

          <Link href="#" className="relative z-10 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary dark:border-primary/35 dark:bg-primary/15">
              <span className="text-base font-semibold">◎</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              OpenResource
            </span>
          </Link>

          <div className="relative hidden md:flex -ml-10">
            {/* Browse Dropdown - First Position */}
            <div ref={browseMenuRef} className="relative">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsBrowseOpen(!isBrowseOpen)
                  setIsBrowseHovered(false)
                }}
                onMouseEnter={() => setIsBrowseHovered(true)}
                onMouseLeave={() => setIsBrowseHovered(false)}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50 h-auto"
              >
                Browse
                <ChevronDown className={cn("ml-1 h-3 w-3 transition-transform duration-200", (isBrowseOpen || isBrowseHovered) && "rotate-180")} />
              </Button>
              {(isBrowseOpen || isBrowseHovered) && (
                <div 
                  className="absolute left-1/2 top-full mt-1 -translate-x-1/2 w-56 rounded-md border border-neutral-200 bg-background p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 z-50"
                  onMouseEnter={() => setIsBrowseHovered(true)}
                  onMouseLeave={() => setIsBrowseHovered(false)}
                >
                  {browseItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.label}
                        className="flex w-full items-start gap-3 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50"
                      >
                        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="text-left">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <Link
              href="#"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50"
            >
              Alternatives
            </Link>
            <Link
              href="#"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50"
            >
              Categories
            </Link>
            <Link
              href="#"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50"
            >
              Tech Stacks
            </Link>
            <Link
              href="#"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50",
                isSearchOpen && "opacity-0 pointer-events-none"
              )}
            >
              Self-hosted
            </Link> 
            <Link
              href="#"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium text-neutral-600 transition-all duration-300 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50",
                isSearchOpen && "opacity-0 pointer-events-none"
              )}
            >
              Sponsor
            </Link>
          </div>

          <div className="relative flex items-center gap-2" style={{ width: 'fit-content', flexShrink: 0 }}>
            <div
              ref={searchContainerRef}
              className={cn(
                "absolute flex mr-2 flex-row-reverse items-center overflow-hidden rounded-full border transition-all duration-500 ease-in-out",
                isSearchOpen
                  ? "right-56 w-[240px] gap-1 bg-background/95 pl-3 border-neutral-200 dark:bg-neutral-900/85 dark:border-neutral-700"
                  : "right-56 w-10 gap-1.5 bg-transparent px-0 border-transparent"
              )}
            >
              <button
                type="button"
                onClick={toggleSearch}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-neutral-500 transition-all duration-500 ease-in-out hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100",
                  isSearchOpen && "bg-neutral-100 text-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-100"
                )}
                aria-label={isSearchOpen ? "Close search" : "Open search"}
              >
                <Search className="size-4" aria-hidden="true" />
              </button>
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search resources..."
                className={cn(
                  "flex-1 min-w-0 bg-transparent text-sm text-neutral-700 outline-none transition-[max-width,opacity] duration-600 ease-out placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500",
                  isSearchOpen ? "max-w-[200px] opacity-100" : "pointer-events-none max-w-0 opacity-0"
                )}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation()
                    setIsSearchOpen(false)
                  }
                }}
              />
            </div>

            <div ref={themeMenuRef} className="relative hidden md:flex">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsThemeMenuOpen((open) => !open)}
                className="size-9 rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 hover:text-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
              >
                <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
                <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              {isThemeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[8rem] rounded-md border border-neutral-200 bg-background p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                  <ul className="grid gap-1">
                    {themeOptions.map((option) => (
                      <li key={option.value}>
                        <button
                          type="button"
                          onClick={() => {
                            setTheme(option.value)
                            setIsThemeMenuOpen(false)
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-sm px-3 py-1.5 text-sm transition",
                            theme === option.value
                              ? "bg-neutral-900/5 text-neutral-900 dark:bg-neutral-100/10 dark:text-neutral-100"
                              : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-50"
                          )}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="hidden items-center gap-2 rounded-full border-neutral-200 bg-white/80 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200 dark:hover:bg-neutral-800 md:inline-flex"
            >
              <Plus className="size-4" aria-hidden="true" />
              Submit
            </Button>

            <Button
              variant="outline"
              className="rounded-full border-neutral-200 bg-white/80 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900/70 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar;
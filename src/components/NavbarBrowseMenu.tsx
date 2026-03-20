"use client"

import * as React from "react"
import Link from "next/link"
import { 
    Clock, Server, Rocket, ArrowLeftRight, FolderOpen, Layers, Scale, Monitor
} from "lucide-react"
import {
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

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

interface NavbarBrowseMenuProps {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export function NavbarBrowseMenu({ onMouseEnter, onMouseLeave }: NavbarBrowseMenuProps) {
    return (
        <DropdownMenuContent
            align="start"
            className="w-64"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
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
    )
}

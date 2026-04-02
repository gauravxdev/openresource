"use client";

// Force rebuild to fix HMR desync


import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Sparkles,
  Plus,
  FilePlus,
  Github,
  Mail,
  Link2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useDashboardStore } from "@/store/dashboard-store";

export function DashboardHeader() {
  return (
    <header className="bg-card sticky top-0 z-10 flex w-full items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-2" />
        <div className="text-muted-foreground hidden items-center gap-2 sm:flex">
          <BarChart3 className="size-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center lg:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="mr-3 flex cursor-pointer -space-x-2 transition-opacity hover:opacity-80">
                <Avatar className="border-card size-6 border-2">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user1" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <Avatar className="border-card size-6 border-2">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user2" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <Avatar className="border-card size-6 border-2">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user3" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
                <div className="border-card bg-muted flex size-6 items-center justify-center rounded-full border-2">
                  <Plus className="size-3" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5">
                <p className="text-muted-foreground text-xs font-medium">
                  Team Members
                </p>
              </div>
              <DropdownMenuItem>
                <Avatar className="mr-2 size-5">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user1" />
                  <AvatarFallback>U1</AvatarFallback>
                </Avatar>
                <span>Sarah M.</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Avatar className="mr-2 size-5">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user2" />
                  <AvatarFallback>U2</AvatarFallback>
                </Avatar>
                <span>James K.</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Avatar className="mr-2 size-5">
                  <AvatarImage src="https://api.dicebear.com/9.x/glass/svg?seed=user3" />
                  <AvatarFallback>U3</AvatarFallback>
                </Avatar>
                <span>Emily R.</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Mail className="mr-2 size-4" />
                <span>Invite by email</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 className="mr-2 size-4" />
                <span>Copy invite link</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Users className="mr-2 size-4" />
                <span>Manage team</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="bg-border mx-2 h-5 w-px" />
        </div>

        <Button variant="outline" size="sm" asChild className="hidden h-7 gap-1.5 sm:flex">
          <Link href="/ai/chat">
            <Sparkles className="size-3.5" />
            <span className="text-sm">Ask AI</span>
          </Link>
        </Button>

        <ThemeToggle />

        <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
          <Link
            href="https://github.com/gauravxdev/openresource"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function WelcomeSection() {
  const { setView } = useDashboardStore();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Welcome Back LN!
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Let&apos;s tackle down some work
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="bg-card hover:bg-card/80 border-border/50 h-9 gap-1.5"
          onClick={() => setView("submit")}
        >
          <FilePlus className="size-4" />
          <span className="hidden sm:inline">Add Resource</span>
        </Button>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BarChart3,
  Layers,
  FileText,
  Users,
  Folder,
  Plus,
  ChevronsUpDown,
  Settings,
  UserPlus,
  LogOut,
  MessageSquare,
  Tag,
  Flag,
  TrendingUp,
} from "lucide-react";

type NavItem = {
  title: string;
  icon: React.ElementType;
  shortcut?: string;
  href: string;
};

const navItems: NavItem[] = [
  { title: "Dashboard", icon: BarChart3, href: "/admin" },
  { title: "Resources", icon: Folder, href: "/admin/resources" },
  { title: "Categories", icon: Tag, href: "/admin/categories" },
  { title: "Users & Logins", icon: Users, href: "/admin/users" },
  { title: "Usage", icon: TrendingUp, href: "/admin/usage" },
  { title: "Reports", icon: Flag, href: "/admin/reports" },
  { title: "Audit Logs", icon: FileText, href: "/admin/logs" },
  { title: "Behavioral Analytics", icon: Layers, href: "/admin/analytics" },
  { title: "Feedback Analytics", icon: MessageSquare, href: "/admin/feedback" },
  { title: "Submit Resource", icon: Plus, href: "/admin/submit" },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="lg:border-r-0!" collapsible="icon" {...props}>
      <SidebarHeader className="px-4 pt-5 pb-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-sidebar-accent -m-1 flex w-full shrink-0 items-center gap-3 rounded-lg p-2 transition-colors">
              <div className="bg-foreground text-background flex size-8 shrink-0 items-center justify-center rounded-lg shadow-sm">
                <span className="text-base font-bold">A</span>
              </div>
              <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <span className="text-base font-semibold tracking-tight">
                  Admin Panel
                </span>
                <ChevronsUpDown className="text-muted-foreground size-4" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <Settings className="size-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserPlus className="size-4" />
              <span>Invite members</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="px-4 pt-0">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => {
                const isSubmit = item.title === "Submit Resource";
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "group/submit h-11 px-4 transition-all duration-200",
                        isSubmit
                          ? "bg-foreground hover:bg-foreground/90 shadow-lg hover:translate-y-[-1px] hover:shadow-xl active:translate-y-0"
                          : "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3.5"
                      >
                        <item.icon
                          className={cn(
                            "size-5 transition-colors duration-200",
                            isSubmit
                              ? "text-background group-hover/submit:text-primary"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "text-[15px] font-medium tracking-tight transition-colors duration-200",
                            isSubmit
                              ? "text-background group-hover/submit:text-primary"
                              : "",
                          )}
                        >
                          {item.title}
                        </span>
                        {item.shortcut && (
                          <span
                            className={cn(
                              "ml-auto flex size-5 items-center justify-center rounded text-[10px] font-medium transition-colors duration-200",
                              isSubmit
                                ? "bg-background/20 text-background group-hover/submit:bg-primary/20 group-hover/submit:text-primary"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {item.shortcut}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-3 group-data-[collapsible=icon]:hidden">
        <div className="bg-muted/30 group/footer hover:bg-muted/50 flex w-full flex-col gap-1 rounded-xl border p-4 text-sm transition-all">
          <div className="group-hover/footer:text-primary text-lg leading-tight font-bold tracking-tight text-balance transition-colors">
            OpenResource
          </div>
          <div className="text-muted-foreground/80 group-hover/footer:text-foreground text-xs leading-relaxed transition-colors">
            Manage your open source resources and projects efficiently.
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

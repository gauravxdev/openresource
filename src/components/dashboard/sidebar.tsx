"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Plus,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  {
    href: "/dashboard/resources",
    label: "My Resources",
    icon: FolderOpen,
    exact: false,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    exact: false,
  },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <Sidebar className="top-14 h-[calc(100svh-3.5rem)] lg:border-r-0!" collapsible="icon" {...props}>
      <SidebarHeader className="px-4 py-5">
        <Link
          href="/profile"
          className="hover:bg-sidebar-accent -m-1 flex w-full shrink-0 items-center gap-3 rounded-xl p-2 transition-colors"
        >
          <Avatar className="border-border size-7 border">
            <AvatarImage src={user?.image ?? ""} alt={user?.name ?? ""} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1.5 group-data-[collapsible=icon]:hidden">
            <ArrowLeft className="text-muted-foreground h-3.5 w-3.5" />
            <span className="text-sm font-medium">Profile</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 gap-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="h-6 px-0">
            <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
              Dashboard
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "h-9 rounded-lg transition-all duration-200 mt-1",
                      isActive(link.href, link.exact)
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <Link href={link.href}>
                      <link.icon className="size-3.5" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground h-9 rounded-lg shadow-sm">
                  <Link href="/submit">
                    <Plus className="size-3.5" />
                    <span className="text-sm font-medium">Submit Resource</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-6 group-data-[collapsible=icon]:hidden">
        <div className="border border-border/40 bg-muted rounded-lg p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="text-primary size-3.5" />
            <span className="text-xs font-semibold">Quick Tip</span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Track your submitted resources, monitor approval status, and view
            performance analytics all in one place.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

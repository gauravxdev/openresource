/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import Link from "next/link";
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
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  BarChart3,
  Layers,
  FileText,
  Users,
  Globe,
  Folder,
  File,
  Megaphone,
  Code,
  Headphones,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Settings,
  UserPlus,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/store/dashboard-store";

type NavItem = {
  title: string;
  icon: React.ElementType;
  shortcut?: string;
  href: string;
};

const navItems: NavItem[] = [
  { title: "Dashboard", icon: BarChart3, href: "/admin" },
  { title: "Resources", icon: Folder, href: "/admin/resources" },
  { title: "Users & Logins", icon: Users, href: "/admin/users" },
  { title: "Behavioral Analytics", icon: Layers, href: "/admin/analytics" },
  { title: "Feedback Analytics", icon: MessageSquare, href: "/admin/feedback" },
  { title: "Audit Logs", icon: FileText, href: "/admin/logs" },
  { title: "Submit Resource", icon: Plus, href: "/admin/submit" },
];

const workgroups = [
  {
    id: "all-work",
    name: "All Work",
    icon: Globe,
    children: [
      {
        id: "website-copy",
        name: "Website Copy",
        icon: Folder,
        children: [
          { id: "client-website", name: "Client website", icon: File },
          { id: "personal-project", name: "Personal project", icon: File },
        ],
      },
      { id: "ux-research", name: "UX Research", icon: Folder },
      { id: "assets-library", name: "Assets Library", icon: Folder },
    ],
  },
  { id: "marketing", name: "Marketing", icon: Megaphone },
  { id: "development", name: "Development", icon: Code },
  { id: "support", name: "Support", icon: Headphones },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleItem = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const renderWorkgroupItem = (item: (typeof workgroups)[0], level = 0) => {
    const hasChildren = "children" in item && item.children;
    const isExpanded = expandedItems.includes(item.id);
    const Icon = item.icon;
    const paddingLeft = level * 12;

    const trigger = (
      <SidebarMenuButton
        className="h-7 text-sm"
        style={{ paddingLeft: `${8 + paddingLeft}px` }}
      >
        <Icon className="size-3.5" />
        <span className="flex-1">{item.name}</span>
        {hasChildren &&
          (isExpanded ? (
            <ChevronDown className="size-3" />
          ) : (
            <ChevronRight className="size-3" />
          ))}
      </SidebarMenuButton>
    );

    if (hasChildren) {
      const content = (
        <Collapsible
          key={item.id}
          open={isExpanded}
          onOpenChange={() => toggleItem(item.id)}
        >
          <CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="mr-0 pr-0">
              {item.children?.map((child) => (
                <SidebarMenuSubItem key={child.id}>
                  {renderWorkgroupItem(
                    child as (typeof workgroups)[0],
                    level + 1,
                  )}
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      );

      if (level === 0) {
        return <SidebarMenuItem key={item.id}>{content}</SidebarMenuItem>;
      }
      return content;
    }

    if (level === 0) {
      return <SidebarMenuItem key={item.id}>{trigger}</SidebarMenuItem>;
    }

    return trigger;
  };

  return (
    <Sidebar className="lg:border-r-0!" collapsible="icon" {...props}>
      <SidebarHeader className="px-2.5 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hover:bg-sidebar-accent -m-1 flex w-full shrink-0 items-center gap-2.5 rounded-md p-1 transition-colors">
              <div className="bg-foreground text-background flex size-7 shrink-0 items-center justify-center rounded-lg">
                <span className="text-sm font-bold">S</span>
              </div>
              <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium">Admin Panel</span>
                <ChevronsUpDown className="text-muted-foreground size-3" />
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

      <SidebarContent className="px-2.5">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-7">
                    <Link href={item.href}>
                      <item.icon className="size-3.5" />
                      <span className="text-sm">{item.title}</span>
                      {item.shortcut && (
                        <span className="bg-muted text-muted-foreground ml-auto flex size-5 items-center justify-center rounded text-[10px] font-medium">
                          {item.shortcut}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4 p-0">
          <SidebarGroupLabel className="flex h-6 items-center justify-between px-0">
            <span className="text-muted-foreground text-[10px] font-medium tracking-wider">
              Workgroups
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-5">
                <Search className="size-3" />
              </Button>
              <Button variant="ghost" size="icon" className="size-5">
                <Plus className="size-3" />
              </Button>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workgroups.map((item) => renderWorkgroupItem(item))}
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground h-7 text-sm">
                  <Plus className="size-3.5" />
                  <span>Create Group</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-2.5 pb-3 group-data-[collapsible=icon]:hidden">
        <div className="bg-background flex w-full flex-col gap-2 rounded-lg border p-4 text-sm">
          <div className="text-lg leading-tight font-semibold text-balance">
            OpenResource
          </div>
          <div className="text-muted-foreground">
            Manage your open source resources and projects efficiently.
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

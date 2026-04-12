"use client";

import React from "react";
import {
  LogIn,
  PlusCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Edit,
  FolderPlus,
  FolderMinus,
  UserMinus,
  UserCog,
  UserCheck,
  MessageSquare,
  Search,
  Eye,
  BarChart3,
  Activity,
  Shield,
  AlertTriangle,
  Zap,
  type LucideIcon,
  MessageCircleOff,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ActionBadgeProps {
  action: string;
  className?: string;
}

const ACTION_CONFIG: Record<
  string,
  { icon: LucideIcon; label: string; color: string }
> = {
  LOGIN: { icon: LogIn, label: "Login", color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  SUBMIT_RESOURCE: { icon: PlusCircle, label: "Submit Resource", color: "text-green-500 bg-green-500/10 border-green-500/20" },
  APPROVE_RESOURCE: { icon: CheckCircle, label: "Approve Resource", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  REJECT_RESOURCE: { icon: XCircle, label: "Reject Resource", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  DELETE_RESOURCE: { icon: Trash2, label: "Delete Resource", color: "text-red-600 bg-red-600/10 border-red-600/20" },
  UPDATE_RESOURCE: { icon: Edit, label: "Update Resource", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  CREATE_CATEGORY: { icon: FolderPlus, label: "Create Category", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  DELETE_CATEGORY: { icon: FolderMinus, label: "Delete Category", color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  DELETE_USER: { icon: UserMinus, label: "Delete User", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  UPDATE_USER_ROLE: { icon: UserCog, label: "Update User Role", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  UPDATE_USER_STATUS: { icon: UserCheck, label: "Update User Status", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  ADMIN_CHAT_TOOL: { icon: MessageSquare, label: "Admin Chat Tool", color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
  ADMIN_SEARCH_USERS: { icon: Search, label: "Search Users", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  ADMIN_VIEW_USER_DETAILS: { icon: Eye, label: "View User Details", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  ADMIN_UPDATE_USER_ROLE: { icon: UserCog, label: "Admin Update Role", color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  ADMIN_UPDATE_USER_STATUS: { icon: UserCheck, label: "Admin Update Status", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
  ADMIN_SEARCH_RESOURCES: { icon: Search, label: "Search Resources", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  ADMIN_UPDATE_RESOURCE_STATUS: { icon: Activity, label: "Update Resource Status", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  ADMIN_UPDATE_RESOURCE_FIELDS: { icon: Edit, label: "Update Resource Fields", color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  ADMIN_VIEW_DASHBOARD_STATS: { icon: BarChart3, label: "View Dashboard Stats", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  ADMIN_VIEW_USAGE_STATS: { icon: BarChart3, label: "View Usage Stats", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  ADMIN_VIEW_FEEDBACK_STATS: { icon: BarChart3, label: "View Feedback Stats", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
  ADMIN_SEARCH_AUDIT_LOGS: { icon: Search, label: "Search Audit Logs", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  ADMIN_VIEW_RECENT_ACTIVITY: { icon: Activity, label: "View Recent Activity", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  ADMIN_SEARCH_CHATS: { icon: Search, label: "Search Chats", color: "text-slate-500 bg-slate-500/10 border-slate-500/20" },
  ADMIN_DELETE_CHAT: { icon: Trash2, label: "Delete Chat", color: "text-red-500 bg-red-500/10 border-red-500/20" },
  ADMIN_VIEW_SYSTEM_HEALTH: { icon: Shield, label: "View System Health", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  GUEST_CHAT_STARTED: { icon: Zap, label: "Guest Chat Started", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" },
  GUEST_CHAT_LIMIT_EXCEEDED: { icon: MessageCircleOff, label: "Guest Chat Limit Exceeded", color: "text-orange-600 bg-orange-600/10 border-orange-600/20" },
  GUEST_SEARCH_LIMIT_EXCEEDED: { icon: AlertTriangle, label: "Guest Search Limit Exceeded", color: "text-orange-600 bg-orange-600/10 border-orange-600/20" },
  USER_SEARCH_LIMIT_EXCEEDED: { icon: AlertTriangle, label: "User Search Limit Exceeded", color: "text-rose-600 bg-rose-600/10 border-rose-600/20" },
  USER_CHAT_LIMIT_EXCEEDED: { icon: MessageCircleOff, label: "User Chat Limit Exceeded", color: "text-rose-600 bg-rose-600/10 border-rose-600/20" },
};

const DEFAULT_CONFIG = {
  icon: Activity,
  label: "Unknown Action",
  color: "text-slate-500 bg-slate-500/10 border-slate-500/20",
};

export function ActionBadge({ action, className }: ActionBadgeProps) {
  const config = ACTION_CONFIG[action] ?? {
    ...DEFAULT_CONFIG,
    label: action.replace(/_/g, " "),
  };

  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center justify-center rounded-md border p-1.5 transition-all hover:scale-105 active:scale-95 whitespace-nowrap",
              config.color,
              className
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{config.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5" />
          <p className="text-xs font-semibold uppercase tracking-wider">
            {config.label}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

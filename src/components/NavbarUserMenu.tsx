"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Shield, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { useSession } from "@/hooks/use-session";

export function NavbarUserMenu() {
  const router = useRouter();
  const { data: session, isPending, refetch: refetchSession } = useSession();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Local state for avatar image to enable instant updates
  const [avatarImage, setAvatarImage] = React.useState<
    string | null | undefined
  >(session?.user?.image);

  // Sync avatarImage with session when session changes
  React.useEffect(() => {
    if (session?.user?.image !== undefined) {
      setAvatarImage(session.user.image);
    }
  }, [session?.user?.image]);

  // Listen for session refresh events with optional image URL payload
  React.useEffect(() => {
    const handleSessionRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<{ imageUrl?: string | null }>;
      if (customEvent.detail?.imageUrl !== undefined) {
        setAvatarImage(customEvent.detail.imageUrl);
      }
      void refetchSession();
    };
    window.addEventListener("session-refresh", handleSessionRefresh);
    return () =>
      window.removeEventListener("session-refresh", handleSessionRefresh);
  }, [refetchSession]);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh();
    router.push("/");
  };

  if (!isMounted || isPending) {
    return <div className="bg-muted h-9 w-16 animate-pulse rounded-md" />;
  }

  if (!session) {
    return (
      <Button size="sm" asChild className="hidden sm:flex">
        <Link href="/sign-in">Sign In</Link>
      </Button>
    );
  }

  return (
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
              {session.user?.name?.charAt(0) ||
                session.user?.email?.charAt(0) ||
                "U"}
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
        {(session.user as { role?: string }).role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}
        {(session.user as { role?: string }).role === "contributor" && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

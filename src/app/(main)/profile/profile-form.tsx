/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Loader2,
  Camera,
  Trash2,
  Pencil,
  Save,
  X,
  AtSign,
  LayoutDashboard,
  FolderOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  Flame,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { updateUserImage, updateUserProfile } from "@/actions/user";
import { uploadImage } from "@/actions/upload";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UsernameInput } from "@/components/username-input";
import { updateUsername } from "@/actions/user";

interface ProfileFormProps {
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: Date;
    role: string;
  };
  resourceStats: {
    total: number;
    approved: number;
    pending: number;
  } | null;
  streakData: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string | null;
  };
}

export function ProfileForm({
  user,
  resourceStats,
  streakData,
}: ProfileFormProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState<string | null>(user.image);
  const [name, setName] = React.useState(user.name ?? "");
  const [username, setUsername] = React.useState(user.username ?? "");
  const [isUsernameValid, setIsUsernameValid] = React.useState(
    user.username ? true : false,
  );

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();

  const getInitials = (
    name: string | null | undefined,
    email: string | undefined,
  ) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email?.[0]?.toUpperCase() ?? "U";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setIsUpdating(true);

      const formData = new FormData();
      formData.append("file", file);

      const uploadResult = await uploadImage(formData);

      if (uploadResult.success && uploadResult.url) {
        const result = await updateUserImage(uploadResult.url);
        if (result.success) {
          toast.success(result.message);
          setImageUrl(uploadResult.url);
          router.refresh();
          await authClient.getSession({ query: { disableCookieCache: true } });
          window.dispatchEvent(
            new CustomEvent("session-refresh", {
              detail: { imageUrl: uploadResult.url },
            }),
          );
        } else {
          toast.error(result.message);
        }
      } else {
        toast.error(uploadResult.message ?? "Upload failed");
      }
    } catch (error) {
      console.error("[Profile Upload] Error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageUrl) return;

    try {
      setIsUpdating(true);
      const result = await updateUserImage("");
      if (result.success) {
        toast.success("Profile picture removed");
        setImageUrl(null);
        router.refresh();
        await authClient.getSession({ query: { disableCookieCache: true } });
        window.dispatchEvent(
          new CustomEvent("session-refresh", { detail: { imageUrl: null } }),
        );
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to remove image");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveChanges = async () => {
    if (
      username &&
      username.toLowerCase() !== user.username?.toLowerCase() &&
      !isUsernameValid
    ) {
      toast.error("Please provide a valid unique username.");
      return;
    }

    try {
      setIsUpdating(true);
      const nameResult = await updateUserProfile({ name });
      let usernameResult = { success: true, message: "" };

      if (
        username &&
        username.toLowerCase() !== user.username?.toLowerCase() &&
        isUsernameValid
      ) {
        usernameResult = await updateUsername(username);
      }

      if (nameResult.success && usernameResult.success) {
        toast.success(
          usernameResult.message
            ? `Profile and ${usernameResult.message}`
            : nameResult.message,
        );
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(
          usernameResult.success ? nameResult.message : usernameResult.message,
        );
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      setName(user.name ?? "");
      setUsername(user.username ?? "");
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥";
    if (streak >= 14) return "⚡";
    if (streak >= 7) return "💪";
    if (streak >= 3) return "✨";
    return "🌱";
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "from-orange-500 to-red-500";
    if (streak >= 14) return "from-yellow-500 to-orange-500";
    if (streak >= 7) return "from-blue-500 to-purple-500";
    if (streak >= 3) return "from-green-500 to-emerald-500";
    return "from-gray-400 to-gray-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        {/* Left Side: Profile & Streak (Takes 60%) */}
        <div className="flex flex-col gap-6 w-full lg:w-3/5 shrink-0">
          {/* Main Profile Card */}
          <Card className="border-border/50 bg-card/50 w-full overflow-hidden backdrop-blur">
            <CardContent className="p-0">
              <div className="relative w-full">
                {/* Background Pattern */}
                <div className="absolute inset-x-0 top-0 h-48 sm:h-56 bg-gradient-to-b from-primary/30 via-primary/5 to-transparent pointer-events-none rounded-t-xl" />
                <div className="absolute inset-x-0 top-0 h-48 sm:h-56 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.3),transparent_70%)] pointer-events-none rounded-t-xl" />

                <div className="relative px-6 pt-8 pb-6">
                  <div className="flex flex-col items-center text-center gap-6 sm:flex-row sm:text-left sm:items-center md:flex-col md:text-center md:items-center xl:flex-row xl:text-left xl:items-center">
                    {/* Profile Image */}
                    <div
                      className="group relative shrink-0 cursor-pointer"
                      onClick={() => !isUpdating && fileInputRef.current?.click()}
                    >
                      <Avatar className="border-background ring-primary/20 group-hover:ring-primary/40 h-24 w-24 sm:h-28 sm:w-28 border-4 shadow-xl ring-2 transition-all duration-300 group-hover:scale-[1.05]">
                        <AvatarImage
                          src={imageUrl ?? undefined}
                          alt={name ?? "User"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl font-bold">
                          {getInitials(name, user.email)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Camera className="mb-1 h-7 w-7 text-white" />
                        <span className="text-xs font-medium text-white">Change</span>
                      </div>

                      {/* Loading State */}
                      {isUpdating && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                      )}

                      {/* Online Indicator */}
                      <div className="border-background absolute right-1 bottom-1 h-4 w-4 rounded-full border-2 bg-green-500" />
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={isUpdating}
                    />

                    {/* Name and Email */}
                    <div className="min-w-0 flex-1 space-y-3 w-full flex flex-col items-center sm:items-start md:items-center xl:items-start text-center sm:text-left md:text-center xl:text-left">
                      <div className="space-y-1.5 flex flex-col items-center sm:items-start md:items-center xl:items-start w-full">
                        {isEditing ? (
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-background/50 h-10 text-2xl font-bold max-w-sm"
                            placeholder="Enter your name"
                          />
                        ) : (
                          <h1 className="text-foreground truncate text-2xl font-bold tracking-tight sm:text-3xl">
                            {name || "Anonymous User"}
                          </h1>
                        )}
                        <div className="text-muted-foreground flex flex-wrap items-center justify-center sm:justify-start md:justify-center xl:justify-start gap-2">
                          <Mail className="h-4 w-4 shrink-0" />
                          <span className="truncate text-sm">{user.email}</span>
                          {user.emailVerified && (
                            <Badge
                              variant="secondary"
                              className="border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] text-green-600 dark:text-green-400"
                            >
                              <Shield className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats Row */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start md:justify-center xl:justify-start gap-3 pt-2">
                        <div className="text-muted-foreground bg-muted/50 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Joined {formatDate(user.createdAt)}</span>
                        </div>
                        <div className="text-muted-foreground bg-muted/50 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs capitalize">
                          <User className="h-3.5 w-3.5" />
                          <span>{user.role}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak Section */}
              <div className="px-6 pb-6">
                <div className="from-background to-muted/30 border-border/50 relative overflow-hidden rounded-2xl border bg-gradient-to-r p-5">
                  <div className="from-primary/5 absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl to-transparent" />

                  <div className="relative flex flex-col sm:flex-row items-center sm:justify-between gap-6 sm:gap-4">
                    <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:text-left md:flex-col md:text-center xl:flex-row xl:text-left w-full sm:w-auto justify-center sm:justify-start">
                      <div className={`relative rounded-2xl bg-gradient-to-br p-3 sm:p-3 ${getStreakColor(streakData.currentStreak)} shadow-lg shrink-0`}>
                        <Flame className="h-8 w-8 text-white" />
                        {streakData.currentStreak >= 7 && (
                          <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400">
                            <Zap className="h-2.5 w-2.5 text-yellow-900" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-center sm:items-start md:items-center xl:items-start text-center sm:text-left md:text-center xl:text-left">
                        <div className="flex items-baseline justify-center sm:justify-start md:justify-center xl:justify-start gap-2">
                          <span className="text-4xl font-bold tracking-tight">
                            {streakData.currentStreak}
                          </span>
                          <span className="text-muted-foreground text-lg font-medium">day streak</span>
                          <span className="text-xl">{getStreakEmoji(streakData.currentStreak)}</span>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                          {streakData.currentStreak === 0
                            ? "Start your streak by being active today!"
                            : "Great start! Keep the momentum going!"}
                        </p>
                      </div>
                    </div>

                    {/* Longest Streak Badge */}
                    <div className="bg-muted/50 border-border/30 hidden flex-col items-center gap-1 rounded-xl border px-4 py-2 sm:flex">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="text-primary h-4 w-4" />
                        <span className="text-foreground text-2xl font-bold">{streakData.longestStreak}</span>
                      </div>
                      <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">Best Streak</span>
                    </div>
                  </div>

                  {/* Streak Progress Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{streakData.currentStreak}/30 days</span>
                    </div>
                    <div className="bg-muted/50 h-2 overflow-hidden rounded-full">
                      <div
                        className={`h-full bg-gradient-to-r ${getStreakColor(streakData.currentStreak)} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min((streakData.currentStreak / 30) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Profile Details (Takes remaining 40%) */}
        <div className="flex flex-col gap-6 flex-1 min-w-0">
          <Card className="border-border/50 bg-card/50 backdrop-blur h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg font-semibold">Profile Details</CardTitle>
                <CardDescription>Account information</CardDescription>
              </div>

              {/* Edit Button Actions */}
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={toggleEdit} className="shrink-0 gap-2">
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
              ) : (
                <div className="flex shrink-0 gap-2">
                  <Button variant="ghost" size="sm" onClick={toggleEdit} disabled={isUpdating}>
                    <X className="h-4 w-4" />
                  </Button>
                  <Button variant="default" size="sm" onClick={handleSaveChanges} disabled={isUpdating} className="gap-2">
                    {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Username Field */}
              <div className="bg-muted/20 border-border/40 hover:bg-muted/40 group flex items-center gap-4 rounded-xl border p-4">
                <div className="bg-primary/10 rounded-lg p-2.5">
                  <AtSign className="text-primary h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Username</p>
                  {isEditing ? (
                    <UsernameInput value={username} onChange={setUsername} onValidityChange={setIsUsernameValid} initialUsername={user.username} className="mt-1" />
                  ) : (
                    <p className="text-foreground truncate font-semibold">{username ? `@${username}` : "Not set"}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="bg-muted/20 border-border/40 hover:bg-muted/40 group flex items-center gap-4 rounded-xl border p-4">
                <div className="bg-primary/10 rounded-lg p-2.5">
                  <Mail className="text-primary h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Email</p>
                  <p className="text-foreground truncate font-semibold">{user.email}</p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="bg-muted/20 border-border/40 hover:bg-muted/40 group flex items-center gap-4 rounded-xl border p-4">
                <div className="bg-primary/10 rounded-lg p-2.5">
                  <Calendar className="text-primary h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Member Since</p>
                  <p className="text-foreground font-semibold">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contributor Dashboard Section */}
      {(user.role === "contributor" || user.role === "admin") && resourceStats && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <LayoutDashboard className="text-primary h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Contributor Dashboard</CardTitle>
                  <CardDescription className="text-xs">Manage your resources</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs capitalize">{user.role}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resource Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-4 text-center">
                <p className="text-2xl font-bold">{resourceStats.total}</p>
                <p className="text-muted-foreground text-[10px] font-semibold uppercase">Total</p>
              </div>
              <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 p-4 text-center">
                <p className="text-2xl font-bold text-green-400">{resourceStats.approved}</p>
                <p className="text-muted-foreground text-[10px] font-semibold uppercase">Approved</p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10 p-4 text-center">
                <p className="text-2xl font-bold text-amber-400">{resourceStats.pending}</p>
                <p className="text-muted-foreground text-[10px] font-semibold uppercase">Pending</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link href="/dashboard" className="bg-primary/5 border-primary/20 hover:bg-primary/10 flex items-center justify-between rounded-xl border p-4 transition-all">
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="text-primary h-5 w-5" />
                  <p className="text-sm font-medium">Open Dashboard</p>
                </div>
                <ArrowRight className="text-primary h-4 w-4" />
              </Link>

              <Link href="/submit" className="bg-muted/20 border-border/40 hover:bg-muted/40 flex items-center justify-between rounded-xl border p-4 transition-all">
                <div className="flex items-center gap-3">
                  <Plus className="text-muted-foreground h-5 w-5" />
                  <p className="text-sm font-medium">Submit Resource</p>
                </div>
                <ArrowRight className="text-muted-foreground h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

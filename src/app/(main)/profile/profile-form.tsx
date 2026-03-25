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
      {/* Main Profile Card */}
      <Card className="border-border/50 bg-card/50 w-full overflow-hidden backdrop-blur">
        <CardContent className="p-0">
          {/* Header Section - Image Left, Info Right */}
          <div className="relative">
            {/* Background Pattern */}
            <div className="from-primary/5 via-primary/10 absolute inset-0 h-48 bg-gradient-to-br to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />

            <div className="relative px-6 pt-8 pb-6">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                {/* Profile Image - Left Side */}
                <div
                  className="group relative shrink-0 cursor-pointer"
                  onClick={() => !isUpdating && fileInputRef.current?.click()}
                >
                  <Avatar className="border-background ring-primary/20 group-hover:ring-primary/40 h-28 w-28 border-4 shadow-xl ring-2 transition-all duration-300 group-hover:scale-[1.05]">
                    <AvatarImage
                      src={imageUrl ?? undefined}
                      alt={name ?? "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {getInitials(name, user.email)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Camera className="mb-1 h-7 w-7 text-white" />
                    <span className="text-xs font-medium text-white">
                      Change
                    </span>
                  </div>

                  {/* Loading State */}
                  {isUpdating && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}

                  {/* Remove Image Button */}
                  {imageUrl && !isUpdating && (
                    <button
                      onClick={handleRemoveImage}
                      className="absolute -right-1 -bottom-1 z-10 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-red-600"
                      title="Remove Image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

                {/* Name and Email - Right Side */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      {isEditing ? (
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-background/50 h-10 text-2xl font-bold"
                          placeholder="Enter your name"
                        />
                      ) : (
                        <h1 className="text-foreground truncate text-2xl font-bold tracking-tight sm:text-3xl">
                          {name || "Anonymous User"}
                        </h1>
                      )}
                      <div className="text-muted-foreground flex items-center gap-2">
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
                      {username && !isEditing && (
                        <p className="text-muted-foreground flex items-center gap-1 text-sm">
                          <AtSign className="h-3.5 w-3.5" />
                          {username}
                        </p>
                      )}
                    </div>

                    {/* Edit Button */}
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleEdit}
                        className="shrink-0 gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit Profile</span>
                      </Button>
                    ) : (
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleEdit}
                          disabled={isUpdating}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSaveChanges}
                          disabled={isUpdating}
                          className="gap-2"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Quick Stats Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
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

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Streak Flame Icon */}
                  <div
                    className={`relative rounded-2xl bg-gradient-to-br p-3 ${getStreakColor(streakData.currentStreak)} shadow-lg`}
                  >
                    <Flame className="h-8 w-8 text-white" />
                    {streakData.currentStreak >= 7 && (
                      <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400">
                        <Zap className="h-2.5 w-2.5 text-yellow-900" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tight">
                        {streakData.currentStreak}
                      </span>
                      <span className="text-muted-foreground text-lg font-medium">
                        day streak
                      </span>
                      <span className="text-xl">
                        {getStreakEmoji(streakData.currentStreak)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-sm">
                      {streakData.currentStreak === 0
                        ? "Start your streak by being active today!"
                        : streakData.currentStreak >= 30
                          ? "Incredible dedication! Keep it going!"
                          : streakData.currentStreak >= 14
                            ? "You're on fire! Don't break the chain!"
                            : streakData.currentStreak >= 7
                              ? "Amazing consistency! You're building momentum!"
                              : "Great start! Keep the momentum going!"}
                    </p>
                  </div>
                </div>

                {/* Longest Streak Badge */}
                <div className="bg-muted/50 border-border/30 hidden flex-col items-center gap-1 rounded-xl border px-4 py-2 sm:flex">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="text-primary h-4 w-4" />
                    <span className="text-foreground text-2xl font-bold">
                      {streakData.longestStreak}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                    Best Streak
                  </span>
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
                    style={{
                      width: `${Math.min((streakData.currentStreak / 30) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Mobile Longest Streak */}
              <div className="border-border/30 mt-4 flex items-center justify-center gap-2 border-t pt-4 sm:hidden">
                <TrendingUp className="text-primary h-4 w-4" />
                <span className="text-sm font-medium">Best Streak: </span>
                <span className="text-lg font-bold">
                  {streakData.longestStreak} days
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Card */}
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">
            Profile Details
          </CardTitle>
          <CardDescription>
            Your account information and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Username Field */}
          <div className="bg-muted/20 border-border/40 hover:bg-muted/40 hover:border-border/60 group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200">
            <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2.5 transition-colors">
              <AtSign className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Username
              </p>
              {isEditing ? (
                <UsernameInput
                  value={username}
                  onChange={setUsername}
                  onValidityChange={setIsUsernameValid}
                  initialUsername={user.username}
                  className="mt-1"
                />
              ) : (
                <p className="text-foreground truncate font-semibold">
                  {username ? `@${username}` : "Not set"}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="bg-muted/20 border-border/40 hover:bg-muted/40 hover:border-border/60 group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200">
            <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2.5 transition-colors">
              <Mail className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Email Address
              </p>
              <p className="text-foreground truncate font-semibold">
                {user.email}
              </p>
            </div>
            {user.emailVerified && (
              <Badge
                variant="secondary"
                className="ml-auto shrink-0 border-green-500/20 bg-green-500/10 px-3 py-1 font-medium text-green-600 dark:text-green-400"
              >
                <Shield className="mr-1 h-3.5 w-3.5" />
                Verified
              </Badge>
            )}
          </div>

          {/* Member Since */}
          <div className="bg-muted/20 border-border/40 hover:bg-muted/40 hover:border-border/60 group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200">
            <div className="bg-primary/10 group-hover:bg-primary/20 rounded-lg p-2.5 transition-colors">
              <Calendar className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground mb-0.5 text-[10px] font-bold tracking-widest uppercase">
                Member Since
              </p>
              <p className="text-foreground font-semibold">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributor Dashboard Section */}
      {user.role === "contributor" && resourceStats && (
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <LayoutDashboard className="text-primary h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Contributor Dashboard
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Manage your resources and track performance
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {user.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resource Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 p-4 text-center transition-colors hover:from-blue-500/10 hover:to-blue-500/15">
                <div className="mb-2 flex justify-center">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <FolderOpen className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{resourceStats.total}</p>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                  Total
                </p>
              </div>
              <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 p-4 text-center transition-colors hover:from-green-500/10 hover:to-green-500/15">
                <div className="mb-2 flex justify-center">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {resourceStats.approved}
                </p>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                  Approved
                </p>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10 p-4 text-center transition-colors hover:from-amber-500/10 hover:to-amber-500/15">
                <div className="mb-2 flex justify-center">
                  <div className="rounded-lg bg-amber-500/10 p-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {resourceStats.pending}
                </p>
                <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                  Pending
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href="/dashboard"
                className="bg-primary/5 border-primary/20 hover:bg-primary/10 group flex items-center justify-between rounded-xl border p-4 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Open Dashboard</p>
                    <p className="text-muted-foreground text-xs">
                      Full management panel
                    </p>
                  </div>
                </div>
                <ArrowRight className="text-primary h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              <Link
                href="/submit"
                className="bg-muted/20 border-border/40 hover:bg-muted/40 group flex items-center justify-between rounded-xl border p-4 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Plus className="text-muted-foreground h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">Submit Resource</p>
                    <p className="text-muted-foreground text-xs">
                      Add a new project
                    </p>
                  </div>
                </div>
                <ArrowRight className="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

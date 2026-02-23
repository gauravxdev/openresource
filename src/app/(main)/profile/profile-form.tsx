"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Shield, Loader2, Camera, Trash2, Pencil, Save, X } from "lucide-react";
import { updateUserImage, updateUserProfile } from "@/actions/user";
import { uploadImage } from "@/actions/upload";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileFormProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
        emailVerified: boolean;
        createdAt: Date;
    };
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    // Track the current image URL - starts with user.image from props, updated on successful upload
    const [imageUrl, setImageUrl] = React.useState<string | null>(user.image);
    // Track user name
    const [name, setName] = React.useState(user.name ?? "");

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const router = useRouter();

    const getInitials = (name: string | null | undefined, email: string | undefined) => {
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

        // Basic validation
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
                    // Update local state and refresh router to sync navbar
                    setImageUrl(uploadResult.url);
                    router.refresh();
                    // Force bypass cookie cache and trigger navbar session refresh with new image URL
                    await authClient.getSession({ query: { disableCookieCache: true } });
                    window.dispatchEvent(new CustomEvent('session-refresh', { detail: { imageUrl: uploadResult.url } }));
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
        e.stopPropagation(); // Don't trigger the file input
        if (!imageUrl) return;

        try {
            setIsUpdating(true);
            const result = await updateUserImage("");
            if (result.success) {
                toast.success("Profile picture removed");
                setImageUrl(null);
                router.refresh();
                // Force bypass cookie cache and trigger navbar session refresh with null image
                await authClient.getSession({ query: { disableCookieCache: true } });
                window.dispatchEvent(new CustomEvent('session-refresh', { detail: { imageUrl: null } }));
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
        try {
            setIsUpdating(true);
            const result = await updateUserProfile({ name });

            if (result.success) {
                toast.success(result.message);
                setIsEditing(false);
                router.refresh();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Cancel editing
            setName(user.name ?? "");
            setIsEditing(false);
        } else {
            // Start editing
            setIsEditing(true);
        }
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur w-full">
            <CardHeader className="text-center pb-2 relative">
                <div className="absolute right-6 top-6">
                    {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={toggleEdit} className="gap-2">
                            <Pencil className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={toggleEdit} disabled={isUpdating} className="gap-2">
                                <X className="h-4 w-4" />
                                Cancel
                            </Button>
                            <Button variant="default" size="sm" onClick={handleSaveChanges} disabled={isUpdating} className="gap-2">
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-center mb-8 pt-4">
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => !isUpdating && fileInputRef.current?.click()}
                    >
                        <Avatar className="h-40 w-40 border-4 border-background shadow-2xl transition-all duration-300 group-hover:scale-[1.05] group-hover:shadow-primary/20">
                            <AvatarImage src={imageUrl ?? undefined} alt={name ?? "User"} className="object-cover" />
                            <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                {getInitials(name, user.email)}
                            </AvatarFallback>
                        </Avatar>

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Camera className="h-10 w-10 text-white mb-2" />
                            <span className="text-white text-sm font-semibold">Change Photo</span>
                        </div>

                        {/* Loading State Overlay */}
                        {isUpdating && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                <Loader2 className="h-12 w-12 animate-spin text-white" />
                            </div>
                        )}

                        {/* Remove Image Button (visible on hover if image exists) */}
                        {imageUrl && !isUpdating && (
                            <button
                                onClick={handleRemoveImage}
                                className="absolute bottom-1 right-1 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                                title="Remove Image"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUpdating}
                />

                <div className="space-y-1">
                    <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                        {name || "Anonymous User"}
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">{user.email}</CardDescription>
                </div>
            </CardHeader>
            <Separator className="my-8" />
            <CardContent className="space-y-6">
                <div className="grid gap-5">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 hover:border-border/60 transition-all duration-200 group">
                        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Display Name</p>
                            {isEditing ? (
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-10 text-lg font-semibold mt-1"
                                    placeholder="Enter your name"
                                />
                            ) : (
                                <p className="font-semibold text-foreground text-lg">{name || "Not set"}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 hover:border-border/60 transition-all duration-200 group">
                        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Email Address</p>
                            <p className="font-semibold text-foreground text-lg">{user.email}</p>
                        </div>
                        {user.emailVerified && (
                            <Badge variant="secondary" className="ml-auto bg-green-500/10 text-green-500 border-green-500/20 px-4 py-1.5 font-bold">
                                <Shield className="h-4 w-4 mr-1.5" />
                                Verified
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 border border-border/40 hover:bg-muted/40 hover:border-border/60 transition-all duration-200 group">
                        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Member Since</p>
                            <p className="font-semibold text-foreground text-lg">{formatDate(user.createdAt)}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

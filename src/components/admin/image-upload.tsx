"use client";

import * as React from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Image from "next/image";

import { uploadImage } from "@/actions/upload";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove: () => void;
    title?: string;
    description?: string;
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    title = "Resource Banner/Icon",
    description = "Recommended size: 1200x630px. Max 5MB."
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
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

            setIsUploading(true);
            const formData = new FormData();
            formData.append("file", file);

            const result = await uploadImage(formData);

            if (result.success && result.url) {
                onChange(result.url);
                toast.success("Image uploaded successfully");
            } else {
                throw new Error(result.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to upload image. Please try again.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-neutral-800">
                        <Image
                            src={value}
                            alt="Uploaded image"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <button
                            onClick={onRemove}
                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
                            type="button"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 rounded-lg border-2 border-dashed border-neutral-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-neutral-700 transition-all bg-neutral-900/50"
                    >
                        {isUploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground font-medium">Upload Image</span>
                            </>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={onUpload}
                disabled={isUploading}
            />
        </div>
    );
}

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6 shrink-0 transition-colors", className)}
    >
      {/* Main Frame - Using the path from og-image.svg */}
      <path
        d="M0 0 H80 V80 H0 V0 Z M15 15 V75 H65 V15 H15 Z"
        fill="currentColor"
      />
      {/* Open Door - Using the path from og-image.svg */}
      <path d="M22 22 L45 28 V68 L22 75 Z" fill="currentColor" />
    </svg>
  );
}

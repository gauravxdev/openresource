import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <img
      src="/icon.png"
      alt="OpenResource Logo"
      className={cn("h-6 w-6 shrink-0 rounded-md object-cover", className)}
    />
  );
}

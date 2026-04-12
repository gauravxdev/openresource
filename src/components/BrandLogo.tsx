import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <Image
      src="/icon.png"
      alt="OpenResource Logo"
      width={24}
      height={24}
      className={cn("h-6 w-6 shrink-0 rounded-md object-cover", className)}
    />
  );
}

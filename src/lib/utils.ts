import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: Date | string | null): string {
  if (!date) return "N/A";
  try {
    const d = new Date(date);
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "N/A";
  }
}

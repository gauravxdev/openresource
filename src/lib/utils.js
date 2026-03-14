import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export function timeAgo(date) {
    if (!date)
        return "N/A";
    try {
        const d = new Date(date);
        return formatDistanceToNow(d, { addSuffix: true });
    }
    catch {
        return "N/A";
    }
}

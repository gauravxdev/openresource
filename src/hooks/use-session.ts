import { useQuery } from "@tanstack/react-query";
import type { Session, User } from "better-auth";

type SessionData = {
    session: Session;
    user: User & { role?: string };
} | null;

export function useSession() {
    return useQuery<SessionData>({
        queryKey: ["session"],
        queryFn: async () => {
            const response = await fetch("/api/auth/get-session");
            if (!response.ok) return null
            return response.json() as Promise<SessionData>;
        },
        staleTime: 5 * 60 * 1000, // 5 Min
        refetchOnWindowFocus: true,
    });
}
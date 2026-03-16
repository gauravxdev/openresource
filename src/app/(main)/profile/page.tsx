import { auth } from "@/lib/auth"
import { db } from "@/server/db"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
        query: { disableCookieCache: true }, // Always get fresh session to detect sign-out
    })

    if (!session) {
        redirect("/sign-in")
    }

    // Fetch fresh user data from database (bypasses session cache)
    const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            emailVerified: true,
            createdAt: true,
            role: true,
        },
    })

    if (!user) {
        redirect("/sign-in")
    }

    // Fetch resource stats for contributors/admins
    let resourceStats = null;
    if (user.role === "contributor" || user.role === "admin") {
        const [total, approved, pending] = await Promise.all([
            db.resource.count({ where: { userId: user.id } }),
            db.resource.count({ where: { userId: user.id, status: "APPROVED" } }),
            db.resource.count({ where: { userId: user.id, status: "PENDING" } }),
        ]);
        resourceStats = { total, approved, pending };
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
            <div className="mx-auto max-w-2xl">
                <ProfileForm user={user} resourceStats={resourceStats} />
            </div>
        </div>
    )
}


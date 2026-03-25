import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

async function calculateStreak(userId: string) {
  // Get all login history entries for the user, ordered by date descending
  const loginHistory = await db.loginHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (loginHistory.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    };
  }

  // Get unique dates (ignoring time) - using UTC dates
  const uniqueDates = [
    ...new Set(
      loginHistory.map((entry) => {
        const date = new Date(entry.createdAt);
        return new Date(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
        ).getTime();
      }),
    ),
  ].sort((a, b) => b - a); // Sort descending

  const today = new Date();
  const todayUTC = new Date(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  ).getTime();
  const yesterdayUTC = todayUTC - 24 * 60 * 60 * 1000;

  // Calculate current streak
  let currentStreak = 0;
  let expectedDate = todayUTC;

  // Check if the most recent login is today or yesterday
  const mostRecentLogin = uniqueDates[0];
  if (
    mostRecentLogin &&
    (mostRecentLogin === todayUTC || mostRecentLogin === yesterdayUTC)
  ) {
    currentStreak = 1;
    expectedDate = mostRecentLogin - 24 * 60 * 60 * 1000;

    // Count consecutive days
    for (let i = 1; i < uniqueDates.length; i++) {
      const dateAtIndex = uniqueDates[i];
      if (dateAtIndex === expectedDate) {
        currentStreak++;
        expectedDate -= 24 * 60 * 60 * 1000;
      } else if (dateAtIndex !== undefined && dateAtIndex < expectedDate) {
        // Gap found, streak broken
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = uniqueDates[i];
    const nextDate = uniqueDates[i + 1];
    if (!currentDate || !nextDate) continue;

    const diff = currentDate - nextDate;
    if (diff === 24 * 60 * 60 * 1000) {
      tempStreak++;
    } else if (diff > 24 * 60 * 60 * 1000) {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  const lastActiveDate = loginHistory[0]?.createdAt?.toISOString() ?? null;

  return {
    currentStreak,
    longestStreak,
    lastActiveDate,
  };
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });

  if (!session) {
    redirect("/sign-in");
  }

  // Fetch fresh user data from database
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
  });

  if (!user) {
    redirect("/sign-in");
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

  // Calculate streak data
  const streakData = await calculateStreak(user.id);

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <ProfileForm
          user={user}
          resourceStats={resourceStats}
          streakData={streakData}
        />
      </div>
    </div>
  );
}

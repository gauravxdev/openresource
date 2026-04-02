import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/server/db";
import { env } from "@/env";
import { nextCookies } from "better-auth/next-js";
import { logAudit } from "@/lib/audit";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      image: {
        type: "string",
        required: false,
        fieldName: "image",
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "ACTIVE",
      },
      username: {
        type: "string",
        required: false,
        fieldName: "username",
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 15,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          if (!session?.userId) return;

          try {
            const userId = session.userId;

            // Update lastLoginAt on User
            await db.user.update({
              where: { id: userId },
              data: { lastLoginAt: new Date() },
            });

            // Record Login History
            await db.loginHistory.create({
              data: {
                userId,
                ipAddress: session.ipAddress || null,
                userAgent: session.userAgent || null,
              },
            });

            // Create Audit Log
            await logAudit({
              action: "LOGIN",
              userId: userId,
              details: { source: "session_created" },
            });
          } catch (error) {
            console.error("Failed to track login metrics:", error);
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

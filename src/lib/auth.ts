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
        },
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 60 * 24 * 15,
        }
    },
    emailAndPassword: {
        enabled: true,
    },
    databaseHooks: {
        session: {
            create: {
                after: async (session) => {
                    if (!session || !session.userId) return;

                    try {
                        const userId = session.userId;

                        // Update lastLoginAt on User
                        await db.user.update({
                            where: { id: userId },
                            data: { lastLoginAt: new Date() },
                        });

                        // We can't directly get request headers from databaseHooks, 
                        // so we'll log what we have. IP and UserAgent are typically handled 
                        // on the API route level, but for raw DB tracking, this is a solid fallback.
                        // Record Login History
                        await db.loginHistory.create({
                            data: {
                                userId,
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
                }
            }
        }
    },
    plugins: [nextCookies()]
});
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to Sentry
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="flex px-4 flex-col items-center justify-center min-h-[400px] text-center">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Something went wrong in the Admin area!</h2>
            <p className="text-muted-foreground mb-6 max-w-lg">
                {error.message || "An unexpected error occurred. The support team has been notified."}
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

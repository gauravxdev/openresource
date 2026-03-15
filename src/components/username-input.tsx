"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useDebounce } from "use-debounce";
import { checkUsernameAvailability } from "@/actions/user";
import { cn } from "@/lib/utils";

interface UsernameInputProps {
    value: string;
    onChange: (value: string) => void;
    onValidityChange: (isValid: boolean) => void;
    className?: string;
    disabled?: boolean;
    initialUsername?: string | null;
}

export function UsernameInput({
    value,
    onChange,
    onValidityChange,
    className,
    disabled = false,
    initialUsername,
}: UsernameInputProps) {
    const [debouncedValue] = useDebounce(value, 500);
    const [isChecking, setIsChecking] = React.useState(false);
    const [availabilityMessage, setAvailabilityMessage] = React.useState<string | null>(null);
    const [isAvailable, setIsAvailable] = React.useState<boolean>(true); // Default true if unchanged or empty

    React.useEffect(() => {
        let isMounted = true;

        const checkAvailability = async () => {
            // Skip check if it matches initial username or is empty
            if (!debouncedValue.trim()) {
                setIsChecking(false);
                setIsAvailable(false);
                setAvailabilityMessage("");
                onValidityChange(false);
                return;
            }

            if (debouncedValue.toLowerCase() === initialUsername?.toLowerCase()) {
                setIsChecking(false);
                setIsAvailable(true);
                setAvailabilityMessage(null);
                onValidityChange(true);
                return;
            }

            // Client-side regex check first
            const regex = /^[a-zA-Z0-9_]{5,20}$/;
            if (!regex.test(debouncedValue)) {
                setIsChecking(false);
                setIsAvailable(false);
                setAvailabilityMessage("5-20 chars, alphanumeric & underscores only");
                onValidityChange(false);
                return;
            }

            // Server-side availability check
            setIsChecking(true);
            try {
                const result = await checkUsernameAvailability(debouncedValue);
                if (!isMounted) return;

                if (result.available) {
                    setIsAvailable(true);
                    setAvailabilityMessage("Username is available");
                    onValidityChange(true);
                } else {
                    setIsAvailable(false);
                    setAvailabilityMessage(result.error || "Username is taken");
                    onValidityChange(false);
                }
            } catch (error) {
                if (!isMounted) return;
                setIsAvailable(false);
                setAvailabilityMessage("Error checking availability");
                onValidityChange(false);
            } finally {
                if (isMounted) setIsChecking(false);
            }
        };

        checkAvailability();

        return () => {
            isMounted = false;
        };
    }, [debouncedValue, initialUsername, onValidityChange]);

    return (
        <div className={cn("relative w-full", className)}>
            <div className="relative flex items-center">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className={cn(
                        "pr-10 h-10 text-lg font-semibold",
                        value && !isAvailable && value.toLowerCase() !== initialUsername?.toLowerCase()
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "",
                        isAvailable && value && value.toLowerCase() !== initialUsername?.toLowerCase()
                            ? "border-green-500 focus-visible:ring-green-500"
                            : ""
                    )}
                    placeholder="Enter unique username"
                />
                <div className="absolute right-3">
                    {isChecking ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : value && value.toLowerCase() !== initialUsername?.toLowerCase() ? (
                        isAvailable ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                        )
                    ) : null}
                </div>
            </div>
            {availabilityMessage && value.toLowerCase() !== initialUsername?.toLowerCase() && (
                <p
                    className={cn(
                        "text-sm mt-1.5 font-medium ml-1",
                        isAvailable ? "text-green-500" : "text-red-500"
                    )}
                >
                    {availabilityMessage}
                </p>
            )}
        </div>
    );
}

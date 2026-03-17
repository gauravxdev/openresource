"use client";

import { useState } from "react";
import { MoreHorizontal, UserCog, UserMinus, ShieldAlert, ShieldCheck } from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { updateUserStatus, updateUserRole } from "@/actions/admin/users";
import { toast } from "sonner";

interface UserActionsDropdownProps {
    userId: string;
    currentRole: "user" | "contributor" | "admin";
    currentStatus: "ACTIVE" | "RESTRICTED" | "BANNED";
}

export function UserActionsDropdown({ userId, currentRole, currentStatus }: UserActionsDropdownProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleChange = async (newRole: "user" | "contributor" | "admin") => {
        setIsLoading(true);
        try {
            const result = await updateUserRole(userId, newRole);
            if (result.success) {
                toast.success(`User role changed to ${newRole}`);
            } else {
                toast.error(result.error || "Failed to change role");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: "ACTIVE" | "RESTRICTED" | "BANNED") => {
        setIsLoading(true);
        try {
            const result = await updateUserStatus(userId, newStatus);
            if (result.success) {
                toast.success(`User status changed to ${newStatus}`);
            } else {
                toast.error(result.error || "Failed to change status");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Role Actions */}
                {currentRole !== "admin" && (
                    <DropdownMenuItem onClick={() => handleRoleChange("admin")}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Make Admin
                    </DropdownMenuItem>
                )}
                {currentRole !== "contributor" && (
                    <DropdownMenuItem onClick={() => handleRoleChange("contributor")}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Make Contributor
                    </DropdownMenuItem>
                )}
                {currentRole !== "user" && (
                    <DropdownMenuItem onClick={() => handleRoleChange("user")}>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Make Regular User
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                {/* Status Actions */}
                {currentStatus !== "ACTIVE" && (
                    <DropdownMenuItem onClick={() => handleStatusChange("ACTIVE")}>
                        <ShieldCheck className="mr-2 h-4 w-4 text-green-600" />
                        Activate User
                    </DropdownMenuItem>
                )}
                {currentStatus !== "RESTRICTED" && (
                    <DropdownMenuItem onClick={() => handleStatusChange("RESTRICTED")}>
                        <ShieldAlert className="mr-2 h-4 w-4 text-yellow-600" />
                        Restrict User
                    </DropdownMenuItem>
                )}
                {currentStatus !== "BANNED" && (
                    <DropdownMenuItem onClick={() => handleStatusChange("BANNED")} className="text-red-600">
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        Ban User
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

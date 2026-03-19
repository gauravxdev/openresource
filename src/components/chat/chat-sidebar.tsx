/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { unstable_serialize } from "swr/infinite";
import { PlusIcon, TrashIcon } from "lucide-react";
import { SparklesIcon } from "./icons";
import {
    getChatHistoryPaginationKey,
    SidebarHistory,
} from "./sidebar-history";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function ChatSidebar({
    userId,
}: {
    userId: string | undefined;
}) {
    const router = useRouter();
    const { setOpenMobile } = useSidebar();
    const { mutate } = useSWRConfig();
    const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);

    const handleDeleteAll = () => {
        const deletePromise = fetch("/api/chat/history", {
            method: "DELETE",
        });

        toast.promise(deletePromise, {
            loading: "Deleting all chats...",
            success: () => {
                mutate(unstable_serialize(getChatHistoryPaginationKey));
                setShowDeleteAllDialog(false);
                router.replace("/ai/chat");
                router.refresh();
                return "All chats deleted successfully";
            },
            error: "Failed to delete all chats",
        });
    };

    return (
        <>
            <Sidebar className="!top-14 !h-[calc(100svh-3.5rem)] group-data-[side=left]:border-r-0">
                <SidebarHeader>
                    <SidebarMenu>
                        <div className="flex flex-row items-center justify-between">
                            <Link
                                className="flex flex-row items-center gap-2"
                                href="/ai/chat"
                                onClick={() => {
                                    setOpenMobile(false);
                                }}
                            >
                                <SparklesIcon size={16} />
                                <span className="cursor-pointer rounded-md px-1 font-semibold text-sm hover:bg-muted">
                                    OpenResource AI
                                </span>
                            </Link>
                            <div className="mr-2 flex flex-row gap-1">
                                {userId && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    className="h-8 p-1 md:h-fit md:p-2"
                                                    onClick={() => setShowDeleteAllDialog(true)}
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <TrashIcon className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent
                                                align="end"
                                                className="hidden md:block"
                                            >
                                                Delete All Chats
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                className="h-8 p-1 md:h-fit md:p-2"
                                                onClick={() => {
                                                    setOpenMobile(false);
                                                    router.push("/ai/chat");
                                                    router.refresh();
                                                }}
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                            >
                                                <PlusIcon className="size-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            align="end"
                                            className="hidden md:block"
                                        >
                                            New Chat
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>
                    </SidebarMenu>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarHistory userId={userId} />
                </SidebarContent>
                <SidebarFooter />
            </Sidebar>

            <AlertDialog
                onOpenChange={setShowDeleteAllDialog}
                open={showDeleteAllDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete all chats?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all
                            your chats and remove them from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAll}>
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

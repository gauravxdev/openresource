"use client";

import { isToday, isYesterday, subMonths, subWeeks } from "date-fns";
import { Loader2Icon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWRInfinite from "swr/infinite";
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
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    useSidebar,
} from "@/components/ui/sidebar";
import { ChatItem } from "./sidebar-history-item";

type ChatRecord = {
    id: string;
    title: string;
    createdAt: string | Date;
    visibility: string;
    isPinned?: boolean;
};

type GroupedChats = {
    pinned: ChatRecord[];
    today: ChatRecord[];
    yesterday: ChatRecord[];
    lastWeek: ChatRecord[];
    lastMonth: ChatRecord[];
    older: ChatRecord[];
};

type ChatHistory = {
    chats: ChatRecord[];
    hasMore: boolean;
};

const PAGE_SIZE = 20;

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
};

const groupChatsByDate = (chats: ChatRecord[]): GroupedChats => {
    const now = new Date();
    const oneWeekAgo = subWeeks(now, 1);
    const oneMonthAgo = subMonths(now, 1);

    return chats.reduce(
        (groups, chat) => {
            const chatDate = new Date(chat.createdAt);

            if (chat.isPinned) {
                groups.pinned.push(chat);
            } else if (isToday(chatDate)) {
                groups.today.push(chat);
            } else if (isYesterday(chatDate)) {
                groups.yesterday.push(chat);
            } else if (chatDate > oneWeekAgo) {
                groups.lastWeek.push(chat);
            } else if (chatDate > oneMonthAgo) {
                groups.lastMonth.push(chat);
            } else {
                groups.older.push(chat);
            }

            return groups;
        },
        {
            pinned: [],
            today: [],
            yesterday: [],
            lastWeek: [],
            lastMonth: [],
            older: [],
        } as GroupedChats,
    );
};

export function getChatHistoryPaginationKey(
    pageIndex: number,
    previousPageData: ChatHistory,
) {
    if (previousPageData && previousPageData.hasMore === false) {
        return null;
    }

    if (pageIndex === 0) {
        return `/api/chat/history?limit=${PAGE_SIZE}`;
    }

    const lastChat = previousPageData.chats.at(-1);

    if (!lastChat) {
        return null;
    }

    return `/api/chat/history?ending_before=${lastChat.id}&limit=${PAGE_SIZE}`;
}

export function SidebarHistory({
    userId,
}: {
    userId: string | undefined;
}) {
    const { setOpenMobile } = useSidebar();
    const pathname = usePathname();
    const activeChatId = pathname?.startsWith("/ai/chat/")
        ? pathname.split("/")[3]
        : null;

    const {
        data: paginatedChatHistories,
        setSize,
        isValidating,
        isLoading,
        mutate,
    } = useSWRInfinite<ChatHistory>(getChatHistoryPaginationKey, fetcher, {
        fallbackData: [],
    });

    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const [renameId, setRenameId] = useState<string | null>(null);
    const [showRenameDialog, setShowRenameDialog] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    const hasReachedEnd = paginatedChatHistories
        ? paginatedChatHistories.some((page) => page.hasMore === false)
        : false;

    const hasEmptyChatHistory = paginatedChatHistories
        ? paginatedChatHistories.every((page) => page.chats.length === 0)
        : false;

    const handleDelete = () => {
        const chatToDelete = deleteId;
        const isCurrentChat = pathname === `/ai/chat/${chatToDelete}`;

        setShowDeleteDialog(false);

        const deletePromise = fetch(`/api/chat?id=${chatToDelete}`, {
            method: "DELETE",
        }).then(async (res) => {
            if (!res.ok) throw new Error("Failed to delete chat");
            return res.json();
        });

        toast.promise(deletePromise, {
            loading: "Deleting chat...",
            success: () => {
                mutate((chatHistories) => {
                    if (chatHistories) {
                        return chatHistories.map((chatHistory) => ({
                            ...chatHistory,
                            chats: chatHistory.chats.filter(
                                (chat) => chat.id !== chatToDelete,
                            ),
                        }));
                    }
                });

                if (isCurrentChat) {
                    router.replace("/ai/chat");
                    router.refresh();
                }

                return "Chat deleted successfully";
            },
            error: "Failed to delete chat",
        });
    };

    const handleRename = () => {
        if (!renameId || !newTitle.trim()) return;
        setShowRenameDialog(false);

        const promise = fetch(`/api/chat?id=${renameId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
        }).then(async (res) => {
            if (!res.ok) throw new Error("Failed to rename chat");
            return res.json();
        });

        toast.promise(promise, {
            loading: "Renaming chat...",
            success: () => {
                mutate((chatHistories) => {
                    if (chatHistories) {
                        return chatHistories.map((history) => ({
                            ...history,
                            chats: history.chats.map((c) =>
                                c.id === renameId ? { ...c, title: newTitle } : c
                            ),
                        }));
                    }
                });
                return "Chat renamed successfully";
            },
            error: "Failed to rename chat",
        });
    };

    const handlePin = (chatToPin: ChatRecord) => {
        const newPinnedState = !chatToPin.isPinned;
        const promise = fetch(`/api/chat?id=${chatToPin.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPinned: newPinnedState }),
        }).then(async (res) => {
            if (!res.ok) throw new Error("Failed to pin chat");
            return res.json();
        });

        toast.promise(promise, {
            loading: newPinnedState ? "Pinning chat..." : "Unpinning chat...",
            success: () => {
                mutate((chatHistories) => {
                    if (chatHistories) {
                        return chatHistories.map((history) => ({
                            ...history,
                            chats: history.chats.map((c) =>
                                c.id === chatToPin.id ? { ...c, isPinned: newPinnedState } : c
                            ),
                        }));
                    }
                });
                return newPinnedState ? "Chat pinned" : "Chat unpinned";
            },
            error: "Failed to update chat",
        });
    };

    if (!userId) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
                        Sign in to save and revisit previous chats!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (isLoading) {
        return (
            <SidebarGroup>
                <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                    Today
                </div>
                <SidebarGroupContent>
                    <div className="flex flex-col">
                        {[44, 32, 28, 64, 52].map((item) => (
                            <div
                                className="flex h-8 items-center gap-2 rounded-md px-2"
                                key={item}
                            >
                                <div
                                    className="h-4 max-w-(--skeleton-width) flex-1 rounded-md bg-sidebar-accent-foreground/10"
                                    style={
                                        {
                                            "--skeleton-width": `${item}%`,
                                        } as React.CSSProperties
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    if (hasEmptyChatHistory) {
        return (
            <SidebarGroup>
                <SidebarGroupContent>
                    <div className="flex w-full flex-row items-center justify-center gap-2 px-2 text-sm text-zinc-500">
                        Your conversations will appear here once you start chatting!
                    </div>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    return (
        <>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {paginatedChatHistories &&
                            (() => {
                                const chatsFromHistory = paginatedChatHistories.flatMap(
                                    (paginatedChatHistory) => paginatedChatHistory.chats,
                                );

                                const groupedChats = groupChatsByDate(chatsFromHistory);

                                return (
                                    <div className="flex flex-col gap-6">
                                        {groupedChats.pinned.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                                                    Pinned
                                                </div>
                                                {groupedChats.pinned.map((chat) => (
                                                    <ChatItem
                                                        chat={chat as any}
                                                        isActive={chat.id === activeChatId}
                                                        key={chat.id}
                                                        onDelete={(chatId) => {
                                                            setDeleteId(chatId);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        onRename={(chatId, currentTitle) => {
                                                            setRenameId(chatId);
                                                            setNewTitle(currentTitle);
                                                            setShowRenameDialog(true);
                                                        }}
                                                        onPin={(chatToPin) => handlePin(chatToPin as any)}
                                                        setOpenMobile={setOpenMobile}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {groupedChats.today.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                                                    Today
                                                </div>
                                                {groupedChats.today.map((chat) => (
                                                    <ChatItem
                                                        chat={chat as any}
                                                        isActive={chat.id === activeChatId}
                                                        key={chat.id}
                                                        onDelete={(chatId) => {
                                                            setDeleteId(chatId);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        onRename={(chatId, currentTitle) => {
                                                            setRenameId(chatId);
                                                            setNewTitle(currentTitle);
                                                            setShowRenameDialog(true);
                                                        }}
                                                        onPin={(chatToPin) => handlePin(chatToPin as any)}
                                                        setOpenMobile={setOpenMobile}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {groupedChats.yesterday.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                                                    Yesterday
                                                </div>
                                                {groupedChats.yesterday.map((chat) => (
                                                    <ChatItem
                                                        chat={chat as any}
                                                        isActive={chat.id === activeChatId}
                                                        key={chat.id}
                                                        onDelete={(chatId) => {
                                                            setDeleteId(chatId);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        onRename={(chatId, currentTitle) => {
                                                            setRenameId(chatId);
                                                            setNewTitle(currentTitle);
                                                            setShowRenameDialog(true);
                                                        }}
                                                        onPin={(chatToPin) => handlePin(chatToPin as any)}
                                                        setOpenMobile={setOpenMobile}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {groupedChats.lastWeek.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                                                    Last 7 days
                                                </div>
                                                {groupedChats.lastWeek.map((chat) => (
                                                    <ChatItem
                                                        chat={chat as any}
                                                        isActive={chat.id === activeChatId}
                                                        key={chat.id}
                                                        onDelete={(chatId) => {
                                                            setDeleteId(chatId);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        onRename={(chatId, currentTitle) => {
                                                            setRenameId(chatId);
                                                            setNewTitle(currentTitle);
                                                            setShowRenameDialog(true);
                                                        }}
                                                        onPin={(chatToPin) => handlePin(chatToPin as any)}
                                                        setOpenMobile={setOpenMobile}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {groupedChats.lastMonth.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                                                    Last 30 days
                                                </div>
                                                {groupedChats.lastMonth.map((chat) => (
                                                    <ChatItem
                                                        chat={chat as any}
                                                        isActive={chat.id === activeChatId}
                                                        key={chat.id}
                                                        onDelete={(chatId) => {
                                                            setDeleteId(chatId);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        onRename={(chatId, currentTitle) => {
                                                            setRenameId(chatId);
                                                            setNewTitle(currentTitle);
                                                            setShowRenameDialog(true);
                                                        }}
                                                        onPin={(chatToPin) => handlePin(chatToPin as any)}
                                                        setOpenMobile={setOpenMobile}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {groupedChats.older.length > 0 && (
                                            <div>
                                                <div className="px-2 py-1 text-sidebar-foreground/50 text-xs">
                                                    Older
                                                </div>
                                                {groupedChats.older.map((chat) => (
                                                    <ChatItem
                                                        chat={chat as any}
                                                        isActive={chat.id === activeChatId}
                                                        key={chat.id}
                                                        onDelete={(chatId) => {
                                                            setDeleteId(chatId);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        onRename={(chatId, currentTitle) => {
                                                            setRenameId(chatId);
                                                            setNewTitle(currentTitle);
                                                            setShowRenameDialog(true);
                                                        }}
                                                        onPin={(chatToPin) => handlePin(chatToPin as any)}
                                                        setOpenMobile={setOpenMobile}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                    </SidebarMenu>

                    {!hasReachedEnd && (
                        <div className="mt-8 flex flex-row items-center gap-2 p-2 text-zinc-500 dark:text-zinc-400">
                            <Loader2Icon className="size-4 animate-spin" />
                            <div>Loading Chats...</div>
                        </div>
                    )}
                </SidebarGroupContent>
            </SidebarGroup>

            <AlertDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            chat and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog onOpenChange={setShowRenameDialog} open={showRenameDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Chat</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Enter new title..."
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleRename();
                                }
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRename}>
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

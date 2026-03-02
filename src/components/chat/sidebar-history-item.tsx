"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo } from "react";
import { MoreHorizontalIcon, TrashIcon, PencilIcon, PinIcon, PinOffIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

type ChatHistoryChat = {
    id: string;
    title: string;
    createdAt: string | Date;
    visibility: string;
    isPinned?: boolean;
};

const PureChatItem = ({
    chat,
    isActive,
    onDelete,
    onRename,
    onPin,
    setOpenMobile,
}: {
    chat: ChatHistoryChat;
    isActive: boolean;
    onDelete: (chatId: string) => void;
    onRename: (chatId: string, currentTitle: string) => void;
    onPin: (chat: ChatHistoryChat) => void;
    setOpenMobile: (open: boolean) => void;
}) => {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link
                    href={`/ai/chat/${chat.id}`}
                    onClick={() => setOpenMobile(false)}
                >
                    <span>{chat.title}</span>
                </Link>
            </SidebarMenuButton>

            <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                        className="mr-0.5 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        showOnHover={!isActive}
                    >
                        <MoreHorizontalIcon className="size-4" />
                        <span className="sr-only">More</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="bottom">
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() => onRename(chat.id, chat.title)}
                    >
                        <PencilIcon className="mr-2 size-4" />
                        <span>Rename</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() => onPin(chat)}
                    >
                        {chat.isPinned ? (
                            <>
                                <PinOffIcon className="mr-2 size-4" />
                                <span>Unpin</span>
                            </>
                        ) : (
                            <>
                                <PinIcon className="mr-2 size-4" />
                                <span>Pin</span>
                            </>
                        )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                        onSelect={() => onDelete(chat.id)}
                    >
                        <TrashIcon className="mr-2 size-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    if (prevProps.chat.title !== nextProps.chat.title) return false;
    if (prevProps.chat.isPinned !== nextProps.chat.isPinned) return false;
    return true;
});

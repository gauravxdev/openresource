"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { memo } from "react";
import { MoreHorizontalIcon, TrashIcon } from "lucide-react";
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
};

const PureChatItem = ({
    chat,
    isActive,
    onDelete,
    setOpenMobile,
}: {
    chat: ChatHistoryChat;
    isActive: boolean;
    onDelete: (chatId: string) => void;
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
                        className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                        onSelect={() => onDelete(chat.id)}
                    >
                        <TrashIcon className="size-4" />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) {
        return false;
    }
    return true;
});

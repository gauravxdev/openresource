"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal,
    Edit,
    Trash2,
    ExternalLink,
    Github,
    Globe
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { deleteAdminResource } from "@/actions/admin/resources";
import { toast } from "sonner";
import Link from "next/link";

export function ResourcesTable({ resources }: { resources: any[] }) {
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;

        setIsDeleting(id);
        const result = await deleteAdminResource(id);
        setIsDeleting(null);

        if (result.success) {
            toast.success("Resource deleted successfully");
        } else {
            toast.error(result.error || "Failed to delete resource");
        }
    };

    return (
        <div className="rounded-md border-none bg-card/30">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {resources?.map((resource) => (
                        <TableRow key={resource.id}>
                            <TableCell className="font-medium">
                                <div className="flex flex-col">
                                    <span>{resource.name}</span>
                                    <span className="text-xs text-muted-foreground font-normal line-clamp-1">
                                        {resource.slug}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        resource.status === "APPROVED"
                                            ? "default"
                                            : resource.status === "PENDING"
                                                ? "secondary"
                                                : "destructive"
                                    }
                                >
                                    {resource.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(resource.createdAt), {
                                    addSuffix: true,
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/admin/resources/${resource.id}`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            disabled={isDeleting === resource.id}
                                            onClick={() => handleDelete(resource.id)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            {isDeleting === resource.id ? "Deleting..." : "Delete"}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <a href={resource.repositoryUrl} target="_blank" rel="noopener noreferrer">
                                                <Github className="mr-2 h-4 w-4" />
                                                Repository
                                            </a>
                                        </DropdownMenuItem>
                                        {resource.websiteUrl && (
                                            <DropdownMenuItem asChild>
                                                <a href={resource.websiteUrl} target="_blank" rel="noopener noreferrer">
                                                    <Globe className="mr-2 h-4 w-4" />
                                                    Website
                                                </a>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                    {(!resources || resources.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                No resources found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

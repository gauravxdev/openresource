"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getCategories } from "@/actions/categories";

export function AdminFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);

    const status = searchParams.get("status") ?? "ALL";
    const category = searchParams.get("category") ?? "ALL";
    const sortBy = searchParams.get("sortBy") ?? "newest";

    React.useEffect(() => {
        const fetchCategories = async () => {
            const result = await getCategories();
            if (result.success && result.data) {
                setCategories(result.data);
            }
        };
        void fetchCategories();
    }, []);

    const updateQuery = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "ALL" || (key === "sortBy" && value === "newest")) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        params.set("page", "1"); // Reset to page 1 on filter change
        router.push(`/admin/resources?${params.toString()}`);
    };

    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Select value={status} onValueChange={(v) => updateQuery("status", v)}>
                    <SelectTrigger className="w-[150px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-neutral-900/50">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Category:</span>
                <Select value={category} onValueChange={(v) => updateQuery("category", v)}>
                    <SelectTrigger className="w-[180px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-neutral-900/50">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort By:</span>
                <Select value={sortBy} onValueChange={(v) => updateQuery("sortBy", v)}>
                    <SelectTrigger className="w-[160px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-neutral-900/50">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unused-vars */
import { getAdminResourceById } from "@/actions/admin/resources";
import { SubmitForm } from "@/components/submit-form";
import { notFound } from "next/navigation";

interface EditResourcePageProps {
    params: {
        id: string;
    };
}

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await getAdminResourceById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const initialData = {
        ...result.data,
        categories: result.data.categories?.map((cat: any) => cat.name) || [],
    };

    return (
        <div className="flex-1 h-full overflow-y-auto p-4 md:p-8 pt-6">
            <SubmitForm initialData={initialData as any} mode="admin" />
        </div>
    );
}

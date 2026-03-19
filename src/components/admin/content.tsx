/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
"use client";

import { WelcomeSection } from "./header";
import { StatsCards } from "./stats-cards";
import { RecentResourcesTable } from "./recent-resources-table";
import { RecentActivityList } from "./recent-activity-list";

import { useDashboardStore } from "@/store/dashboard-store";
import { SubmitForm } from "@/components/submit-form";

export function DashboardContent({ data }: { data: any }) {
    const { currentView } = useDashboardStore();

    if (currentView === "submit") {
        return <SubmitForm />;
    }

    return (
        <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-6 bg-background w-full">
            <WelcomeSection />
            <StatsCards data={data} />
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                <RecentResourcesTable resources={data.recentResources} />
                <RecentActivityList activities={data.recentActivity} />
            </div>
        </main>
    );
}

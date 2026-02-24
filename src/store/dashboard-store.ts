import { create } from "zustand";

interface DashboardStore {
    currentView: "dashboard" | "submit";
    setView: (view: "dashboard" | "submit") => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
    currentView: "dashboard",
    setView: (view) => set({ currentView: view }),
}));

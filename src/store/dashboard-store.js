import { create } from "zustand";
export const useDashboardStore = create((set) => ({
    currentView: "dashboard",
    setView: (view) => set({ currentView: view }),
}));

import { create } from "zustand";
import type { DashboardStats } from "@/types";
import { generateDashboardStats } from "@/utils/mockData";

interface DashboardState {
  stats: DashboardStats;
  lastUpdate: Date;
  isLoading: boolean;
  refreshStats: () => void;
  startAutoRefresh: () => () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: generateDashboardStats(),
  lastUpdate: new Date(),
  isLoading: false,
  refreshStats: () => {
    set({ isLoading: true });
    setTimeout(() => {
      set({
        stats: generateDashboardStats(),
        lastUpdate: new Date(),
        isLoading: false,
      });
    }, 300);
  },
  startAutoRefresh: () => {
    const interval = setInterval(() => {
      get().refreshStats();
    }, 5000);
    return () => clearInterval(interval);
  },
}));

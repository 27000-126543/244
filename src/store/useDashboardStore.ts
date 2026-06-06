import { create } from 'zustand';
import { api } from '@/utils/request';

export interface DashboardStats {
  total_referrals: number;
  total_consultations: number;
  total_examinations: number;
  total_prescriptions: number;
  bed_occupancy_rate: number;
  mutual_recognition_rate: number;
  stock_turnover_rate: number;
  pending_referrals: number;
  today_consultations: number;
  total_beds: number;
  available_beds: number;
  low_stock_drugs: number;
}

export interface TrendItem {
  date: string;
  count: number;
}

export interface HospitalStat {
  id: string;
  name: string;
  level: string;
  total_beds: number;
  available_beds: number;
  referral_out_count: number;
  referral_in_count: number;
  consultation_count: number;
  bed_occupancy_rate: number;
}

export interface DiseaseItem {
  name: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  status: string;
  created_at: string;
  hospital: string;
}

interface DashboardState {
  stats: DashboardStats | null;
  trend: TrendItem[];
  hospitalStats: HospitalStat[];
  diseaseDistribution: DiseaseItem[];
  recentActivities: ActivityItem[];
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  autoRefreshInterval: number | null;
  lastUpdate: Date | null;
  fetchAllData: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchTrend: (days?: number) => Promise<void>;
  fetchHospitalStats: () => Promise<void>;
  fetchDiseaseDistribution: () => Promise<void>;
  fetchRecentActivities: (limit?: number) => Promise<void>;
  startAutoRefresh: (interval?: number) => void;
  stopAutoRefresh: () => void;
  refreshStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  trend: [],
  hospitalStats: [],
  diseaseDistribution: [],
  recentActivities: [],
  loading: false,
  isLoading: false,
  error: null,
  autoRefreshInterval: null,
  lastUpdate: null,

  fetchAllData: async () => {
    set({ loading: true, isLoading: true, error: null });
    try {
      const [statsRes, trendRes, hospitalRes, diseaseRes, activityRes] = await Promise.all([
        api.dashboard.getStats(),
        api.dashboard.getReferralTrend(7),
        api.dashboard.getHospitalStats(),
        api.dashboard.getDiseaseDistribution(),
        api.dashboard.getRecentActivities(10),
      ]);

      set({
        stats: statsRes.data || null,
        trend: trendRes.data || [],
        hospitalStats: hospitalRes.data || [],
        diseaseDistribution: diseaseRes.data || [],
        recentActivities: activityRes.data || [],
        loading: false,
        isLoading: false,
        lastUpdate: new Date(),
      });
    } catch (error: any) {
      set({ error: error.message || '数据加载失败', loading: false, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res: any = await api.dashboard.getStats();
      set({ stats: res.data || null, lastUpdate: new Date() });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchTrend: async (days = 7) => {
    try {
      const res: any = await api.dashboard.getReferralTrend(days);
      set({ trend: res.data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchHospitalStats: async () => {
    try {
      const res: any = await api.dashboard.getHospitalStats();
      set({ hospitalStats: res.data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchDiseaseDistribution: async () => {
    try {
      const res: any = await api.dashboard.getDiseaseDistribution();
      set({ diseaseDistribution: res.data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchRecentActivities: async (limit = 10) => {
    try {
      const res: any = await api.dashboard.getRecentActivities(limit);
      set({ recentActivities: res.data || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  startAutoRefresh: (interval = 5000) => {
    get().stopAutoRefresh();
    const refreshInterval = window.setInterval(() => {
      get().fetchStats();
    }, interval);
    set({ autoRefreshInterval: refreshInterval });
  },

  stopAutoRefresh: () => {
    const { autoRefreshInterval } = get();
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      set({ autoRefreshInterval: null });
    }
  },

  refreshStats: async () => {
    await get().fetchStats();
  },
}));

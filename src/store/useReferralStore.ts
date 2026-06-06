import { create } from 'zustand';
import { api } from '@/utils/request';

export interface Referral {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_gender?: string;
  patient_age?: number;
  disease_type: string;
  disease_summary: string;
  from_hospital_id: string;
  from_hospital_name: string;
  from_department_id: string;
  from_department_name: string;
  from_doctor_id: string;
  from_doctor_name: string;
  to_hospital_id: string;
  to_hospital_name: string;
  to_department_id: string;
  to_department_name: string;
  to_doctor_id: string;
  to_doctor_name: string;
  estimated_wait_time: number;
  current_level: number;
  status: 'pending' | 'approving' | 'approved' | 'rejected';
  is_escalated: number;
  approval_level_1_by?: string;
  approval_level_1_at?: string;
  approval_level_1_comment?: string;
  approval_level_2_by?: string;
  approval_level_2_at?: string;
  approval_level_2_comment?: string;
  approval_level_3_by?: string;
  approval_level_3_at?: string;
  approval_level_3_comment?: string;
  created_at: string;
  updated_at: string;
  attachments?: any[];
}

export interface HospitalRecommendation {
  id: string;
  name: string;
  level: string;
  address: string;
  total_beds: number;
  available_beds: number;
  department_id: string;
  department_name: string;
  available_registration: number;
  total_registration: number;
  pending_referrals: number;
  disease_match_score: number;
  bed_occupancy_rate: number;
  registration_available_rate: number;
  estimated_wait_time: number;
  score: number;
}

interface ReferralState {
  referrals: Referral[];
  total: number;
  page: number;
  pageSize: number;
  detail: Referral | null;
  loading: boolean;
  error: string | null;
  recommendations: HospitalRecommendation[];
  fetchList: (params?: any) => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
  createReferral: (data: any) => Promise<string>;
  approveReferral: (id: string, comment?: string) => Promise<void>;
  rejectReferral: (id: string, comment?: string) => Promise<void>;
  fetchRecommendations: (diseaseType: string) => Promise<void>;
  resetDetail: () => void;
}

export const useReferralStore = create<ReferralState>((set, get) => ({
  referrals: [],
  total: 0,
  page: 1,
  pageSize: 20,
  detail: null,
  loading: false,
  error: null,
  recommendations: [],

  fetchList: async (params) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.referrals.list(params);
      set({
        referrals: res.data || [],
        total: res.total || 0,
        page: res.page || 1,
        pageSize: res.pageSize || 20,
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchDetail: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.referrals.get(id);
      set({ detail: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createReferral: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.referrals.create(data);
      set({ loading: false });
      return res.data.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  approveReferral: async (id: string, comment?: string) => {
    set({ loading: true, error: null });
    try {
      await api.referrals.approve(id, { level: 1, comment });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  rejectReferral: async (id: string, comment?: string) => {
    set({ loading: true, error: null });
    try {
      await api.referrals.reject(id, { comment });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchRecommendations: async (diseaseType: string) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.referrals.recommendHospitals(diseaseType);
      set({ recommendations: res.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  resetDetail: () => {
    set({ detail: null });
  },
}));

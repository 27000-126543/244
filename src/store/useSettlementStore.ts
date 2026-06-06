import { create } from 'zustand';
import { api } from '@/utils/request';

export interface Settlement {
  id: string;
  patient_id?: string;
  patient_name?: string;
  referral_id?: string;
  from_hospital_id?: string;
  from_hospital_name?: string;
  to_hospital_id?: string;
  to_hospital_name?: string;
  total_amount: number;
  insurance_amount: number;
  patient_pay_amount: number;
  from_hospital_share: number;
  to_hospital_share: number;
  status: 'pending' | 'completed';
  settlement_date?: string;
  created_at: string;
  items?: any[];
}

interface SettlementState {
  settlements: Settlement[];
  total: number;
  page: number;
  pageSize: number;
  detail: Settlement | null;
  loading: boolean;
  error: string | null;
  fetchList: (params?: any) => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
  createSettlement: (data: any) => Promise<string>;
  completeSettlement: (id: string) => Promise<void>;
  calculateSettlement: (data: { total_amount: number; referral?: boolean }) => {
    insurance_amount: number;
    patient_pay_amount: number;
    from_hospital_share: number;
    to_hospital_share: number;
  };
  resetDetail: () => void;
}

export const useSettlementStore = create<SettlementState>((set, get) => ({
  settlements: [],
  total: 0,
  page: 1,
  pageSize: 20,
  detail: null,
  loading: false,
  error: null,

  fetchList: async (params) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.settlements.list(params);
      set({
        settlements: res.data || [],
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
      const res: any = await api.settlements.get(id);
      set({ detail: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createSettlement: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.settlements.create(data);
      set({ loading: false });
      return res.data.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  completeSettlement: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.settlements.complete(id);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  calculateSettlement: (data) => {
    const { total_amount, referral = true } = data;
    const insurance_amount = Math.round(total_amount * 0.7);
    const patient_pay_amount = total_amount - insurance_amount;
    
    let from_hospital_share = 0;
    let to_hospital_share = 0;
    
    if (referral) {
      from_hospital_share = Math.round(insurance_amount * 0.1);
      to_hospital_share = Math.round(insurance_amount * 0.5);
    }

    return {
      insurance_amount,
      patient_pay_amount,
      from_hospital_share,
      to_hospital_share,
    };
  },

  resetDetail: () => {
    set({ detail: null });
  },
}));

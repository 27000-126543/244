import { create } from 'zustand';
import { api } from '@/utils/request';

export interface Drug {
  id: string;
  name: string;
  generic_name: string;
  specification: string;
  manufacturer: string;
  unit: string;
  price: number;
  stock: number;
  min_stock: number;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  drug_id: string;
  drug_name: string;
  specification: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  dosage: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  patient_name: string;
  hospital_id?: string;
  hospital_name?: string;
  department_id?: string;
  department_name?: string;
  doctor_id?: string;
  doctor_name?: string;
  status: 'pending' | 'transferred' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  items?: PrescriptionItem[];
}

export interface StockAlert {
  id: string;
  drug_id: string;
  drug_name: string;
  current_stock: number;
  min_stock: number;
  status: 'pending' | 'notified' | 'resolved';
  notified: number;
  created_at: string;
}

interface PrescriptionState {
  prescriptions: Prescription[];
  total: number;
  page: number;
  pageSize: number;
  detail: Prescription | null;
  drugs: Drug[];
  stockAlerts: StockAlert[];
  loading: boolean;
  error: string | null;
  fetchList: (params?: any) => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
  createPrescription: (data: any) => Promise<string>;
  transferPrescription: (id: string, pharmacyName?: string) => Promise<void>;
  fetchDrugs: (params?: { keyword?: string; low_stock?: boolean }) => Promise<void>;
  fetchStockAlerts: (status?: string) => Promise<void>;
  notifyAlert: (alertId: string) => Promise<void>;
  handleAlert: (alertId: string) => Promise<void>;
  resetDetail: () => void;
}

export const usePrescriptionStore = create<PrescriptionState>((set, get) => ({
  prescriptions: [],
  total: 0,
  page: 1,
  pageSize: 20,
  detail: null,
  drugs: [],
  stockAlerts: [],
  loading: false,
  error: null,

  fetchList: async (params) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.prescriptions.list(params);
      set({
        prescriptions: res.data || [],
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
      const res: any = await api.prescriptions.get(id);
      set({ detail: res.data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createPrescription: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.prescriptions.create(data);
      set({ loading: false });
      return res.data.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  transferPrescription: async (id: string, pharmacyName?: string) => {
    set({ loading: true, error: null });
    try {
      await api.prescriptions.transfer(id, pharmacyName);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchDrugs: async (params) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.prescriptions.getDrugs(params);
      set({ drugs: res.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchStockAlerts: async (status) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.prescriptions.getStockAlerts(status);
      set({ stockAlerts: res.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  notifyAlert: async (alertId: string) => {
    try {
      await api.prescriptions.notifyAlert(alertId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  handleAlert: async (alertId: string) => {
    try {
      await api.prescriptions.handleAlert(alertId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  resetDetail: () => {
    set({ detail: null });
  },
}));

import { create } from 'zustand';
import { api } from '@/utils/request';

export interface Consultation {
  id: string;
  title: string;
  patient_id?: string;
  patient_name?: string;
  hospital_id?: string;
  hospital_name?: string;
  department_id?: string;
  department_name?: string;
  status: 'scheduled' | 'ongoing' | 'completed';
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  summary?: string;
  created_by?: string;
  created_at: string;
}

export interface ConsultationMessage {
  id: string;
  consultation_id: string;
  user_id: string;
  user_name: string;
  content: string;
  message_type: string;
  created_at: string;
}

interface ConsultationState {
  consultations: Consultation[];
  total: number;
  page: number;
  pageSize: number;
  detail: Consultation | null;
  messages: ConsultationMessage[];
  loading: boolean;
  error: string | null;
  fetchList: (params?: any) => Promise<void>;
  fetchDetail: (id: string) => Promise<void>;
  createConsultation: (data: any) => Promise<string>;
  sendMessage: (id: string, content: string) => Promise<void>;
  startConsultation: (id: string) => Promise<void>;
  endConsultation: (id: string, summary?: string) => Promise<void>;
  resetDetail: () => void;
}

export const useConsultationStore = create<ConsultationState>((set, get) => ({
  consultations: [],
  total: 0,
  page: 1,
  pageSize: 20,
  detail: null,
  messages: [],
  loading: false,
  error: null,

  fetchList: async (params) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.consultations.list(params);
      set({
        consultations: res.data || [],
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
      const res: any = await api.consultations.get(id);
      set({
        detail: res.data,
        messages: res.data?.messages || [],
        loading: false,
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createConsultation: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const res: any = await api.consultations.create(data);
      set({ loading: false });
      return res.data.id;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  sendMessage: async (id: string, content: string) => {
    try {
      await api.consultations.sendMessage(id, content);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  startConsultation: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.consultations.start(id);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  endConsultation: async (id: string, summary?: string) => {
    set({ loading: true, error: null });
    try {
      await api.consultations.end(id, summary);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  resetDetail: () => {
    set({ detail: null, messages: [] });
  },
}));

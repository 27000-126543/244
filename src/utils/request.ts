const BASE_URL = 'http://localhost:3005/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  showError?: boolean;
}

function getToken(): string | null {
  return localStorage.getItem('med_token');
}

export async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, ...restOptions } = options;

  let fullUrl = `${BASE_URL}${url}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }

  const token = getToken();
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      ...restOptions,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('med_token');
      localStorage.removeItem('med_user');
      window.location.href = '/login';
      throw new Error('登录已过期，请重新登录');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败');
  }
}

export const api = {
  auth: {
    login: (data: { username: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () =>
      request('/auth/logout', { method: 'POST' }),
    getMe: () =>
      request('/auth/me'),
  },

  referrals: {
    list: (params?: any) =>
      request('/referrals', { params }),
    get: (id: string) =>
      request(`/referrals/${id}`),
    create: (data: any) =>
      request('/referrals', { method: 'POST', body: JSON.stringify(data) }),
    approve: (id: string, data: { level: number; comment?: string }) =>
      request(`/referrals/${id}/approve`, { method: 'POST', body: JSON.stringify(data) }),
    reject: (id: string, data: { comment?: string }) =>
      request(`/referrals/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),
    recommendHospitals: (diseaseType: string) =>
      request('/referrals/recommend/hospitals', { params: { disease_type: diseaseType } }),
  },

  consultations: {
    list: (params?: any) =>
      request('/consultations', { params }),
    get: (id: string) =>
      request(`/consultations/${id}`),
    create: (data: any) =>
      request('/consultations', { method: 'POST', body: JSON.stringify(data) }),
    sendMessage: (id: string, content: string) =>
      request(`/consultations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
    start: (id: string) =>
      request(`/consultations/${id}/start`, { method: 'POST' }),
    end: (id: string, summary?: string) =>
      request(`/consultations/${id}/end`, { method: 'POST', body: JSON.stringify({ summary }) }),
  },

  examinations: {
    list: (params?: any) =>
      request('/examinations', { params }),
    get: (id: string) =>
      request(`/examinations/${id}`),
    create: (data: any) =>
      request('/examinations', { method: 'POST', body: JSON.stringify(data) }),
    patientHistory: (patientId: string) =>
      request(`/examinations/patient/${patientId}/history`),
  },

  prescriptions: {
    list: (params?: any) =>
      request('/prescriptions', { params }),
    get: (id: string) =>
      request(`/prescriptions/${id}`),
    create: (data: any) =>
      request('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
    transfer: (id: string, pharmacyName?: string) =>
      request(`/prescriptions/${id}/transfer`, { method: 'POST', body: JSON.stringify({ pharmacy_name: pharmacyName }) }),
    getStockAlerts: (status?: string) =>
      request('/prescriptions/drugs/stock-alerts', { params: { status } }),
    notifyAlert: (alertId: string) =>
      request(`/prescriptions/drugs/stock-alerts/${alertId}/notify`, { method: 'POST' }),
    handleAlert: (alertId: string) =>
      request(`/prescriptions/drugs/stock-alerts/${alertId}/handle`, { method: 'POST' }),
    getDrugs: (params?: { keyword?: string; low_stock?: boolean }) =>
      request('/prescriptions/drugs/list', { params }),
  },

  settlements: {
    list: (params?: any) =>
      request('/settlements', { params }),
    get: (id: string) =>
      request(`/settlements/${id}`),
    create: (data: any) =>
      request('/settlements', { method: 'POST', body: JSON.stringify(data) }),
    complete: (id: string) =>
      request(`/settlements/${id}/complete`, { method: 'POST' }),
  },

  dashboard: {
    getStats: () =>
      request('/dashboard/stats'),
    getReferralTrend: (days?: number) =>
      request('/dashboard/referral-trend', { params: { days } }),
    getHospitalStats: () =>
      request('/dashboard/hospital-stats'),
    getDiseaseDistribution: () =>
      request('/dashboard/disease-type-distribution'),
    getRecentActivities: (limit?: number) =>
      request('/dashboard/recent-activities', { params: { limit } }),
    getReports: (params?: any) =>
      request('/dashboard/reports', { params }),
  },

  common: {
    getHospitals: (level?: string) =>
      request('/common/hospitals', { params: { level } }),
    getHospitalDepartments: (hospitalId: string) =>
      request(`/common/hospitals/${hospitalId}/departments`),
    getDepartments: (hospitalId?: string) =>
      request('/common/departments', { params: { hospital_id: hospitalId } }),
    getDoctors: (params?: { hospital_id?: string; department_id?: string; role?: string }) =>
      request('/common/doctors', { params }),
    getPatients: (keyword?: string) =>
      request('/common/patients', { params: { keyword } }),
    getNotifications: (isRead?: boolean) =>
      request('/common/notifications', { params: { is_read: isRead } }),
    markNotificationRead: (id: string) =>
      request(`/common/notifications/${id}/read`, { method: 'POST' }),
    markAllNotificationsRead: () =>
      request('/common/notifications/read-all', { method: 'POST' }),
  },
};

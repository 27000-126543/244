import { create } from "zustand";
import type { User } from "@/types";
import { api } from "@/utils/request";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: localStorage.getItem("med_token"),
  
  login: async (username: string, password: string) => {
    try {
      const response: any = await api.auth.login({ username, password });
      const { token, user } = response;
      
      set({ token, user, isAuthenticated: true });
      localStorage.setItem("med_token", token);
      localStorage.setItem("med_user", JSON.stringify(user));
      
      return true;
    } catch (error) {
      console.error("登录失败:", error);
      return false;
    }
  },
  
  logout: () => {
    try {
      api.auth.logout();
    } catch (e) {
      console.log("登出请求失败");
    }
    set({ user: null, isAuthenticated: false, token: null });
    localStorage.removeItem("med_token");
    localStorage.removeItem("med_user");
  },
  
  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },
  
  setToken: (token: string) => {
    set({ token });
    localStorage.setItem("med_token", token);
  },
}));

export function initAuth() {
  const storedToken = localStorage.getItem("med_token");
  const storedUser = localStorage.getItem("med_user");
  
  if (storedToken && storedUser) {
    try {
      const user = JSON.parse(storedUser) as User;
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setToken(storedToken);
    } catch {
      localStorage.removeItem("med_token");
      localStorage.removeItem("med_user");
    }
  }
}

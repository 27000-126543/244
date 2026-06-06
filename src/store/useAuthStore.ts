import { create } from "zustand";
import type { User, UserRole } from "@/types";
import { mockUsers } from "@/utils/mockData";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, role: UserRole) => boolean;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (username: string, role: UserRole) => {
    const foundUser = mockUsers.find(
      (u) => u.name.includes(username) || u.role === role
    );
    if (foundUser) {
      set({ user: foundUser, isAuthenticated: true });
      localStorage.setItem("med_user", JSON.stringify(foundUser));
      return true;
    }
    return false;
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem("med_user");
  },
  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },
}));

export function initAuth() {
  const stored = localStorage.getItem("med_user");
  if (stored) {
    try {
      const user = JSON.parse(stored) as User;
      useAuthStore.getState().setUser(user);
    } catch {
      localStorage.removeItem("med_user");
    }
  }
}

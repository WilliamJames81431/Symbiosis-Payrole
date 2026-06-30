import { create } from 'zustand';

export type Role = 'Admin' | 'HR' | 'Employee';

interface AuthState {
  isAuthenticated: boolean;
  userRole: Role;
  setRole: (role: Role) => void;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false, // Default to logged out
  userRole: 'Admin', // Default role upon login
  setRole: (role) => set({ userRole: role }),
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));

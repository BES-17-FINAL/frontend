import { create } from "zustand";
import { authService } from "../services/auth";
import StorageService from "../services/storage";

const useAuthStore = create((set) => ({
  token: StorageService.getAccessToken() || null,
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: !!new URLSearchParams(window.location.search).get("token"),
  error: null,

  setAuth: (authData) => set(authData),
  setLoading: (value) => set({ loading: value }),

  logout: () => {
    authService.logout();
    set({ token: null, user: null, isAuthenticated: false, loading: false });
  },
}));

export default useAuthStore;

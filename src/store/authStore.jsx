import { create } from "zustand";
import { authService } from "../services/auth";

const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,

  // -------------------- LOCAL 로그인 --------------------
    login: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(userData);

      set({
        user: data.user,
        isAuthenticated: true,
        loading: false,
      });

      return data;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Login failed",
      });
      throw err;
    }
  },

  // -------------------- LOCAL 회원가입 --------------------
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);

      set({
        isAuthenticated: false, // 가입 후 자동 로그인 ❌
        loading: false,
      });

      return data;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || "Registration failed",
      });
      throw err;
    }
  },

  // -------------------- OAuth 로그인 (토큰 저장) --------------------
  oauthLogin: async (token) => {
    const data = await authService.oauthLogin(token);

    set({
      user: data.user,
      isAuthenticated: true,
      loading: false,
    });
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setAuth: (authData) => set(authData),
}));

export default useAuthStore;

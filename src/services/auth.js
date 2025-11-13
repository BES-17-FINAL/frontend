import api from "./api";
import StorageService from "./storage";

export const authService = {
  async login(userData) {
    const response = await api.post("/auth/login", userData);
    const { token, nickname, email } = response.data;

    StorageService.setAccessToken(token);
    localStorage.setItem("user", JSON.stringify({ nickname, email }));

    return response.data;
  },

  async register(userData) {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  logout() {
    StorageService.clear();
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!StorageService.getAccessToken();
  },
};

import api from "./api";
import StorageService from "./storage";

export const authService = {
  async login(userData) {
    const response = await api.post("/auth/login", userData);
    const { token, nickname, email, user } = response.data;
    console.log("Login Response:", response.data);
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);
      StorageService.setAccessToken(token);
    }
    if (nickname) {
      localStorage.setItem("nickname", nickname);
    }
    if (email) {
      localStorage.setItem("email", email);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else if (nickname || email) {
      localStorage.setItem("user", JSON.stringify({ nickname, email }));
    }

    return response.data;
  },

  async register(userData) {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },

  logout() {
    StorageService.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("nickname");
    localStorage.removeItem("email");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!(StorageService.getAccessToken() || localStorage.getItem("accessToken") || localStorage.getItem("token"));
  },
};

import api from "./api";

export const authService = {
  async login(userData) {
    const response = await api.post("/api/auth/login", userData);
    const { accessToken, user } = response.data;
    console.log("Login Response:", response.data);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  async register(userData) {
    const response = await api.post("/api/auth/signup", userData);
    const { accessToken, user } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  },
};
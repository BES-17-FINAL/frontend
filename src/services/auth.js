import api from "./api";

export const authService = {
  async login(userData) {
    const response = await api.post("/auth/login", userData);
    const { token, nickname, email, user } = response.data;
    console.log("Login Response:", response.data);
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("accessToken", token);
    }
    if (nickname) {
      localStorage.setItem("nickname", nickname);
    }
    if (email) {
      localStorage.setItem("email", email);
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  },

  async register(userData) {
    const response = await api.post("/auth/signup", userData);
    const { accessToken, user } = response.data;

    //localStorage.setItem("accessToken", accessToken);
    //localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  logout() {
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
    return !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));
  },
};
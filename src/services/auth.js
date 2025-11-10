import api from "./api";

export const authService = {
  async login(userData) {
    const response = await api.post("/auth/login", userData);
    const { token, nickname, email } = response.data;
    console.log("Login Response:", response.data);
    localStorage.setItem("token", token);
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("email", email);

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
    localStorage.removeItem("nickname");
    localStorage.removeItem("email");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  },
};
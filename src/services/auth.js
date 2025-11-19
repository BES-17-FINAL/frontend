import api from "./api";
import StorageService from "./storage";

export const authService = {
  async fetchUserWithToken(token) {
    // token으로 유저 정보 가져오기
    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = response.data;
  },
  
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

    StorageService.setAccessToken(token);
    // StorageService.setUser에 넘길 데이터 결정
    const userDataToStore = user || { nickname, email };
    StorageService.setUser(userDataToStore);

    
    return StorageService.getUser();
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
    return StorageService.getUser();
  },

  isAuthenticated() {
    return !!(StorageService.getAccessToken() || localStorage.getItem("accessToken") || localStorage.getItem("token"));
  },
};

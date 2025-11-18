import api from "./api";
import StorageService from "./storage";

export const authService = {
  async fetchUserWithToken(token) {
    // token으로 유저 정보 가져오기
    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = response.data;

    StorageService.setAccessToken(token);
    StorageService.setUser(user);

    return user;
  },

  logout() {
    StorageService.clear();
  },

  getCurrentUser() {
    return StorageService.getUser();
  },

  isAuthenticated() {
    return !!StorageService.getAccessToken();
  },
};

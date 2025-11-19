import api from "./api";
import StorageService from "./storage";

export const authService = {

  // -------------------- LOCAL 회원가입 --------------------
  async register(userData) {
    const response = await api.post("/auth/signup", userData);
    return response.data;  // "회원가입 완료"
  },

  // -------------------- LOCAL 로그인 --------------------
  async login(loginData) {
    const response = await api.post("/auth/login", loginData);

    const { token, nickname, email } = response.data;

    // 토큰 + 유저 저장
    StorageService.setAccessToken(token);
    StorageService.setUser({ nickname, email });

    return {
      token,
      user: { nickname, email }
    };
  },

  // -------------------- OAuth 토큰으로 로그인 --------------------
  async oauthLogin(token) {
    StorageService.setAccessToken(token);

    // 백엔드에서 사용자 조회
    const response = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const user = response.data;
    StorageService.setUser(user);

    return { token, user };
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

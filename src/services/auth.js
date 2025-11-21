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
  try {
    const response = await api.post("/auth/login", loginData);

    // 로그인 성공 시만 토큰 저장
    const { token, nickname, email } = response.data;
    if (!token) throw new Error("로그인 실패");

    StorageService.setAccessToken(token);
    StorageService.setUser({ nickname, email });

    return { token, user: { nickname, email } };
  } catch (err) {
    // 서버가 401 등 에러를 반환하면 StorageService 저장 X
    throw new Error(err.response?.data?.message || "로그인 실패");
  }
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

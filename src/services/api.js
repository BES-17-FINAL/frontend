import axios from "axios";
import StorageService from "./storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
// Community 이미지용 서버 URL (환경변수가 없으면 API_URL과 동일하게 사용)
const IMAGE_API_URL = import.meta.env.VITE_IMAGE_API_URL || API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = StorageService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // FormData를 전송할 때는 Content-Type 헤더를 제거
    // (브라우저가 자동으로 multipart/form-data와 boundary를 설정)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    console.log("Request Config:", config);
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401) {
      StorageService.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// 이미지 URL 처리 함수
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return null;
  }
  
  // 이미 완전한 URL인 경우 (http:// 또는 https://로 시작)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // 상대 경로인 경우 (예: /images/xxx.jpg)
  if (imageUrl.startsWith('/')) {
    return `${IMAGE_API_URL}${imageUrl}`;
  }
  
  // 그 외의 경우
  return `${IMAGE_API_URL}/images/${imageUrl}`;
};

export default api;

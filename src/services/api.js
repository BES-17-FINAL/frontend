import axios from "axios";
import StorageService from "./storage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
    return `${API_URL}${imageUrl}`;
  }
  
  // 그 외의 경우
  return `${API_URL}/images/${imageUrl}`;
};

export default api;
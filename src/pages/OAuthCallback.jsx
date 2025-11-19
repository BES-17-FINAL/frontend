import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { authService } from "../services/auth";
import StorageService from "../services/storage";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    StorageService.setAccessToken(token);
    authService.fetchUserWithToken(token)
      .then((user) => {
        setAuth({
          token,
          user,
          isAuthenticated: true,
          loading: false,
        });

        navigate("/", { replace: true }); // 메인 페이지로 이동
      })
      .catch(() => {
        setAuth({ token: null, user: null, isAuthenticated: false, loading: false });
        StorageService.clear();
        navigate("/login", { replace: true });
      });
  }, [navigate, setAuth]);

  return <div>로그인 처리 중...</div>;
};

export default OAuthCallback;

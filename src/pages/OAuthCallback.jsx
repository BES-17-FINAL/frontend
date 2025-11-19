import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const oauthLogin = useAuthStore((state) => state.oauthLogin);

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      console.error("토큰 없음");
      navigate("/login");
      return;
    }

    // Zustand OAuth 로그인 처리
    oauthLogin(token)
      .then(() => {
        navigate("/"); // 로그인 완료 후 메인으로 이동
      })
      .catch((err) => {
        console.error("OAuth 로그인 중 오류 발생:", err);
        navigate("/login");
      });

  }, [params, oauthLogin, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      OAuth 로그인 처리 중...
    </div>
  );
};

export default OAuthCallback;

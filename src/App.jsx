import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ChangePassword from "./pages/ChangePassword";
import TravelHubHome from "./pages/TravelHubHome";
import Signup from "./pages/signup";
import Login from "./pages/login";
import SpotDetail from "./pages/spotDetail";
import OAuthCallback from "./pages/OAuthCallback";
import Community from "./pages/community";
import AreaBasedListPage from "./pages/area_based_list_page";
import FestivalListPage from "./pages/FestivalListPage";


import useAuthStore from "./store/authStore";

const App = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    console.log("Auth 상태:", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 */}
        <Route path="/" element={<TravelHubHome />} />

        {/* Spot 상세 */}
        <Route path="/spotDetail" element={<SpotDetail />} />

        {/* LOCAL 로그인 / 회원가입 */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />

        {/* OAuth 콜백 */}
        <Route path="/oauth/callback" element={<OAuthCallback />} />

        <Route path="/profile" element={isAuthenticated ?<UserProfile /> : <Navigate to="login" />} />
        {/* 비밀번호 변경*/}
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

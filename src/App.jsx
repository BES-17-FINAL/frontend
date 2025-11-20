import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import TravelHubHome from "./pages/TravelHubHome";
import Signup from "./pages/signup";
import Login from "./pages/login";
import SpotDetail from "./pages/spotDetail";
import OAuthCallback from "./pages/OAuthCallback";
import Community from "./pages/community";
import AreaBasedListPage from "./pages/area_based_list_page";
import { UserProfile } from "./pages/profile"
import FestivalListPage from "./pages/FestivalListPage";
import SearchResults from "./pages/SearchResults";

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
      
        {/* 커뮤니티 */}
        <Route path="/community" element={<Community />} />

        {/* 검색 결과 */}
        <Route path="/search" element={<SearchResults />} />

        {/* 지역 기반 관광 리스트 페이지 */}
        <Route path="/explore" element={<AreaBasedListPage />} />


        {/* 지역 축제 관광 리스트 페이지 */}
        <Route path="/festivals" element={<FestivalListPage />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;

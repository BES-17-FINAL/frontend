import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// 페이지 컴포넌트
import TravelHubHome from "./pages/TravelHubHome";
import Signup from "./pages/signup";
import Login from "./pages/login";
import SearchResults from "./pages/SearchResults";
import SpotDetail from "./pages/spotDetail";
import OAuthCallback from "./pages/OAuthCallback";
import Community from "./pages/community";
import AreaBasedListPage from "./pages/area_based_list_page";
import { UserProfile } from "./pages/profile"
import FestivalListPage from "./pages/FestivalListPage";

// 상태 관리
import useAuthStore from "./store/authStore";

const App = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    console.log("로그인 상태:", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 홈 */}
        <Route path="/" element={<TravelHubHome />} />

        {/* 관광지 상세 페이지로 이동 */}
        <Route path="/spotDetail" element={<SpotDetail />} />

        {/* 로그인 / 회원가입 */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
        />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        

        {/* 커뮤니티 */}
        <Route path="/community" element={<Community />} />

        {/* 검색 결과 */}
        <Route path="/search" element={<SearchResults />} />

        {/* 지역 기반 관광 리스트 페이지 */}
        <Route path="/explore" element={<AreaBasedListPage />} />


        {/* 지역 축제 관광 리스트 페이지 */}
        <Route path="/festivals" element={<FestivalListPage />} />


        {/* 존재하지 않는 경로 처리 */}
        <Route path="*" element={<Navigate to="/" />} />

        <Route path="/profile" element={isAuthenticated ?<UserProfile /> : <Navigate to="login" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

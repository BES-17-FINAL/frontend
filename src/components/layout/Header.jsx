// src/components/layout/Header.jsx
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import useAuthStore from "../../store/authStore";

export default function Header() {
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => logout();

  return (
    <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
      {/* 로고 + 홈 이동 */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-lg"
        >
          TH
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Travel Hub</h1>
          <p className="text-xs text-gray-500">지역별 관광정보 한눈에</p>
        </div>
      </div>

      {/* 로그인 / 회원가입 또는 프로필 / 로그아웃 */}
      {!isAuthenticated ? (
        <nav className="flex items-center gap-3">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:shadow-sm transition"
          >
            <User className="w-4 h-4" />
            로그인
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            회원가입
          </Link>
        </nav>
      ) : (
        <nav className="flex items-center gap-3">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:shadow-sm transition"
          >
            <User className="w-4 h-4" />
            내 프로필
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            로그아웃
          </button>
        </nav>
      )}
    </header>
  );
}

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, User } from 'lucide-react';
import useAuthStore from '../store/authStore';
import SpotList from '../components/spot/spotList';
import useSpotStore from '../store/spotStore';
// Travel Hub - Home screen
// Usage: add this component to your React Router (e.g. path="/")
// TailwindCSS is used for styling. Framer Motion is available if you want to add animations.

export default function TravelHubHome() {
  const { isAuthenticated, logout } = useAuthStore();
  const { getFameSpots } = useSpotStore();
  const [ spots, setSpots ] = React.useState([]);

React.useEffect(() => {
  const fetchSpots = async () => {
    const data = await getFameSpots(); // Promise resolve
    setSpots(data);
  };
  fetchSpots();
}, [getFameSpots]);

  const handleLogout = () => {
    logout(); // Zustand logout 실행 → 토큰/유저 정보 제거
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-gray-900">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-lg">TH</div>
          <div>
            <h1 className="text-lg font-semibold">Travel Hub</h1>
            <p className="text-xs text-gray-500">지역별 관광정보 한눈에</p>
          </div>
        </div>

        {!isAuthenticated ? (<nav className="flex items-center gap-3">
          <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:shadow-sm transition">
            <User className="w-4 h-4" />
            로그인
          </Link>
          <Link to="/signup" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            회원가입
          </Link>
        </nav>) : (
        <nav className="flex items-center gap-3">
          <Link to="/profile" className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:shadow-sm transition">
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

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6">
        <section className="rounded-2xl p-8 bg-white shadow-md md:flex md:items-center md:gap-8">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">가고 싶은 곳, 바로 찾기</h2>
            <p className="text-gray-600 mb-6">지역별 관광지, 추천 루트, 이용 팁까지 — Travel Hub에서 여행 계획을 더 간편하게 세워보세요.</p>

            <div className="flex gap-3">
              <Link to="/explore" className="inline-flex items-center gap-2 px-5 py-3 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition">
                <MapPin className="w-4 h-4" />
                지역 둘러보기
              </Link>

              <Link to="/login" className="inline-flex items-center gap-2 px-5 py-3 border rounded-lg hover:shadow-sm transition">
                로그인하고 저장하기
              </Link>
            </div>

            {/* simple search */}
            <div className="mt-6 w-full max-w-md">
              <label className="sr-only">관광지 검색</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input type="search" placeholder="예: 부산 해운대, 강릉 주문진" className="flex-1 outline-none placeholder-gray-400" />
                <button className="px-3 py-1 bg-indigo-600 text-white rounded-md">검색</button>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 md:w-1/3">
            <div className="rounded-xl bg-gradient-to-tr from-indigo-50 to-sky-50 p-4 h-full flex flex-col justify-center">
              <h3 className="font-semibold">오늘의 추천 지역</h3>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                <li className="p-3 bg-white rounded-lg shadow-sm">서울 — 북촌 한옥마을</li>
                <li className="p-3 bg-white rounded-lg shadow-sm">부산 — 해운대</li>
                <li className="p-3 bg-white rounded-lg shadow-sm">제주 — 성산 일출봉</li>
                <li className="p-3 bg-white rounded-lg shadow-sm">강릉 — 주문진</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Grid: 지역 카드 */}
        <section className="mt-8">
          <h3 className="text-xl font-semibold mb-4">인기 지역 둘러보기</h3>
          <SpotList spotList={spots} />
          <h3 className="text-xl font-semibold mb-4">지역별 탐색</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: '서울', desc: '도심과 전통이 공존하는 곳' },
              { name: '부산', desc: '바다와 먹거리의 도시' },
              { name: '제주', desc: '자연 그대로의 섬' },
              { name: '강원', desc: '산과 해안 드라이브 추천' },
              { name: '경주', desc: '역사 유적 탐방' },
              { name: '전주', desc: '한옥과 전통음식' },
            ].map((region) => (
              <article key={region.name} className="bg-white rounded-xl p-5 shadow hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center font-semibold">{region.name[0]}</div>
                  <div>
                    <h4 className="font-semibold">{region.name}</h4>
                    <p className="text-sm text-gray-500">{region.desc}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link to={`/region/${region.name}`} className="text-sm text-indigo-600">자세히 보기 →</Link>
                  <button className="text-sm px-3 py-1 border rounded">즐겨찾기</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 py-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} Travel Hub — 지역 관광정보 제공</footer>
      </main>
    </div>
  );
}

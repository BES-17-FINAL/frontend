// src/pages/TravelHubHome.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "../components/ui/SearchBar";
import { MapPin } from "lucide-react";
import SpotList from "../components/spot/spotList";
import useSpotStore from "../store/spotStore";
import Header from "../components/layout/Header"; // 새로 분리한 Header 컴포넌트
import FestivalList from "../components/festival/festivalList";
import useFestivalStore from "../store/festivalStore";

export default function TravelHubHome() {
  const navigate = useNavigate();
  const { getFameSpots } = useSpotStore();
  const [spots, setSpots] = useState([]);

  const {
    festivals,
    loading: festivalLoading,
    error: festivalError,
    getOngoingFestivals,
  } = useFestivalStore();

  useEffect(() => {
    const fetchSpots = async () => {
      const data = await getFameSpots();
      setSpots(data);
    };
    fetchSpots();
  }, [getFameSpots]);

  useEffect(() => {
    getOngoingFestivals();
  }, [getOngoingFestivals]);

  // 검색 시 SearchResults 페이지로 이동
  const handleSearch = (keyword) => {
    if (!keyword.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white text-gray-900">
      {/* 공통 Header */}
      <Header />

      {/* Hero + Search */}
      <main className="max-w-6xl mx-auto px-6">
        <section className="rounded-2xl p-8 bg-white shadow-md md:flex md:items-center md:gap-8">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              가고 싶은 곳, 바로 찾기
            </h2>
            <p className="text-gray-600 mb-6">
              지역별 관광지, 추천 루트, 이용 팁까지 — Travel Hub에서 여행 계획을
              더 간편하게 세워보세요.
            </p>

            {/* Hero 버튼들 */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-5 py-3 bg-sky-600 text-white rounded-lg shadow hover:bg-sky-700 transition"
              >
                <MapPin className="w-4 h-4" />
                지역 둘러보기
              </Link>

              {/* 축제 페이지 버튼 추가 */}
              <Link
                to="/festivals"
                className="inline-flex items-center gap-2 px-5 py-3 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition"
              >
                🎉 현재 진행 중인 축제
              </Link>
            </div>

            {/* 검색창 */}
            <div className="w-full max-w-md">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
          <div className="mt-6 md:mt-0 md:w-1/3">
            <p className="font-semibold mb-4">커뮤니티에서 여행 이야기 나누기</p>
            <button
              onClick={() => navigate("/community")}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition mt-5"
            >
              커뮤니티
            </button>
          </div>
          {/* 추천 지역 */}
          {/* <div className="mt-6 md:mt-0 md:w-1/3">
            <div className="rounded-xl bg-gradient-to-tr from-indigo-50 to-sky-50 p-4 h-full flex flex-col justify-center">
              <h3 className="font-semibold">오늘의 추천 지역</h3>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                <li className="p-3 bg-white rounded-lg shadow-sm">
                  서울 — 북촌 한옥마을
                </li>
                <li className="p-3 bg-white rounded-lg shadow-sm">
                  부산 — 해운대
                </li>
                <li className="p-3 bg-white rounded-lg shadow-sm">
                  제주 — 성산 일출봉
                </li>
                <li className="p-3 bg-white rounded-lg shadow-sm">
                  강릉 — 주문진
                </li>
              </ul>
            </div>
          </div> */}
        </section>

        {/* Grid: 인기 지역 */}
        <section className="mt-8">
          <h3 className="text-xl font-semibold mb-4">인기 지역 둘러보기</h3>
          <SpotList spotList={spots} />

          <h3 className="text-xl font-semibold mb-4">진행 중인 축제</h3>
          <FestivalList
            festivals={festivals}
            loading={festivalLoading}
            error={festivalError}
          />

          <h3 className="text-xl font-semibold mb-4">지역별 탐색</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "서울", desc: "도심과 전통이 공존하는 곳", code: "1" },
              { name: "부산", desc: "바다와 먹거리의 도시", code: "6" },
              { name: "제주", desc: "자연 그대로의 섬", code: "39" },
              { name: "강원", desc: "산과 해안 드라이브 추천", code: "32" },
              { name: "경주", desc: "역사 유적 탐방", code: "37" },
              { name: "전주", desc: "한옥과 전통음식", code: "35" },
            ].map((region) => (
              <article
                key={region.name}
                className="bg-white rounded-xl p-5 shadow hover:shadow-md transition"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-sky-100 flex items-center justify-center font-semibold">
                    {region.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold">{region.name}</h4>
                    <p className="text-sm text-gray-500">{region.desc}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    to={`/explore?areaCode=${region.code}`}
                    className="text-sm text-indigo-600"
                  >
                    자세히 보기 →
                  </Link>
                  {/* <button className="text-sm px-3 py-1 border rounded">
                    즐겨찾기
                  </button> */}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 py-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Travel Hub — 지역 관광정보 제공
        </footer>
      </main>
    </div>
  );
}

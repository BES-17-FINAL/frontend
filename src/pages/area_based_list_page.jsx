import React, { useState, useEffect } from "react";
import Header from "../components/layout/Header";

function AreaBasedListPage() {
  const [places, setPlaces] = useState([]);
  const [areaCode, setAreaCode] = useState("1"); // 기본 지역: 서울
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 지역 코드에 따라 관광지 검색
  const fetchPlaces = async (selectedArea) => {
    setLoading(true);
    setError(null);
    try {
      // 기본 콘텐츠 타입은 관광지(12)로 고정
      const res = await fetch(
        `http://localhost:8080/api/area-based?areaCode=${selectedArea}&contentTypeId=12&numOfRows=12&pageNo=1`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const items = json?.response?.body?.items?.item || [];
      setPlaces(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 시 기본 지역 서울 관광지 가져오기
  useEffect(() => {
    fetchPlaces(areaCode);
  }, [areaCode]);

  return (
    <div className="bg-sky-200 min-h-screen font-sans">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold mb-6">✈️ 지역 기반 관광 정보</h1>

        {/* 지역 선택 */}
        <div className="bg-sky-100 flex items-center gap-4 mb-6 p-4 rounded-xl">
          <label className="font-semibold">
            지역:
            <select
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
              className="ml-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="1">서울</option>
              <option value="2">인천</option>
              <option value="3">대전</option>
              <option value="4">대구</option>
              <option value="5">광주</option>
              <option value="6">부산</option>
              <option value="7">울산</option>
              <option value="8">세종</option>
              <option value="31">경기</option>
              <option value="32">강원</option>
              <option value="33">충북</option>
              <option value="34">충남</option>
              <option value="35">전북</option>
              <option value="36">전남</option>
              <option value="37">경북</option>
              <option value="38">경남</option>
              <option value="39">제주</option>
            </select>
          </label>
        </div>

        {/* 로딩 / 오류 표시 */}
        {loading && <p className="text-gray-500">⏳ 불러오는 중...</p>}
        {error && <p className="text-red-500">⚠️ 오류: {error}</p>}

        {/* 관광지 리스트 */}
        {!loading && !error && places.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {places.map((item) => (
              <div
                key={item.contentid}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition"
              >
                {item.firstimage ? (
                  <img
                    src={item.firstimage}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    이미지 없음
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-2">{item.title}</h2>
                  <p className="text-gray-600">{item.addr1 || "주소 정보 없음"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && !error && places.length === 0 && (
          <p className="text-gray-500 mt-6">결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default AreaBasedListPage;

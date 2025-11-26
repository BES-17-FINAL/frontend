import React, { useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/layout/Header";

function AreaBasedListPage() {

    // {지역} 자세히보기 초기값 설정
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialArea = params.get("areaCode") || "1";

  
  const [places, setPlaces] = useState([]);
  const [areaCode, setAreaCode] = useState(initialArea);
  const [contentTypeId, setContentTypeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(1); // ⭐ 페이지 상태 추가
  const [totalCount, setTotalCount] = useState(0);


  
  // API 호출 함수
  const fetchPlaces = async (area, contentType, page) => {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams({
        areaCode: area,
        numOfRows: 12,
        pageNo: page,
      });

      if (contentType) query.append("contentTypeId", contentType);

      const url = `http://localhost:8080/api/area-based?${query.toString()}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const json = await res.json();
      const body = json?.response?.body;

      setPlaces(body?.items?.item || []);
      setTotalCount(body?.totalCount || 0); // ⭐ 전체 개수 저장

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 지역, 콘텐츠, 페이지 변할 때마다 자동 호출
  useEffect(() => {
    fetchPlaces(areaCode, contentTypeId, pageNo);
  }, [areaCode, contentTypeId, pageNo]);

  // 전체 페이지 수
  const totalPages = Math.ceil(totalCount / 12);

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-sky-200 to-blue-100">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold mb-6">✈️ 지역 기반 관광 정보</h1>

        {/* 필터 박스 */}
        <div className="bg-white p-4 mb-6 rounded-xl shadow flex flex-col sm:flex-row items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="font-semibold">지역:</label>
            <select
              value={areaCode}
              onChange={(e) => {
                setAreaCode(e.target.value);
                setPageNo(1); // 지역 바꾸면 첫 페이지로
              }}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
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
          </div>

          {/* 콘텐츠 타입 */}
          <div className="flex items-center gap-2">
            <label className="font-semibold text-gray-700">콘텐츠:</label>
            <select
              value={contentTypeId}
              onChange={(e) => {
                setContentTypeId(e.target.value);
                setPageNo(1);
              }}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            >
              <option value="">전체 🌐</option>
              <option value="12">관광지 ✈️</option>
              <option value="14">문화시설 🎭</option>
              <option value="15">축제/행사 🎉</option>
              <option value="25">여행코스 🗺️</option>
              <option value="28">레포츠 🏄‍♂️</option>
              <option value="32">숙박 🛏️</option>
              <option value="38">쇼핑 🛍️</option>
              <option value="39">음식점 🍽️</option>
            </select>
          </div>
        </div>

        {/* 로딩 / 오류 */}
        {loading && <p className="text-gray-500">⏳ 불러오는 중...</p>}
        {error && <p className="text-red-500">⚠ 오류: {error}</p>}

        {/* 관광지 리스트 */}
        {!loading && !error && places.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {places.map((item) => (
              <div
                key={item.contentid}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative">
                  {item.firstimage ? (
                    <img
                      src={item.firstimage}
                      alt={item.title}
                      className="w-full h-52 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <img
                      src={"uploads/images/free-icon-picture-14534501.png"}
                      alt={item.title}
                      className="h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3">
                    <h2 className="text-white text-lg font-bold">{item.title}</h2>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600">{item.addr1 || "주소 정보 없음"}</p>
                </div>
              </div>
            ))}
          </div>


            {/* 페이지 네비게이션 */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                disabled={pageNo === 1}
                onClick={() => setPageNo(pageNo - 1)}
                className={`px-4 py-2 rounded-md ${
                  pageNo === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                이전
              </button>

              <span className="font-semibold">
                {pageNo} / {totalPages}
              </span>

              <button
                disabled={pageNo >= totalPages}
                onClick={() => setPageNo(pageNo + 1)}
                className={`px-4 py-2 rounded-md ${
                  pageNo >= totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                다음
              </button>
            </div>
          </>
        )}

        {!loading && !error && places.length === 0 && (
          <p className="text-gray-500 mt-6">검색된 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default AreaBasedListPage;

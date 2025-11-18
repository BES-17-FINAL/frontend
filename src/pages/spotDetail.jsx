import React, { useEffect, useState } from "react";
import { Star, MapPin, Phone, Globe } from "lucide-react";
import { useParams, useLocation, Link } from "react-router-dom";

const SpotDetail = () => {
  const { id: contentIdParam } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contentTypeIdParam = queryParams.get("contentTypeId");

  const [spot, setSpot] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpot = async () => {
      const contentId = Number(contentIdParam);
      const contentTypeId = Number(contentTypeIdParam);

      if (!contentId || !contentTypeId) {
        setError("잘못된 관광지 정보입니다.");
        setLoading(false);
        return;
      }

      try {
        const url = `http://localhost:8080/api/search/${contentId}?contentTypeId=${contentTypeId}`;

        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.status === 401 || res.status === 302) {
          throw new Error("인증이 필요하거나 요청이 리다이렉트되었습니다.");
        }

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        // 💡 SpotResponse DTO 그대로 사용
        const data = await res.json();
        console.log("🔥 SpotResponse:", data);

        setSpot(data);
      } catch (err) {
        console.error("관광지 상세 조회 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpot();
  }, [contentIdParam, contentTypeIdParam]);

  if (loading) return <p className="text-center mt-12">⏳ 로딩 중...</p>;
  if (error) return <p className="text-center mt-12 text-red-500">{error}</p>;
  if (!spot) return <p className="text-center mt-12 text-red-500">데이터를 가져올 수 없습니다.</p>;

  return (
    <div className="bg-white min-h-screen">
      {/* 헤더 */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-lg">TH</div>
        <div>
          <h1 className="text-lg font-semibold">Travel Hub</h1>
          <p className="text-xs text-gray-500">지역별 관광정보 한눈에</p>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <h2 className="text-[36px] text-black mb-6">{spot.title}</h2>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 h-[400px] rounded-lg overflow-hidden shadow-md">
            {spot.firstImage ? (
              <img src={spot.firstImage} alt={spot.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">이미지 없음</div>
            )}
          </div>

          <div className="border-2 border-[#dedede] rounded-lg p-6 flex flex-col justify-between">
            <h3 className="text-[18px] text-black mb-4">관광지 정보</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">{spot.address ? "위치" : "위치 정보 없음"}</p>
                  <p className="text-[16px] text-black">{spot.address || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">{spot.tel ? "전화 번호" : "전화번호 정보 없음"}</p>
                  <p className="text-[16px] text-black">{spot.tel || "-"}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 min-w-0">
                <Globe className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] text-[#666] mb-1">{spot.homepage ? "웹사이트" : "웹사이트 정보 없음"}</p>
                  {spot.homepage ? (
                    <a href={spot.homepage} target="_blank" rel="noopener noreferrer" className="text-[16px] text-[#4442dd] break-all underline hover:text-blue-700 block">{spot.homepage}</a>
                  ) : (
                    <p className="text-[16px] text-gray-500">홈페이지 정보 없음</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-[#4442dd] pl-6 py-2 mb-8">
          <h3 className="text-[20px] text-black mb-3">개요</h3>
          <p className="text-[16px] text-[#333] leading-relaxed">{spot.description}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[24px] text-black">리뷰</h2>
            <button className="px-6 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors">
              리뷰 작성
            </button>
          </div>
          <div className="space-y-4">
            {[
              { name: "김철수", date: "2025.11.03", rating: 5, content: "정말 멋진 곳이었어요!..." },
              { name: "이영희", date: "2025.11.01", rating: 4, content: "경치가 아름답고..." },
              { name: "박민수", date: "2025.10.28", rating: 5, content: "친구들에게 추천..." }
            ].map((review, index) => (
              <div key={index} className="bg-[#f5f5f5] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#dedede] flex items-center justify-center">
                      <span className="text-[#666] text-[18px]">{review.name[0]}</span>
                    </div>
                    <div>
                      <p className="text-[16px] text-black">{review.name}</p>
                      <p className="text-[14px] text-[#666]">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[16px] text-[#333] leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Link to="/search" className="text-indigo-600 hover:underline">
            ← 검색 결과로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SpotDetail;

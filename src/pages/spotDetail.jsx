import React, { useEffect, useState } from "react";
import useSpotStore from "../store/spotStore";
import { Star, MapPin, Clock, Phone, Globe } from "lucide-react";
import { useLocation } from "react-router-dom";
import spotService from "../services/spot";
import axios from "axios";

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

const SpotDetail = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const spotId = queryParams.get("spotId");

  const [spot, setSpot] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [lodgings, setLodgings] = useState([]);

  useEffect(() => {
    if (!spotId) return;

    const fetchSpot = async () => {
      try {
        const res = await spotService.getSpot(spotId);
        setSpot(res.data);

        // 리뷰 가져오기
        const reviewRes = await axios.get(`/api/spots/${spotId}/reviews`);
        setReviews(reviewRes.data);

        // 주변 숙박업소 가져오기 (카카오맵 키워드 검색)
        const kakaoRes = await axios.get(
          `https://dapi.kakao.com/v2/local/search/keyword.json`,
          {
            params: { query: "숙박", x: res.data.longitude, y: res.data.latitude, radius: 2000 },
            headers: { Authorization: `KakaoAK ${KAKAO_MAP_KEY}` },
          }
        );
        setLodgings(kakaoRes.data.documents);
      } catch (err) {
        console.error(err);
      }
    };

    fetchSpot();
  }, [spotId]);

  if (!spot) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* 관광지 정보 */}
        <h2 className="text-3xl font-bold mb-3">{spot.title}</h2>
        <div className="flex items-center gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-6 h-6 ${
                i < spot.receive
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-300 text-gray-300"
              }`}
            />
          ))}
          <span className="text-black text-[20px] ml-1">{spot.receive}</span>
          <span className="text-[#666] ml-2">({reviews.length}개의 리뷰)</span>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 h-[400px] rounded-lg overflow-hidden shadow-md">
            <img
              src={spot.firstImage}
              alt={spot.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="border-2 border-[#dedede] rounded-lg p-6 flex flex-col justify-between">
            <h3 className="text-[18px] text-black mb-4">관광지 정보</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">위치</p>
                  <p className="text-[16px] text-black">{spot.address || "정보 없음"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">운영시간</p>
                  <p className="text-[16px] text-black">{spot.tel || "정보 없음"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">전화번호</p>
                  <p className="text-[16px] text-black">{spot.tel || "정보 없음"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">웹사이트</p>
                  {spot.homepage ? (
                    <a
                      href={spot.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[16px] text-[#4442dd] underline hover:text-blue-700 block"
                    >
                      {spot.homepage}
                    </a>
                  ) : (
                    <p className="text-[16px] text-gray-500">정보 없음</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 개요 */}
        <div className="border-l-4 border-[#4442dd] pl-6 py-2 mb-12">
          <h3 className="text-[20px] text-black mb-3">개요</h3>
          <p className="text-[16px] text-[#333] leading-relaxed">{spot.description}</p>
        </div>

        {/* 리뷰 */}
        <div className="mb-12">
          <h2 className="text-[24px] font-bold mb-4">리뷰</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-500">아직 리뷰가 없습니다.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-[#f5f5f5] rounded-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold">{review.nickname}</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-300 text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* 주변 숙박업소 */}
        <div>
          <h2 className="text-[24px] font-bold mb-4">주변 숙박업소</h2>
          <div className="grid grid-cols-3 gap-4">
            {lodgings.length === 0 ? (
              <p className="text-gray-500 col-span-3">주변 숙박업소가 없습니다.</p>
            ) : (
              lodgings.map((lodge) => (
                <div key={lodge.id} className="border rounded-lg p-4">
                  <p className="font-semibold">{lodge.place_name}</p>
                  <p className="text-gray-600">{lodge.address_name}</p>
                  <a
                    href={lodge.place_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    지도 보기
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotDetail;

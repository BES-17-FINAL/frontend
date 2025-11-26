import React, { useEffect, useState, useRef } from "react";
import { Star, MapPin, Clock, Phone, Globe } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useSpotStore from "../store/spotStore";
import useReviewStore from "../store/reviewStore";
import useAuthStore from "../store/authStore";
import axios from "axios";
import Header from "../components/layout/Header";

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

const SpotDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const spotId = queryParams.get("spotId");

  const { getSpot } = useSpotStore();
  const { isAuthenticated } = useAuthStore();
  const { getReviews, getAverageRating, addReview } = useReviewStore();

  const [spot, setSpot] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isReview, setIsReview] = useState(false);
  const [lodgings, setLodgings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const mapRef = useRef(null);
  // 날짜 포맷
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Spot, 리뷰, 주변 숙박업소 한번에 fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!spotId) return;

        const spotData = await getSpot(spotId);
        {
          /* 더미 데이터
      
        if (!spotData) {
          const dummySpot = {
            id: 999,
            title: "테스트 관광지 (더미)",
            address: "서울특별시 중구 세종대로 110",
            tel: "02-123-4567",
            homepage: "https://example.com",
            firstImage: "https://via.placeholder.com/800x400",
            // 한국 관광공사 API 좌표 기준: mapx = 경도(lng), mapy = 위도(lat)
            mapx: 126.9783882, // 서울 시청 근처 경도
            mapy: 37.5666103, // 서울 시청 근처 위도
          };
          setSpot(dummySpot);
          return;
        }
        */
        }

        setSpot(spotData);

        const ratingData = await getAverageRating(spotId);
        setRating(ratingData);

        const reviewsData = await getReviews(spotId);
        setReviews(reviewsData);

        const kakaoRes = await axios.get(
          `https://dapi.kakao.com/v2/local/search/keyword.json`,
          {
            params: {
              query: "숙박",
              x: spotData.longitude,
              y: spotData.latitude,
              radius: 2000,
            },
            headers: { Authorization: `KakaoAK ${KAKAO_MAP_KEY}` },
          }
        );
        setLodgings(kakaoRes.data.documents);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [spotId, getSpot, getAverageRating, getReviews]);

  useEffect(() => {
    if (!spot) {
      return;
    }
    if (!mapRef.current) {
      return;
    }

    const loadKakaoMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        return;
      }

      const lat = Number(spot.mapy ?? 37.5666103);
      const lng = Number(spot.mapx ?? 126.9783882);

      const center = new window.kakao.maps.LatLng(lat, lng);

      const options = {
        center,
        level: 3,
      };

      const map = new window.kakao.maps.Map(mapRef.current, options);

      new window.kakao.maps.Marker({
        position: center,
        map,
      });
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(loadKakaoMap);
    } else {
      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(loadKakaoMap);
      };
      script.onerror = () => {
        console.error("kakao 스크립트 로드 실패");
      };
      document.head.appendChild(script);
    }
  }, [spot]);

  const handleBack = () => navigate(-1);

  const handleCommentChange = (e) => setComment(e.target.value);

  const handleReviewSubmit = async () => {
    if (!userRating || !comment) return;
    await addReview(spotId, { rating: userRating, comment });
    const updatedReviews = await getReviews(spotId);
    setReviews(updatedReviews);
    const updatedRating = await getAverageRating(spotId);
    setRating(updatedRating);
    setIsReview(false);
    setUserRating(0);
    setComment("");
  };

  const handleIsAuth = (isReview) => {
    if (!isAuthenticated) {
      const result = confirm(
        "로그인이 필요한 기능입니다. 로그인 하시겠습니까?"
      );
      if (result) {
        navigate("/login");
      }
    } else {
      setIsReview(!isReview);
    }
  };

  if (!spot) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <button
          onClick={handleBack}
          className="mb-6 px-6 py-2 border-2 border-[#dedede] text-black hover:border-[#4442dd] rounded-lg transition-colors"
        >
          ← 뒤로가기
        </button>
        {/* Spot Title & Rating */}
        <div className="mb-12">
          <h2 className="text-[36px] text-black mb-3">{spot.title}</h2>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i <= rating - 1 ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"
                }`}
              />
            ))}
            <span className="text-black text-[20px] ml-1">{rating}</span>
            <span className="text-[#666] ml-2">
              ({reviews.length}개의 리뷰)
            </span>
          </div>
        </div>

        {/* Spot Image & Info */}
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
            <div
              ref={mapRef}
              className="w-full h-40 mb-4 rounded-lg border border-[#dedede]"
            />
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">
                    {!spot.address ? "위치 정보 없음" : "위치"}
                  </p>
                  <p className="text-[16px] text-black">{spot.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">
                    {!spot.tel ? "운영시간 정보 없음" : "운영시간"}
                  </p>
                  <p className="text-[16px] text-black">{spot.tel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">
                    {!spot.tel ? "전화번호 정보 없음" : "전화 번호"}
                  </p>
                  <p className="text-[16px] text-black">{spot.tel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 min-w-0">
                <Globe className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] text-[#666] mb-1">
                    {!spot.homepage ? "웹사이트 정보 없음" : "웹사이트"}
                  </p>
                  {spot.homepage ? (
                    <a
                      href={spot.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[16px] text-[#4442dd] break-all underline hover:text-blue-700 block"
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

        {/* 리뷰 작성 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[24px] text-black">리뷰</h3>
            <button
              className="px-6 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
              onClick={() => handleIsAuth(isReview)}
            >
              리뷰 작성
            </button>
          </div>

          {isReview && (
            <div className="mb-6 bg-[#f5f5f5] rounded-lg p-4">
              <label className="block text-[16px] text-black mb-3">
                별점 *
              </label>
              <div className="flex items-center gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= (hoverRating || userRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-300 text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[20px] text-black ml-2">
                  {userRating > 0 ? `${userRating}.0` : ""}
                </span>
              </div>
              <textarea
                value={comment}
                onChange={handleCommentChange}
                placeholder="리뷰를 입력하세요..."
                className="w-full p-3 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none mb-2"
                rows={3}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleReviewSubmit}
                  className="px-6 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
                >
                  리뷰 작성
                </button>
              </div>
            </div>
          )}

          {/* 리뷰 리스트 */}
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg font-semibold">
                      {review.nickname?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-[16px] text-black font-medium">
                        {review.nickname}
                      </p>
                      <p className="text-[13px] text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
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
                <p className="text-[16px] text-[#333] leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 주변 숙박업소 */}
        <div>
          <h2 className="text-[24px] font-bold mb-4">주변 숙박업소</h2>
          <div className="grid grid-cols-3 gap-4">
            {lodgings.length === 0 ? (
              <p className="text-gray-500 col-span-3">
                주변 숙박업소가 없습니다.
              </p>
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

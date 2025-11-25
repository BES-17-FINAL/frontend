import React, { useEffect, useState } from "react";
import { Star, MapPin, Clock, Phone, Globe, Calendar, Check } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useSpotStore from "../store/spotStore";
import useReviewStore from "../store/reviewStore";
import useAuthStore from "../store/authStore";
import axios from "axios";
import Header from "../components/layout/Header";
import ScheduleModal from "../components/schedule/ScheduleModal";
import { scheduleService } from "../services/scheduleService";

const KAKAO_MAP_KEY = "cdd6c348c25b16f772f3e0e0db82d7d9";

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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);

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
        setSpot(spotData);

        const ratingData = await getAverageRating(spotId);
        setRating(ratingData);

        const reviewsData = await getReviews(spotId);
        setReviews(reviewsData);

        if (KAKAO_MAP_KEY) {
          try {
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
          } catch (kakaoError) {
            console.error("Kakao API Error:", kakaoError);
          }
        }

        // Check if already scheduled - only when authenticated
        if (isAuthenticated) {
          checkIfScheduled(spotId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [spotId, getSpot, getAverageRating, getReviews, isAuthenticated]);

  const checkIfScheduled = async (id) => {
    try {
      const schedules = await scheduleService.getSchedules();
      const exists = schedules.some(s => s.spotId === Number(id));
      setIsScheduled(exists);
    } catch (error) {
      console.error("Failed to check schedule status", error);
      // If 401 or any error, just set as not scheduled
      setIsScheduled(false);
    }
  };

  const handleAddSchedule = async (modalData) => {
    try {
      // API expects YYYY-MM-DD format
      const formatDateForApi = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const scheduleData = {
        spotId: Number(spotId),
        spotTitle: spot.title, // Pass title explicitly
        startDate: formatDateForApi(modalData.startDate),
        endDate: formatDateForApi(modalData.endDate),
        description: modalData.description,
        startTime: "09:00:00",
        endTime: "18:00:00"
      };

      await scheduleService.createSchedule(scheduleData);
      setIsScheduled(true);
      alert("일정이 등록되었습니다.");
    } catch (error) {
      console.error("Failed to add schedule", error);
      alert("일정 등록에 실패했습니다.");
    }
  };

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
      const result = confirm("로그인이 필요한 기능입니다. 로그인 하시겠습니까?");
      if (result) {
        navigate("/login");
      }
    } else {
      setIsReview(!isReview)
    }
  }

  if (!spot) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="bg-white min-h-screen">
      <Header />
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Spot Title & Rating */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <h2 className="text-[36px] text-black mb-3">{spot.title}</h2>

            {/* Schedule Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  if (window.confirm("로그인이 필요한 기능입니다. 로그인 하시겠습니까?")) {
                    navigate("/login");
                  }
                  return;
                }
                if (!isScheduled) {
                  setIsScheduleModalOpen(true);
                }
              }}
              disabled={isScheduled}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${isScheduled
                ? "bg-green-100 text-green-700 cursor-default"
                : "bg-[#4442dd] text-white hover:bg-[#3331cc]"
                }`}
            >
              {isScheduled ? (
                <>
                  <Check className="w-5 h-5" />
                  등록된 일정
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  일정 등록
                </>
              )}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"
                  }`}
              />
            ))}
            <span className="text-black text-[20px] ml-1">{rating}</span>
            <span className="text-[#666] ml-2">({reviews.length}개의 리뷰)</span>
          </div>
        </div>

        {/* Spot Image & Info */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 h-[400px] rounded-lg overflow-hidden shadow-md">
            <img src={spot.firstImage} alt={spot.title} className="w-full h-full object-cover" />
          </div>

          <div className="border-2 border-[#dedede] rounded-lg p-6 flex flex-col justify-between">
            <h3 className="text-[18px] text-black mb-4">관광지 정보</h3>
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
              <label className="block text-[16px] text-black mb-3">별점 *</label>
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
                      className={`w-10 h-10 ${star <= (hoverRating || userRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                        }`}
                    />
                  </button>
                ))}
                <span className="text-[20px] text-black ml-2">{userRating > 0 ? `${userRating}.0` : ""}</span>
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
            {reviews.map((review) => (
              <div key={review.id} className="bg-white border-2 border-[#dedede] rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black">{review.nickname}</span>
                    <span className="text-sm text-[#666]">{formatDate(review.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[#333]">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 주변 숙박 정보 */}
        <div className="mb-12">
          <h3 className="text-[24px] text-black mb-6">주변 숙박 정보</h3>
          <div className="grid grid-cols-3 gap-6">
            {lodgings.map((lodging, index) => (
              <div key={index} className="bg-white border-2 border-[#dedede] rounded-lg overflow-hidden hover:border-[#4442dd] transition-colors">
                <div className="p-4">
                  <h4 className="text-[18px] font-bold text-black mb-2 truncate">{lodging.place_name}</h4>
                  <p className="text-[14px] text-[#666] mb-2 truncate">{lodging.road_address_name || lodging.address_name}</p>
                  <p className="text-[14px] text-[#4442dd]">{lodging.phone || "전화번호 없음"}</p>
                  <a
                    href={lodging.place_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block text-center px-4 py-2 bg-[#f5f5f5] text-[#333] rounded hover:bg-[#e0e0e0] transition-colors text-sm"
                  >
                    상세보기
                  </a>
                </div>
              </div>
            ))}
          </div>
          {lodgings.length === 0 && (
            <p className="text-center text-[#666] py-8">주변 숙박 정보가 없습니다.</p>
          )}
        </div>
      </div>

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSubmit={handleAddSchedule}
        spotTitle={spot.title}
      />
    </div>
  );
};

export default SpotDetail;

import React, { useEffect, useState } from "react";
import { Star, MapPin, Clock, Phone, Globe } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useSpotStore from "../store/spotStore";
import useReviewStore from "../store/reviewStore";
import spotService from "../services/spot";
import axios from "axios";
import { ReviewWriteModal } from "../components/review/ReviewWriteModal";
import Header from "../components/layout/Header";

const SpotDetail = () => { // 임시값 추가
    const { getSpot, loading, error } = useSpotStore();
    const { addReview, getReviews, getAverageRating} = useReviewStore();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [spot, setSpot] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [AverageRating, setAverageRating] = useState(0);
    const [comment, setComment] = useState("")

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const spotId = queryParams.get("spotId");

    useEffect(() => {
      const fetchSpot = async () => {
        const data = await getSpot(spotId);
        const review = await getReviews(spotId);
        const rating = await getAverageRating(spotId);
        setReviews(review)
        setAverageRating(rating);
        setSpot(data);
        
      };
      fetchSpot();
    }, [getSpot, getReviews, getAverageRating]);


    const reviewCreate = async() => {
      await addReview(spotId, {
        rating,
        comment
      })
      const review = await getReviews(spotId);
        setReviews(review)
    }

    const formatDate = (isoString) => {
      const date = new Date(isoString);
      return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
  
  const handleBack = () => {
    navigate(-1); // 브라우저 히스토리에서 한 단계 뒤로
  };

const KAKAO_MAP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY;

const SpotDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const spotId = queryParams.get("spotId");

  const { getSpot } = useSpotStore();
  const { getAverageRating, getReviews, addReview } = useReviewStore();

  const [spot, setSpot] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [isReview, setIsReview] = useState(false);
  const [lodgings, setLodgings] = useState([]);

  // Spot, rating, reviews, lodgings 한 번에 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 관광지 데이터
        const spotData = await getSpot(spotId);
        setSpot(spotData);

        // 리뷰 및 평균 평점
        const ratingData = await getAverageRating(spotId);
        setRating(ratingData);

        const reviewsData = await getReviews(spotId);
        setReviews(reviewsData);

        // 주변 숙박업소
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

    if (spotId) fetchData();
  }, [spotId, getSpot, getAverageRating, getReviews]);

  const handleBack = () => navigate(-1);

  const handleSubmit = async (data) => {
    await addReview(spotId, data);
    setIsReview(false);
    window.location.reload();
  };

  if (!spot) return <p className="text-center mt-10">Loading...</p>;

    const handleComment = (e) => {
      setComment(e.target.value);
    }
  return (
    <div className="bg-white min-h-screen">
      <Header />
    
      <div className="max-w-[1200px] mx-auto px-8 py-12">
        {/* Spot Title & Rating */}
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-[36px] text-black mb-3">{spot.title}</h2>
            <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-6 h-6 ${
                          i < AverageRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
                        }`} />
              ))}
              <span className="text-black text-[20px] ml-1">{spot.receive}</span>
              <span className="text-[#666] ml-2">({spot?.receive?.length || 0}개의 리뷰)</span>
            </div>
          </div>
        </div>

        {/* Spot Image & Info */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 h-[400px] rounded-lg overflow-hidden shadow-md">
            <img src={spot?.firstImage} alt={spot?.title} className="w-full h-full object-cover" />
          </div>

          <div className="border-2 border-[#dedede] rounded-lg p-6 flex flex-col justify-between">
            <h3 className="text-[18px] text-black mb-4">관광지 정보</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">
                    {!spot?.address ? "위치 정보 없음" : "위치"}
                  </p>
                  <p className="text-[16px] text-black">{spot?.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">
                    {!spot?.tel ? "운영시간 정보 없음" : "운영시간"}
                  </p>
                  <p className="text-[16px] text-black">{spot?.tel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[14px] text-[#666] mb-1">
                    {!spot?.tel ? "전화번호 정보 없음" : "전화 번호"}
                  </p>
                  <p className="text-[16px] text-black">{spot?.tel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 min-w-0">
                <Globe className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] text-[#666] mb-1">
                    {!spot?.homepage ? "웹사이트 정보 없음" : "웹사이트"}
                  </p>
                  {spot?.homepage ? (
                    <a
                      href={spot?.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[16px] text-[#4442dd] break-all underline hover:text-blue-700 block"
                    >
                      {spot?.homepage}
                    </a>
                  ) : (
                    <p className="text-[16px] text-gray-500">정보 없음</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        <div>
            <div className="flex flex-col mb-6">
                <h2 className="text-[24px] text-black">리뷰</h2>

                <div>
            <label className="block text-[16px] text-black mb-3">
              별점 <span className="text-[#ff6b6b]">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-300 text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-[20px] text-black ml-2">
                {rating > 0 ? `${rating}.0` : ''}
              </span>
            </div>
          </div>
                <div className="mb-6 bg-[#f5f5f5] rounded-lg p-4">
                  <textarea
                    placeholder="리뷰를 입력하세요..."
                    className="w-full p-3 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none"
                    onChange={handleComment}
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button className="px-6 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
                      onClick={() =>{reviewCreate()}}
                    >
                      리뷰 작성
                    </button>
                  </div>
                </div>
            </div>
             <div className="space-y-4">
              {reviews?.map((review, index) => (
                <div 
                  key={index} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  {/* 사용자 정보 + 별점 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg font-semibold">
                        {review?.nickname?.[0] || "?"}
                      </div>
                      <div>
                        <p className="text-[16px] text-black font-medium">{review?.nickname}</p>
                        <p className="text-[13px] text-gray-500">{formatDate(review?.createdAt)}</p>
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
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[16px] text-[#333] leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
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

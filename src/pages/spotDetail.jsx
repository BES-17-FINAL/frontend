import React, { useEffect, useState } from "react";
import useSpotStore from "../store/spotStore";
import { Star, MapPin, Clock, Phone, Globe } from 'lucide-react';
import { useLocation, useNavigate } from "react-router-dom";
import useReviewStore from "../store/reviewStore";
import { ReviewWriteModal } from "../components/review/ReviewWriteModal";
const SpotDetail = () => { // 임시값 추가
    const { getSpot, loading, error } = useSpotStore();
    const { getAverageRating, getReviews, addReview} = useReviewStore();

    const [spot, setSpot] = useState([]);
    const [rating, setRating] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [isReview, setIsReview] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const spotId = queryParams.get("spotId");

    useEffect(() => {
      const fetchSpot = async () => {
        console.log("spotId: ", spotId);
        const data = await getSpot(spotId);
        setSpot(data);
      };
      fetchSpot();
    }, [getSpot]);

     useEffect(() => {
      const fetchSpot = async () => {
        const rating = await getAverageRating(spotId);
        setRating(rating);
      };
      fetchSpot();
    }, [getAverageRating]);

    useEffect(() => {
      const fetchSpot = async () => {
        const reviews = await getReviews(spotId);
        setReviews(reviews);
      };
      fetchSpot();
    }, [getReviews]);


  const handleBack = () => {
    navigate(-1); // 브라우저 히스토리에서 한 단계 뒤로
  };

  const handleSubmit = async ( data ) =>  {
    console.log(data)
    await addReview(spotId, data);
    setIsReview(false);
    window.location.reload();
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-lg">TH</div>
          <div>
            <h1 className="text-lg font-semibold">Travel Hub</h1>
            <p className="text-xs text-gray-500">지역별 관광정보 한눈에</p>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="mb-6 px-6 py-2 border-2 border-[#dedede] text-black hover:border-[#4442dd] rounded-lg transition-colors bg-blue-500 text-white"
          >
            뒤로가기
          </button>
        </nav>
      </header>

      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-[36px] text-black mb-3">{spot?.title}</h2>
            <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-6 h-6 ${
                          i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
                        }`} />
              ))}
              <span className="text-black text-[20px] ml-1">{rating}</span>
              <span className="text-[#666] ml-2">({reviews.length}개의 리뷰)</span>
            </div>
          </div>
        </div>
         <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 h-[400px] rounded-lg overflow-hidden shadow-md">
                <img
                    src={spot?.firstImage}
                    alt="Spot Image"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="border-2 border-[#dedede] rounded-lg p-6 flex flex-col justify-between">
                <h3 className="text-[18px] text-black mb-4">관광지 정보</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-[14px] text-[#666] mb-1">{!spot?.address ? "위치 정보 없음" : "위치"}</p>
                            <p className="text-[16px] text-black">{spot?.address}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] text-[#666] mb-1">{!spot?.tel ? "운영시간 정보 없음" : "운영시간"}</p>
                    <p className="text-[16px] text-black">{spot?.tel}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] text-[#666] mb-1">{!spot?.tel ? "전화번호 정보 없음" : "전화 번호"}</p>
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
                        <p className="text-[16px] text-gray-500">홈페이지 정보 없음</p>
                      )}
                    </div>
                  </div>
                </div>
            </div>
            <div className="border-l-4 border-[#4442dd] pl-6 py-2">
                <h3 className="text-[20px] text-black mb-3">개요</h3>
                <p className="text-[16px] text-[#333] leading-relaxed">
                  {spot?.description}
                </p>
          </div>
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[24px] text-black">리뷰</h2>
                    <button
                      className="px-6 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
                      onClick={() => setIsReview(true)}
                    >
                    리뷰 작성
                    </button>
            </div>
             <div className="space-y-4">
            {isReview && <ReviewWriteModal onClose={() => setIsReview(false)} onSubmit={handleSubmit}/>}
            {reviews.map((review, index) => (
              <div key={index} className="bg-[#f5f5f5] rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#dedede] flex items-center justify-center">
                      <span className="text-[#666] text-[18px]">{review.nickname[0]}</span>
                    </div>
                    <div>
                      <p className="text-[16px] text-black">{review.nickname}</p>
                      <p className="text-[14px] text-[#666]">{review.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
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
      </div>
    </div>
  );
};

export default SpotDetail;
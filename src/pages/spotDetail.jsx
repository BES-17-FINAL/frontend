import React, { useEffect, useState } from "react";
import useSpotStore from "../store/spotStore";
import { Star, MapPin, Clock, Phone, Globe } from 'lucide-react';

const SpotDetail = () => {
    const { getSpot, loading, error } = useSpotStore();
    const [spot, setSpot] = useState([]);

    useEffect(() => {
        setSpot(getSpot(1));
    }, []);

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

        </nav>
      </header>

      <div className="max-w-[1200px] mx-auto px-8 py-12">
        <div className="mb-12">
          <div className="mb-6">
            <h2 className="text-[36px] text-black mb-3">경복궁</h2>
            <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-black text-[20px] ml-1">4.8</span>
              <span className="text-[#666] ml-2">(1,234개의 리뷰)</span>
            </div>
          </div>
        </div>
         <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 h-[400px] rounded-lg overflow-hidden shadow-md">
                <img
                    src="https://images.unsplash.com/photo-1621020744929-ff077d5275ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3VyaXN0JTIwYXR0cmFjdGlvbnxlbnwxfHx8fDE3NjIyOTA2MDl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt="경복궁"
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
                            <p className="text-[16px] text-black">서울특별시 종로구 사직로 161</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] text-[#666] mb-1">운영시간</p>
                    <p className="text-[16px] text-black">09:00 - 18:00</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] text-[#666] mb-1">전화번호</p>
                    <p className="text-[16px] text-black">02-3700-3900</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-[#4442dd] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[14px] text-[#666] mb-1">웹사이트</p>
                    <p className="text-[16px] text-[#4442dd]">www.royalpalace.go.kr</p>
                  </div>
                </div>
            </div>
         </div>
            <div className="border-l-4 border-[#4442dd] pl-6 py-2">
                <h3 className="text-[20px] text-black mb-3">개요</h3>
                <p className="text-[16px] text-[#333] leading-relaxed">
                조선왕조의 법궁으로 1395년에 창건되었습니다. 근정전을 비롯한 7,700여 칸의 건물들이 미로같이 빼곡히 들어차 있었으나 
                현재는 일부만 복원되어 있습니다. 경복궁은 북악산을 배경으로 자리잡은 조선시대의 대표적인 건축물입니다.
                </p>
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
              { 
                name: '김철수', 
                date: '2025.11.03', 
                rating: 5, 
                content: '정말 멋진 곳이었어요! 경복궁의 웅장함과 아름다움에 감탄했습니다. 특히 근정전 앞에서 본 풍경이 인상적이었어요. 가족들과 함께 방문했는데 모두 만족했습니다.' 
              },
              { 
                name: '이영희', 
                date: '2025.11.01', 
                rating: 4, 
                content: '경치가 아름답고 볼거리가 많았습니다. 한국의 역사와 문화를 느낄 수 있는 좋은 장소예요. 다만 주말이라 사람이 많아서 조금 복잡했어요.' 
              },
              { 
                name: '박민수', 
                date: '2025.10.28', 
                rating: 5, 
                content: '친구들에게 추천하고 싶은 관광지입니다. 사진 찍기 좋은 포인트가 많고, 한복을 입고 방문하면 무료 입장이라는 점도 좋았어요!' 
              },
              { 
                name: 'Sarah Kim', 
                date: '2025.10.25', 
                rating: 5, 
                content: 'Amazing historical site! The architecture is stunning and the palace grounds are beautifully maintained. A must-visit when in Seoul.' 
              },
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
                  {review.content}
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
import { useRef, useEffect } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SpotList = ({ spotList }) => {
    // Component code here
    const navigate = useNavigate();
    const containerRef = useRef(null);

      useEffect(() => {
    const container = containerRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY; // 휠 Y 움직임을 X 스크롤로 변환
    };
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    console.log("SpotList updated:", spotList);
  }, [spotList]);
  const handleSpotClick = (spot) => {
    // 스팟 클릭 시 동작 (예: 상세 페이지로 이동)
    navigate(`/spotDetail?spotId=${spot.id}`);
    
  }
  return (
    <div
      ref={containerRef}
      className="flex overflow-x-scroll scroll-smooth overflow-y-hidden w-full h-[300px] snap-x snap-mandatory"
    >
      {spotList?.map((spot) => (
        <div
          key={spot.id}
          className="w-[200px] h-[250px] m-4 bg-white rounded-lg shadow-md p-4 snap-start flex-shrink-0"
          onClick={() => { handleSpotClick(spot); }}
        >
          <div className="h-30 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
            {/* 이미지가 없으므로 플레이스홀더 */}
            <img
              src={spot.firstImage || "uploads/images/free-icon-picture-14534501.png"}
              alt={spot.title}
              className="h-full rounded-md"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2 truncate">{spot.title}</h3>
          <div className="flex items-center mt-5">
            {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i <= spot.receive - 1
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                    ))}
          <p className="text-gray-600 text-sm ml-3">{spot.receive.toFixed(1)}</p>
        </div>
          
        </div>
      ))}
    </div>
  );
};

export default SpotList;
// src/components/festival/festivalList.jsx

import { useRef, useEffect } from "react";

const FestivalList = ({ festivals, loading, error }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    console.log("FestivalList updated:", festivals);
  }, [festivals]);

  const list = Array.isArray(festivals) ? festivals : [];

  if (loading) {
    return <p className="text-gray-500">축제 정보를 불러오는 중입니다...</p>;
  }

  if (error) {
    return (
      <p className="text-red-500">
        축제 정보를 불러오는 중 오류가 발생했습니다.
      </p>
    );
  }

  if (list.length === 0) {
    return <p className="text-gray-500">표시할 축제가 없습니다.</p>;
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return "날짜 정보 없음";
    const d = new Date(isoString);
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  };

  return (
    <div
      ref={containerRef}
      className="flex overflow-x-scroll scroll-smooth overflow-y-hidden w-full h-[260px] snap-x snap-mandatory"
    >
      {list.map((festival) => (
        <div
          key={festival.id}
          className="w-[220px] h-[220px] m-4 bg-white rounded-lg shadow-md p-4 snap-start flex-shrink-0"
        >
          <div className="h-24 bg-gray-200 rounded-md mb-3 flex items-center justify-center overflow-hidden">
            {festival.firstImage ? (
              <img
                src={festival.firstImage}
                alt={festival.title}
                className="h-full w-full object-cover rounded-md"
              />
            ) : (
              <span className="text-gray-500 text-sm">이미지 없음</span>
            )}
          </div>

          <h3 className="text-sm font-semibold mb-1 truncate">
            {festival.title}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {festival.description || "설명이 없습니다."}
          </p>

          <p className="text-xs text-gray-600">
            {formatDateTime(festival.start_at)} ~{" "}
            {formatDateTime(festival.end_at)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default FestivalList;

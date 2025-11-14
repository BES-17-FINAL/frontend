import { useState, useEffect } from "react";

function AreaBasedListPage() {
  const [data, setData] = useState([]);
  const [contentTypeId, setContentTypeId] = useState("39");
  const [pageNo, setPageNo] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:8080/api/area-based?contentTypeId=${contentTypeId}&numOfRows=12&pageNo=${pageNo}`
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const items = json?.response?.body?.items?.item || [];
      setData(items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contentTypeId, pageNo]);

  return (
    <div className="bg-sky-200 p-6 font-sans">
      <h1 className=" text-3xl font-bold mb-6">✈️ 지역 기반 관광 정보</h1>

      <div className="bg-sky-100 flex items-center rounded-xl gap-4 mb-4 pl-8 h-16">
        <label className="font-semibold">
          콘텐츠 타입:
          <select
            value={contentTypeId}
            onChange={(e) => setContentTypeId(e.target.value)}
            className="ml-2 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="12">관광지</option>
            <option value="14">문화시설</option>
            <option value="15">축제/공연/행사</option>
            <option value="25">여행코스</option>
            <option value="28">레포츠</option>
            <option value="32">숙박</option>
            <option value="38">쇼핑</option>
            <option value="39">음식점</option>
          </select>
        </label>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          새로고침
        </button>
      </div>

      {loading && <p className="text-gray-500">⏳ 불러오는 중...</p>}
      {error && <p className="text-red-500">⚠️ 오류: {error}</p>}

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data.map((item) => (
            <div
              key={item.contentid}
              className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition"
            >
              {item.firstimage ? (
                <img
                  src={item.firstimage}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  이미지 없음
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-bold mb-2">{item.title}</h2>
                <p className="text-gray-600">{item.addr1 || "주소 정보 없음"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-gray-500 mt-6">결과가 없습니다.</p>
      )}
    </div>
  );
}

export default AreaBasedListPage;

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

export default function SearchResults() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";
  const contentTypeId = queryParams.get("contentTypeId");

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!keyword) return;
      setLoading(true);
      setError(null);

      try {
        let url = `http://localhost:8080/api/search?keyword=${encodeURIComponent(keyword)}`;
        if (contentTypeId) url += `&contentTypeId=${contentTypeId}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setPlaces(data);
      } catch (err) {
        console.error(err);
        setError("검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [keyword, contentTypeId]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          "{keyword}" 검색 결과
        </h2>

        {loading && <p className="text-gray-500">⏳ 검색 중...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && places.length === 0 && (
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {places.map((place) => (
            <Link
              key={place.title}
              to={`/spotDetail?contentId=${place.apiType}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {place.firstImage ? (
                <img
                  src={place.firstImage}
                  alt={place.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                  이미지 없음
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{place.title}</h3>
                <p className="text-gray-600 mt-1">
                  {place.address || "주소 정보 없음"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="text-indigo-600 hover:underline font-medium"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

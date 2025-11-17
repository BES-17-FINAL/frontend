import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import SearchBar from "../components/ui/SearchBar";
import Header from "../components/layout/Header";

export default function SearchResults() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const keyword = queryParams.get("keyword") || "";
  const contentTypeId = queryParams.get("contentTypeId");

  // URL 변경 시 검색 실행
  useEffect(() => {
    if (!keyword) {
      setPlaces([]);
      return;
    }

    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `http://localhost:8080/api/search?keyword=${encodeURIComponent(
          keyword
        )}${contentTypeId ? `&contentTypeId=${contentTypeId}` : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        setPlaces(data);
      } catch (err) {
        console.error(err);
        setError("검색 중 오류 발생");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [keyword, contentTypeId]);

  const handleSearch = (keyword) => {
    if (!keyword.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(keyword)}${
      contentTypeId ? `&contentTypeId=${contentTypeId}` : ""
    }`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-6 mt-6 flex flex-col md:flex-row gap-6">
        {/* 메인 콘텐츠 */}
        <div className="flex-1">
          {/* 제목 + 검색창 상단 */}
          <div className="flex flex-col md:flex-row md:items-center gap-20 mb-6">
            <h2 className="text-3xl font-bold">"{keyword}" 검색 결과</h2>
            <div className="w-full md:w-96 flex-shrink-0">
              <div className="sticky top-8 bg-white p-4 rounded shadow-md">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          </div>

          {/* 검색 상태 메시지 */}
          {loading && <p>⏳ 검색 중...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && places.length === 0 && <p>검색 결과가 없습니다.</p>}

          {/* 검색 결과 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {places.map((place) => (
              <div
                key={place.title}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/spot/${place.id}/${place.apiType}`)}
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
                  <h3 className="font-semibold">{place.title}</h3>
                  <p className="text-gray-600">{place.address}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 홈으로 돌아가기 */}
          <div className="mt-6">
            <Link to="/" className="text-indigo-600 hover:underline">
              ← 홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

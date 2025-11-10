import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function SearchResults() {
  const { region } = useParams();
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    // 예시: API 호출
    const fetchPlaces = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/places?region=${region}`);
        const data = await res.json();
        setPlaces(data);
      } catch (err) {
        console.error("API 호출 오류:", err);
      }
    };

    fetchPlaces();
  }, [region]);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          "{decodeURIComponent(region)}" 관광지
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {places.length > 0 ? (
            places.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{place.name}</h3>
                  <p className="text-gray-600 mt-1">{place.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">검색된 관광지가 없습니다.</p>
          )}
        </div>

        <div className="mt-8">
          <Link
            to="/"
            className="text-indigo-600 hover:underline font-medium"
          >
            ← 검색으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

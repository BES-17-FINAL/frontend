import React, { useEffect, useState } from "react";
import Header from "../components/layout/Header";

function FestivalListPage() {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFestivals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/festival/ongoing`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      console.log("API Response:", json);
      const items = json || [];
      setFestivals(items);
      console.log("Fetched festivals:", items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, []);

  return (
    <div className="bg-yellow-100 min-h-screen font-sans">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold mb-6">🎉 현재 진행 중인 축제</h1>

        {loading && <p className="text-gray-500">⏳ 불러오는 중...</p>}
        {error && <p className="text-red-500">⚠️ 오류: {error}</p>}

        {!loading && !error && festivals.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {festivals.map((f) => (
              <div
                key={f.id}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition"
              >
                {f.firstImage ? (
                  <img
                    src={f.firstImage}
                    alt={f.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <img
                    src={"uploads/images/free-icon-picture-14534501.png"}
                    alt={f.title}
                    className="h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-lg font-bold mb-2">{f.title}</h2>
                  <p className="text-gray-600">{f.addr1 || "주소 정보 없음"}</p>
                  <p className="text-sm text-gray-500">
                    {f.start_at} ~ {f.end_at}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && festivals.length === 0 && (
          <p className="text-gray-500 mt-6">진행 중인 축제가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default FestivalListPage;

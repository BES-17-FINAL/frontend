import { useState, useEffect } from "react";
import { Search, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  // 검색 API 호출 (추천 검색어 용)
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/items?query=${query}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("검색 오류:", err);
      }
    };

    fetchResults();
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const handleSearch = (searchTerm) => {
    const term = searchTerm || query;
    if (!term.trim()) return;
    navigate(`/search/${encodeURIComponent(term)}`);
    clearSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="mt-6 w-full max-w-md">
      <label className="sr-only">관광지 검색</label>
      <div className="flex flex-col">
        {/* 검색창 */}
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="예: 부산 해운대, 강릉 주문진"
            className="flex-1 outline-none placeholder-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <XCircle
              className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={clearSearch}
            />
          )}
          <button
            className="px-3 py-1 bg-indigo-600 text-white rounded-md"
            onClick={() => handleSearch()}
          >
            검색
          </button>
        </div>

        {/* 추천 검색어 / 검색 결과 */}
        {results.length > 0 && (
          <ul className="mt-2 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg divide-y divide-gray-100">
            {results.map((spot) => (
              <li
                key={spot.spot_id}
                className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors"
                onClick={() => handleSearch(spot.spot_id)}
              >
                {spot.spot_id}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default SearchBar;

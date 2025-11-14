import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [contentTypeId, setContentTypeId] = useState("12"); // 관광지 기본
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/searchresults?keyword=${encodeURIComponent(query)}&contentTypeId=${contentTypeId}`);
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색어 입력 (예: 서울)"
        className="flex-1 p-2 border rounded-md"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch(); // Enter 키 누르면 검색
          }
        }}
      />
      <select
        value={contentTypeId}
        onChange={(e) => setContentTypeId(e.target.value)}
        className="p-2 border rounded-md"
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
      <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded-md">검색</button>
    </div>
  );
}

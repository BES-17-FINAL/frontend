import React, { useEffect, useState } from 'react';

export default function AreaBasedListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/area-based?numOfRows=100&contentTypeId=39&pageNo=${page}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list =
          data?.response?.body?.items?.item ??
          data?.items ??
          [];
        setItems(Array.isArray(list) ? list : [list]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const visible = items.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">관광지 목록</h1>
      {loading && <p>로딩 중...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {visible.map((it, idx) => (
          <div key={it.contentid ?? idx} className="p-4 border rounded">
            <img src={it.firstimage} alt={it.title} className="h-40 w-full object-cover mb-2" />
            <h2 className="font-medium">{it.title}</h2>
            <p className="text-sm text-gray-600">{it.addr1 ?? it.addr}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between">
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>이전</button>
        <span>{page} / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>다음</button>
      </div>
    </div>
  );
}

import { Heart } from "lucide-react";
import React, { useState, useEffect } from "react";
import api, { getImageUrl } from "../../services/api";

const CommunityList = ({
  onPostClick,
  onWriteClick,
  refreshTrigger,
  updatedPostCommentCount,
}) => {
  const [search, setSearch] = React.useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [searchType, setSearchType] = useState("TITLE_CONTENT");
  const [sortType, setSortType] = useState("LATEST");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  const POST_SEARCH_TYPES = {
    TITLE: "제목",
    CONTENT: "내용",
    NICKNAME: "작성자",
    TITLE_CONTENT: "제목+내용",
  };

  // 카테고리 Enum → 한글 변환
  const categoryToKorean = (category) => {
    const map = {
      CHAT: "잡담",
      QUESTION: "질문",
      TIP: "꿀팁",
    };
    return map[category] || category || "잡담";
  };

  // 날짜 포맷
  const formatDateTime = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      // 1분 미만: 방금 전
      if (diffMins < 1) return "방금 전";
      // 1시간 미만: N분 전
      if (diffMins < 60) return `${diffMins}분 전`;
      // 24시간 미만: N시간 전
      if (diffHours < 24) return `${diffHours}시간 전`;
      // 7일 미만: N일 전
      if (diffDays < 7) return `${diffDays}일 전`;

      // 그 외: YYYY.MM.DD HH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}.${month}.${day} ${hours}:${minutes}`;
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "";
    }
  };

  // 작성일시/수정일시 표시 함수
  const getDisplayDateTime = (post) => {
    if (!post) return "";

    // 수정일시가 있고 작성일시와 다르면 수정일시 표시
    if (post.updatedAt && post.createdAt && post.updatedAt !== post.createdAt) {
      return `수정 ${formatDateTime(post.updatedAt)}`;
    }

    // 그 외에는 작성일시 표시
    return formatDateTime(post.createdAt);
  };

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const categoryParam =
        selectedCategory !== "전체"
          ? selectedCategory === "잡담"
            ? "CHAT"
            : selectedCategory === "질문"
            ? "QUESTION"
            : "TIP"
          : undefined;

      console.log("🔵 [API 호출] 게시글 목록 요청 시작");
      console.log(
        "🔵 [API 호출] 카테고리:",
        selectedCategory,
        "→",
        categoryParam
      );

      const params = {
        page: currentPage,
        size: pageSize,
        sortType: sortType,
      };
      if (categoryParam) {
        params.category = categoryParam;
      }

      if (searchKeyword && searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
        params.searchType = searchType;
      }

      console.log("API 호출 요청 파라미터:", params);

      const response = await api.get("/api/posts", { params });

      console.log("🟢 [API 응답] 상태 코드:", response.status);
      
      // 페이징 정보 설정
      if (response.data && typeof response.data === "object") {
        const totalPagesFromResponse =
          response.data.totalPages !== undefined ? response.data.totalPages : 1;
        setTotalPages(totalPagesFromResponse);
      }

      let backendPosts = [];

      // 게시글 데이터 매핑
      if (
        response.data &&
        response.data.content &&
        Array.isArray(response.data.content)
      ) {
        backendPosts = response.data.content.map((post) => ({
          id: post.id,
          authorName: post.nickname || "익명",
          authorNickname: post.nickname || "익명",
          authorAvatar: "#4442dd",
          content: post.title || "",
          title: post.title || "",
          fullContent: post.content || "",
          likes: post.likeCount || 0,
          isLiked: post.isLiked || false,
          rating: null,
          category: categoryToKorean(post.category),
          commentCount:
            post.commentCount !== null && post.commentCount !== undefined
              ? Number(post.commentCount)
              : 0,
          views: post.viewCount || 0,
          hasImage:
            !!post.thumbnailUrl || (post.images && post.images.length > 0),
          thumbnailUrl:
            post.thumbnailUrl ||
            (post.images && post.images.length > 0
              ? post.images[0].imageUrl || post.images[0].url
              : null),
          images: post.images || [],
          createdAt: post.createdAt,
          updatedAt: post.updatedAt || post.createdAt,
          userId: post.userId,
        }));
      } else if (Array.isArray(response.data)) {
        // 백엔드에서 배열로 직접 반환하는 경우에 대한 대비
        backendPosts = response.data.map((post) => ({
          id: post.id,
          authorName: post.nickname || "익명",
          authorNickname: post.nickname || "익명",
          authorAvatar: "#4442dd",
          content: post.title || "",
          title: post.title || "",
          fullContent: post.content || "",
          likes: post.likeCount || 0,
          isLiked: post.isLiked || false,
          rating: null,
          category: categoryToKorean(post.category),
          commentCount:
            post.commentCount !== null && post.commentCount !== undefined
              ? Number(post.commentCount)
              : 0,
          views: post.viewCount || 0,
          hasImage:
            !!post.thumbnailUrl || (post.images && post.images.length > 0),
          thumbnailUrl:
            post.thumbnailUrl ||
            (post.images && post.images.length > 0
              ? post.images[0].imageUrl || post.images[0].url
              : null),
          images: post.images || [],
          createdAt: post.createdAt,
          updatedAt: post.updatedAt || post.createdAt,
          userId: post.userId,
        }));
      }

      // 댓글 수 업데이트 (상세 페이지에서 돌아왔을 때 반영)
      if (
        updatedPostCommentCount &&
        Object.keys(updatedPostCommentCount).length > 0
      ) {
        backendPosts = backendPosts.map((post) => {
          const updatedCount = updatedPostCommentCount[post.id];
          if (updatedCount !== undefined && updatedCount !== null) {
            return { ...post, commentCount: updatedCount };
          }
          return post;
        });
      }

      setPosts(backendPosts);
    } catch (error) {
      console.error("게시글 목록 가져오기 실패", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 조건 변경 시 페이지 초기화
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, sortType, searchKeyword]);

  // 데이터 로드
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, currentPage, sortType, searchKeyword]);

  // 리프레시 트리거
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchPosts();
    }
  }, [refreshTrigger]);

  // 댓글 수 즉시 업데이트 로직
  useEffect(() => {
    if (
      updatedPostCommentCount &&
      Object.keys(updatedPostCommentCount).length > 0
    ) {
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
          const updatedCount = updatedPostCommentCount[post.id];
          if (updatedCount !== undefined && updatedCount !== null) {
            return { ...post, commentCount: updatedCount };
          }
          return post;
        });
        return updatedPosts;
      });
    }
  }, [updatedPostCommentCount]);

  const getCategoryColor = (category) => {
    // 카테고리를 한글로 변환
    const categoryKorean =
      category === "CHAT"
        ? "잡담"
        : category === "QUESTION"
        ? "질문"
        : category === "TIP"
        ? "꿀팁"
        : category;

    switch (categoryKorean) {
      case "잡담":
        return "bg-[#adf382] text-black";
      case "질문":
        return "bg-[#FFD700] text-black";
      case "꿀팁":
        return "bg-[#ff6b6b] text-white";
      default:
        return "bg-[#dedede] text-black";
    }
  };

  const isCategorySelected = (button) => {
    const isSelected = button === selectedCategory;
    const baseStyle = "px-4 py-2 rounded-lg transition-colors";

    if (isSelected) {
      switch (button) {
        case "잡담":
          return `${baseStyle} bg-[#adf382] text-black font-semibold`;
        case "질문":
          return `${baseStyle} bg-[#FFD700] text-black font-semibold`;
        case "꿀팁":
          return `${baseStyle} bg-[#ff6b6b] text-white font-semibold`;
        case "전체":
          return `${baseStyle} bg-[#4442dd] text-white font-semibold`;
        default:
          return `${baseStyle} bg-[#4442dd] text-white font-semibold`;
      }
    } else {
      return `${baseStyle} bg-white border-2 border-[#dedede] text-black hover:border-[#4442dd]`;
    }
  };

  const handleSearch = () => {
    console.log("검색 검색어:", search, "검색 타입:", searchType);
    setSearchKeyword(search);
    setCurrentPage(0);
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      {/* 검색바와 버튼 */}
      <div className="mb-8">
        <div className="flex gap-3 mb-4">
          {/* 검색 타입 선택 */}
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="h-[43px] px-4 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] transition-colors bg-white"
          >
            {Object.entries(POST_SEARCH_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {/* 검색 입력창 */}
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={search}
            className="flex-1 h-[43px] px-4 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] transition-colors"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          {/* 검색 버튼 */}
          <button
            className="bg-[#4442dd] hover:bg-[#3331cc] px-8 h-[43px] text-white rounded-lg transition-colors"
            onClick={handleSearch}
          >
            검색
          </button>
        </div>
        <div className="flex justify-end">
          <button
            className="bg-[#4442dd] hover:bg-[#3331cc] px-6 py-2 text-white rounded-lg transition-colors"
            onClick={onWriteClick}
          >
            게시글 작성
          </button>
        </div>
      </div>

      {/* 카테고리 필터 & 정렬 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {["전체", "잡담", "질문", "꿀팁"].map((cat) => (
            <button
              key={cat}
              className={isCategorySelected(cat)}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="px-4 py-2 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd]"
        >
          <option value="LATEST">최신순</option>
          <option value="MOST_LIKES">인기순</option>
          <option value="MOST_VIEWS">조회순</option>
          <option value="MOST_COMMENTS">댓글순</option>
        </select>
      </div>

      {/* 게시글 리스트 */}
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8 text-[#666]">
            게시글을 불러오는 중...
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="text-center py-8 text-[#666]">
            작성된 게시글이 없습니다.
          </div>
        )}
        {!loading &&
          posts.map((post) => (
            <div
              key={post.id}
              onClick={() => onPostClick(post)}
              className="bg-white border-2 border-[#dedede] rounded-lg p-6 cursor-pointer hover:border-[#4442dd] hover:shadow-md transition-all"
            >
              <div className="flex gap-4">
                {/* 아바타 */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                  style={{ backgroundColor: post.authorAvatar }}
                >
                  <span className="text-[18px]">{post.authorName[0]}</span>
                </div>

                {/* 콘텐츠 */}
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-[12px] ${getCategoryColor(
                        post.category
                      )}`}
                    >
                      {post.category}
                    </span>
                    <p className="text-black">{post.authorName}</p>
                    {post.rating && (
                      <span className="text-[14px] text-[#666]">
                        ⭐ {post.rating}/5
                      </span>
                    )}
                  </div>
                  <p className="text-[#333] line-clamp-2 mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-[14px] text-[#666]">
                    <span>💬 {post.commentCount}</span>
                    <span>👁️ {post.views}</span>
                    <span>❤️ {post.likes}</span>
                    {post.hasImage && <span>📷</span>}
                  </div>
                </div>

                {/* 우측 영역: 썸네일 이미지와 시간 */}
                <div className="flex-shrink-0 flex flex-col items-end justify-end gap-2">
                  {/* 썸네일 이미지 */}
                  {post.thumbnailUrl && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden">
                      <img
                        src={getImageUrl(post.thumbnailUrl)}
                        alt="게시글 썸네일"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  {/* 작성일시/수정일시 */}
                  <div className="text-[12px] text-[#999]">
                    {getDisplayDateTime(post)}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
          disabled={currentPage === 0 || totalPages === 0}
          className={`px-3 py-1 border-2 rounded transition-colors ${
            currentPage === 0 || totalPages === 0
              ? "border-[#dedede] text-[#dedede] cursor-not-allowed"
              : "border-[#dedede] hover:border-[#4442dd]"
          }`}
        >
          ‹
        </button>

        {/* 페이지 번호 버튼들 */}
        {totalPages > 0 &&
          Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i;
            } else if (currentPage < 3) {
              pageNum = i;
            } else if (currentPage > totalPages - 4) {
              pageNum = totalPages - 5 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded transition-colors ${
                  currentPage === pageNum
                    ? "bg-[#4442dd] text-white"
                    : "border-2 border-[#dedede] hover:border-[#4442dd]"
                }`}
              >
                {pageNum + 1}
              </button>
            );
          })}

        {/* 다음 페이지 버튼 */}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
          }
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          className={`px-3 py-1 border-2 rounded transition-colors ${
            currentPage >= totalPages - 1 || totalPages === 0
              ? "border-[#dedede] text-[#dedede] cursor-not-allowed"
              : "border-[#dedede] hover:border-[#4442dd]"
          }`}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default CommunityList;

import { Heart } from "lucide-react";
import { Bookmark, Image as ImageIcon, Edit2, Trash2 } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import useAuthStore from "../../store/authStore";
import { PostWriteModal } from "./PostWriteModal";
import api, { getImageUrl } from "../../services/api";

export function CommunityDetail({ post, onBack, onPostUpdated }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  if (!post) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-8">
        <p className="text-center text-[#666]">게시글을 찾을 수 없습니다.</p>
        <button
          onClick={onBack}
          className="mt-4 px-6 py-2 border-2 border-[#dedede] text-black hover:border-[#4442dd] rounded-lg transition-colors"
        >
          ← 목록으로
        </button>
      </div>
    );
  }

  // 게시글
  const [postData, setPostData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const viewCountIncrementedRef = useRef(false); // 조회수 증가 중복 방지

  // 게시글 좋아요 상태 관리
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [viewCount, setViewCount] = useState(post.views || 0);
  // 게시글 북마크 상태 관리
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);

  // 댓글 상태 관리
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [likingCommentIds, setLikingCommentIds] = useState(new Set());

  // 현재 사용자 정보 가져오기
  const { isAuthenticated, user } = useAuthStore();
  const currentUserNickname = useMemo(() => {
    if (user?.nickname) return user.nickname;
    const nickname = localStorage.getItem("nickname");
    console.log("🔵 [CommunityDetail] currentUserNickname:", nickname);
    return nickname;
  }, [user]);
  const currentUserId = useMemo(() => {
    if (user?.id) return user.id;
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed?.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [user]);

  // 게시글 좋아요 토글 함수
  const handleLikeClick = async () => {
    if (!post?.id) return;

    // 로그인 확인
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likeCount;

    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);

    try {
      console.log("좋아요 API 호출 시작, postId:", post.id);
      // 백엔드 API 호출
      await api.post(`/api/posts/${post.id}/like`);
      console.log("좋아요 API 호출 성공");
    } catch (error) {
      console.error("좋아요 실패:", error);

      // 실패 시 이전 상태로 복구
      setIsLiked(previousLiked);
      setLikeCount(previousCount);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "알 수 없는 오류";
      alert(`좋아요 처리에 실패했습니다.\n\n에러: ${errorMessage}`);
    }
  };

  // 게시글 북마크 토글 함수
  const handleBookmarkClick = async () => {
    if (!post?.id) return;

    // 로그인 확인
    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      return;
    }

    // 낙관적 업데이트 (즉시 UI 업데이트)
    const previousBookmarked = isBookmarked;
    setIsBookmarked(!previousBookmarked);

    try {
      console.log("북마크 API 호출 시작, postId:", post.id);
      // 백엔드 API 호출
      await api.post(`/api/posts/${post.id}/bookmark`);
      console.log("북마크 API 호출 성공");
    } catch (error) {
      console.error("북마크 토글 실패:", error);

      // 실패 시 이전 상태로 복구
      setIsBookmarked(previousBookmarked);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "알 수 없는 오류";
      alert(`북마크 처리에 실패했습니다.\n\n에러: ${errorMessage}`);
    }
  };

  // 댓글 수 계산
  const updateCommentCount = (commentsData) => {
    const calculatedCommentCount = commentsData.reduce((total, comment) => {
      const replyCount = comment.replies ? comment.replies.length : 0;
      return total + 1 + replyCount;
    }, 0);

    console.log(
      "댓글 수 계산 계산된 댓글 수:",
      calculatedCommentCount,
      "댓글 데이터:",
      commentsData
    );

    // 계산한 댓글 수를 postData에 반영
    setPostData((prev) => {
      if (prev) {
        return {
          ...prev,
          commentCount: calculatedCommentCount,
        };
      }
      return prev;
    });

    if (onPostUpdated) {
      const currentPostData = postData || post;
      const postId = currentPostData?.id || post?.id;

      if (postId) {
        console.log(
          "댓글 수 전달 postId:",
          postId,
          "댓글 수:",
          calculatedCommentCount
        );
        onPostUpdated({
          id: postId,
          commentCount: calculatedCommentCount,
        });
      }
    }

    return calculatedCommentCount;
  };

  // 댓글 목록 가져오기
  const fetchComments = async () => {
    if (!post?.id) return;

    try {
      setLoadingComments(true);
      const response = await api.get(`/api/posts/${post.id}/comments`, {
        params: {
          page: 0,
          size: 100,
        },
      });

      console.log("댓글 목록 받음:", response.data);
      const commentsData = response.data.content || [];
      setComments(commentsData);

      updateCommentCount(commentsData);
    } catch (error) {
      console.error("댓글 목록 가져오기 실패:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // 댓글 작성
  const handleCommentSubmit = async (parentId = null) => {
    if (!post?.id) return;

    const text = parentId ? replyText[parentId] : commentText;
    if (!text || !text.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const requestData = {
        text: text.trim(),
        parentId: parentId,
      };

      console.log("댓글 작성 요청:", requestData);
      await api.post(`/api/posts/${post.id}/comments`, requestData);

      // 댓글 목록 새로고침
      await fetchComments();

      if (parentId) {
        setReplyText((prev) => ({ ...prev, [parentId]: "" }));
        setReplyingToCommentId(null);
      } else {
        setCommentText("");
      }

      console.log("댓글 작성 완료");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성에 실패했습니다.");
    }
  };

  // 댓글 수정
  const handleCommentEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  // 댓글 수정 취소
  const handleCommentEditCancel = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  // 댓글 수정 완료
  const handleCommentUpdate = async (commentId) => {
    if (!post?.id || !editingText.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      console.log("댓글 수정 요청:", commentId, editingText);
      await api.put(`/api/posts/${post.id}/comments/${commentId}`, {
        text: editingText.trim(),
      });

      // 댓글 목록 새로고침
      await fetchComments();

      setEditingCommentId(null);
      setEditingText("");

      console.log("댓글 수정 완료");
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentId) => {
    if (!post?.id) return;

    if (!window.confirm("정말 댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      console.log("댓글 삭제 요청:", commentId);
      await api.delete(`/api/posts/${post.id}/comments/${commentId}`);

      // 댓글 목록 새로고침
      await fetchComments();

      console.log("댓글 삭제 완료");
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // 댓글 좋아요 토글
  const handleCommentLike = async (commentId) => {
    if (!post?.id) return;

    if (!isAuthenticated) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (likingCommentIds.has(commentId)) {
      console.log("댓글 좋아요 처리 중인 댓글:", commentId);
      return;
    }

    // 처리 중인 댓글 ID 추가
    setLikingCommentIds((prev) => new Set(prev).add(commentId));

    // 현재 상태 저장
    let previousState = null;
    setComments((prevComments) => {
      // 이전 상태 저장
      previousState = JSON.parse(JSON.stringify(prevComments));

      return prevComments.map((comment) => {
        // 댓글 또는 답글 찾기
        if (comment.id === commentId) {
          const previousLiked = comment.isLiked || false;
          const previousCount = comment.likeCount || 0;
          return {
            ...comment,
            isLiked: !previousLiked,
            likeCount: previousLiked
              ? Math.max(0, previousCount - 1)
              : previousCount + 1,
          };
        }
        // 답글 확인
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === commentId) {
                const previousLiked = reply.isLiked || false;
                const previousCount = reply.likeCount || 0;
                return {
                  ...reply,
                  isLiked: !previousLiked,
                  likeCount: previousLiked
                    ? Math.max(0, previousCount - 1)
                    : previousCount + 1,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      });
    });

    try {
      console.log("댓글 좋아요 토글 요청:", commentId);
      await api.post(`/api/posts/${post.id}/comments/${commentId}/like`);
      console.log("댓글 좋아요 토글 완료");
    } catch (error) {
      console.error("댓글 좋아요 토글 실패:", error);

      if (previousState) {
        setComments(previousState);
      } else {
        await fetchComments();
      }

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "알 수 없는 오류";
      alert(`댓글 좋아요 처리에 실패했습니다.\n\n에러: ${errorMessage}`);
    } finally {
      setLikingCommentIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  // 게시글 상세 정보 불러오기
  const fetchPostDetail = async () => {
    if (!post?.id) return;

    try {
      setIsLoading(true);

      // 조회수 증가
      if (!viewCountIncrementedRef.current) {
        try {
          await api.post(`/api/posts/${post.id}/view`);
          viewCountIncrementedRef.current = true;
          console.log("조회수 증가 완료");
        } catch (error) {
          console.error("조회수 증가 실패:", error);
        }
      }

      // 게시글 상세 정보 가져오기
      const response = await api.get(`/api/posts/${post.id}`);
      const updatedPost = response.data;

      console.log("게시글 상세] 받은 데이터:", updatedPost);

      // 조회수 업데이트
      setViewCount(updatedPost.viewCount || 0);
      // 좋아요 상태 업데이트
      const newIsLiked =
        updatedPost.isLiked === true || updatedPost.liked === true;
      setIsLiked(!!newIsLiked);
      setLikeCount(updatedPost.likeCount || 0);
      // 북마크 상태 업데이트
      setIsBookmarked(updatedPost.isBookmarked === true);

      setPostData(updatedPost);
    } catch (error) {
      console.error("게시글 상세 정보 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (post?.id) {
      viewCountIncrementedRef.current = false;
      fetchPostDetail();
      fetchComments();
    }

    return () => {
      viewCountIncrementedRef.current = false;
    };
  }, [post?.id]);

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}.${month}.${day}`;
    } catch (e) {
      return dateString;
    }
  };

  // 수정 버튼 클릭
  const handleEdit = () => {
    console.log("게시글 수정 모달 열기:", post.id);
    setIsEditModalOpen(true);
  };

  // 수정 완료
  const handlePostUpdated = (updatedPost) => {
    console.log("🟢 [CommunityDetail] 게시글 수정 완료:", updatedPost);

    // 로컬 상태 업데이트
    setPostData(updatedPost);

    if (onPostUpdated) {
      onPostUpdated(updatedPost);
    }

    setIsEditModalOpen(false);
  };

  // 삭제 버튼 클릭
  const handleDelete = async () => {
    if (
      !window.confirm(
        "정말 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      console.log("게시글 삭제 요청:", post.id);
      console.log("요청 URL:", `/api/posts/${post.id}`);

      // 삭제 API 호출
      const response = await api.delete(`/api/posts/${post.id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("삭제 게시글 삭제 완료:", post.id);
      console.log("삭제 응답 상태:", response?.status);

      alert("게시글이 삭제되었습니다.");

      // 목록으로 돌아가기
      onBack();
    } catch (error) {
      console.error("삭제 게시글 삭제 실패:", error);
      console.error("삭제 에러 응답:", error.response?.data);
      console.error("삭제 에러 상태 코드:", error.response?.status);

      // 에러 메시지
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "알 수 없는 오류가 발생했습니다.";

      alert(
        `게시글 삭제에 실패했습니다.\n\n에러: ${errorMessage}\n\n상세 내용은 콘솔을 확인해주세요.`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getImagesFromPost = (sourcePost = post) => {
    const source = postData || sourcePost;
    if (
      source?.images &&
      Array.isArray(source.images) &&
      source.images.length > 0
    ) {
      // PostImageResponse 배열인 경우
      return source.images
        .map((img) => {
          if (typeof img === "string") return img;
          return img.imageUrl || img.url || img;
        })
        .filter(Boolean);
    }
    // thumbnailUrl이 있는 경우
    if (source?.thumbnailUrl) {
      return [source.thumbnailUrl];
    }
    return [];
  };

  // 카테고리 Enum → 한글 변환 함수
  const categoryToKorean = (category) => {
    if (!category) return "잡담";
    const map = {
      CHAT: "잡담",
      QUESTION: "질문",
      TIP: "꿀팁",
    };
    return map[category] || category || "잡담";
  };

  const displayPostData = useMemo(() => {
    const source = postData || post;
    const categoryValue = source.category || "잡담";
    return {
      id: source.id,
      title: source.title || source.content || "제목 없음",
      author: source.authorName || source.nickname || "익명",
      authorNickname:
        source.authorNickname || source.nickname || source.authorName || "익명",
      authorId: source.userId,
      authorAvatar: source.authorAvatar || "#4442dd",
      date: formatDate(source.createdAt),
      likes: likeCount,
      views: viewCount,
      category: categoryToKorean(categoryValue),
      images: getImagesFromPost(source),
      content: source.fullContent || source.content || "",
      commentCount:
        source.commentCount !== null && source.commentCount !== undefined
          ? Number(source.commentCount)
          : null,
    };
  }, [postData, post, likeCount, viewCount]);

  useEffect(() => {
    console.log("🔵 [CommunityDetail] 디버깅 정보:");
    console.log("  - isAuthenticated:", isAuthenticated);
    console.log("  - currentUserNickname:", currentUserNickname);
    console.log("  - currentUserId:", currentUserId);
    console.log(
      "  - post.authorNickname:",
      post?.authorNickname || post?.nickname
    );
    console.log("  - post.userId:", post?.userId);
    console.log(
      "  - displayPostData.authorNickname:",
      displayPostData.authorNickname
    );
    console.log("  - displayPostData.authorId:", displayPostData.authorId);

    const canEdit =
      isAuthenticated &&
      ((currentUserNickname &&
        displayPostData.authorNickname &&
        currentUserNickname === displayPostData.authorNickname) ||
        (currentUserId &&
          displayPostData.authorId &&
          currentUserId === displayPostData.authorId));
    console.log("  - 수정/삭제 버튼 표시 여부:", canEdit);
  }, [
    isAuthenticated,
    currentUserNickname,
    currentUserId,
    post,
    displayPostData,
  ]);

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

  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        className="mb-6 px-6 py-2 border-2 border-[#dedede] text-black hover:border-[#4442dd] rounded-lg transition-colors"
      >
        ← 목록으로
      </button>

      {/* 게시글 컨테이너 */}
      <div className="bg-white border-2 border-[#dedede] rounded-lg p-8 mb-8">
        {/* 카테고리 & 제목 */}
        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded text-[14px] ${getCategoryColor(
              displayPostData.category
            )}`}
          >
            {displayPostData.category}
          </span>
        </div>
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-[32px] text-black flex-1">
            {displayPostData.title}
          </h1>

          {/* 내가 쓴 글일 때만 수정/삭제 버튼 표시 */}
          {(() => {
            const canEdit =
              isAuthenticated &&
              ((currentUserNickname &&
                displayPostData.authorNickname &&
                currentUserNickname === displayPostData.authorNickname) ||
                (currentUserId &&
                  displayPostData.authorId &&
                  currentUserId === displayPostData.authorId));

            if (!canEdit) {
              console.log("CommunityDetail 수정/삭제 버튼 표시 안 함:", {
                isAuthenticated,
                currentUserNickname,
                postDataAuthorNickname: displayPostData.authorNickname,
                nicknameMatch:
                  currentUserNickname === displayPostData.authorNickname,
                currentUserId,
                postDataAuthorId: displayPostData.authorId,
                userIdMatch: currentUserId === displayPostData.authorId,
              });
            }

            return canEdit ? (
              <div className="flex gap-2 ml-4">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-[#4442dd] text-[#4442dd] rounded-lg hover:bg-[#4442dd] hover:text-white transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-[14px]">수정</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[14px]">
                    {isDeleting ? "삭제 중..." : "삭제"}
                  </span>
                </button>
              </div>
            ) : null;
          })()}
        </div>

        {/* 메타 정보 */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-[#dedede]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: displayPostData.authorAvatar }}
          >
            <span>{displayPostData.author[0]}</span>
          </div>
          <span className="text-black">{displayPostData.author}</span>
          <span className="text-[#666]">{displayPostData.date}</span>
          <span className="text-[#666]">조회 {displayPostData.views}</span>
          <div className="ml-auto flex items-center gap-4">
            <button
              onClick={handleLikeClick}
              className="flex items-center gap-2 hover:text-[#4442dd] transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${
                  isLiked ? "text-[#ff6b6b] fill-[#ff6b6b]" : "text-[#666]"
                }`}
              />
              <span className={isLiked ? "text-[#ff6b6b]" : "text-[#666]"}>
                {displayPostData.likes}
              </span>
            </button>
            <button
              onClick={handleBookmarkClick}
              className="hover:opacity-80 transition-opacity"
            >
              <Bookmark
                className={`w-5 h-5 ${
                  isBookmarked ? "text-[#4ade80] fill-[#4ade80]" : "text-[#666]"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 이미지 */}
        {displayPostData.images && displayPostData.images.length > 0 && (
          <div className="mb-6 flex flex-col gap-4">
            {displayPostData.images.map((img, idx) => (
              <img
                key={idx}
                src={getImageUrl(img)}
                alt={`게시글 이미지 ${idx + 1}`}
                className="w-full max-h-[600px] object-contain rounded-lg"
                onError={(e) => {
                  console.error("이미지 로드 실패:", img);
                  e.target.style.display = "none";
                }}
              />
            ))}
          </div>
        )}

        {/* 본문 */}
        <div className="py-6">
          <p className="text-[#333] whitespace-pre-line leading-relaxed">
            {displayPostData.content}
          </p>
        </div>

        {/* 좋아요 하트 (글 밑 가운데) */}
        <div className="flex justify-center py-6 border-t-2 border-[#dedede]">
          <button
            onClick={handleLikeClick}
            className="flex flex-col items-center gap-2 hover:scale-110 transition-transform"
          >
            <Heart
              className={`w-10 h-10 transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "fill-none text-[#666]"
              }`}
            />
            <span
              className={`text-[14px] ${
                isLiked ? "text-red-500 font-semibold" : "text-[#666]"
              }`}
            >
              {likeCount}
            </span>
          </button>
        </div>
      </div>

      {/* 댓글 */}
      <div>
        <h3 className="text-[20px] text-black mb-4">
          댓글{" "}
          {comments.reduce((total, comment) => {
            const replyCount = comment.replies ? comment.replies.length : 0;
            return total + 1 + replyCount;
          }, 0)}
          개
        </h3>

        {/* 댓글 작성 */}
        {isAuthenticated && (
          <div className="mb-6 bg-[#f5f5f5] rounded-lg p-4">
            <textarea
              placeholder="댓글을 입력하세요..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-3 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleCommentSubmit()}
                className="px-6 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
              >
                댓글 작성
              </button>
            </div>
          </div>
        )}

        {/* 댓글 리스트 */}
        {loadingComments ? (
          <div className="text-center py-8 text-[#666]">
            댓글을 불러오는 중...
          </div>
        ) : (
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-[#666]">
                댓글이 없습니다.
              </div>
            ) : (
              comments.map((comment) => {
                // 게시글 작성자인지 확인
                const isPostAuthor =
                  displayPostData.authorId === comment.userId ||
                  displayPostData.userId === comment.userId ||
                  displayPostData.authorNickname === comment.nickname;
                // 내가 쓴 댓글인지 확인
                const isMyComment =
                  isAuthenticated &&
                  (currentUserId === comment.userId ||
                    currentUserNickname === comment.nickname);

                return (
                  <div key={comment.id}>
                    <div
                      className={`rounded-lg p-4 ${
                        isMyComment
                          ? "bg-[#e8e8ff] border-2 border-[#4442dd]"
                          : "bg-[#f5f5f5]"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="text-black font-semibold">
                            {comment.nickname || "익명"}
                          </p>
                          {isPostAuthor && (
                            <span className="px-2 py-0.5 bg-[#4442dd] text-white text-[12px] rounded font-medium">
                              작성자
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {isAuthenticated && (
                            <button
                              onClick={() =>
                                setReplyingToCommentId(
                                  replyingToCommentId === comment.id
                                    ? null
                                    : comment.id
                                )
                              }
                              className="text-[14px] text-[#666] hover:text-[#4442dd] transition-colors cursor-pointer"
                            >
                              답글
                            </button>
                          )}
                          {/* 내가 쓴 댓글일 때만 수정/삭제 표시 */}
                          {isAuthenticated &&
                            (currentUserId === comment.userId ||
                              currentUserNickname === comment.nickname) && (
                              <div className="flex items-center gap-2 text-[14px]">
                                <span
                                  onClick={() => handleCommentEdit(comment)}
                                  className="text-[#666] hover:text-[#4442dd] cursor-pointer transition-colors"
                                >
                                  수정
                                </span>
                                <span className="text-[#dedede]">|</span>
                                <span
                                  onClick={() =>
                                    handleCommentDelete(comment.id)
                                  }
                                  className="text-[#666] hover:text-red-500 cursor-pointer transition-colors"
                                >
                                  삭제
                                </span>
                              </div>
                            )}
                        </div>
                      </div>

                      {/* 수정 모드 */}
                      {editingCommentId === comment.id ? (
                        <div className="mb-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full p-3 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={handleCommentEditCancel}
                              className="px-4 py-2 border-2 border-[#dedede] text-black rounded-lg hover:border-[#4442dd] transition-colors"
                            >
                              취소
                            </button>
                            <button
                              onClick={() => handleCommentUpdate(comment.id)}
                              className="px-4 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
                            >
                              수정 완료
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#333] mb-2">
                          {comment.deleted
                            ? "삭제된 댓글입니다."
                            : comment.text}
                        </p>
                      )}

                      {/* 하트 버튼 */}
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCommentLike(comment.id);
                          }}
                          className="flex items-center gap-1 hover:scale-110 transition-transform"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              comment.isLiked
                                ? "fill-red-500 text-red-500"
                                : "fill-none text-[#666]"
                            }`}
                          />
                          <span
                            className={`text-[14px] transition-colors ${
                              comment.isLiked
                                ? "text-red-500 font-semibold"
                                : "text-[#666]"
                            }`}
                          >
                            {comment.likeCount || 0}
                          </span>
                        </button>
                      </div>

                      {/* 답글 작성 폼 */}
                      {replyingToCommentId === comment.id &&
                        isAuthenticated && (
                          <div className="mt-4 ml-4 border-l-4 border-[#4442dd] pl-4">
                            <textarea
                              placeholder="답글을 입력하세요..."
                              value={replyText[comment.id] || ""}
                              onChange={(e) =>
                                setReplyText((prev) => ({
                                  ...prev,
                                  [comment.id]: e.target.value,
                                }))
                              }
                              className="w-full p-3 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => {
                                  setReplyingToCommentId(null);
                                  setReplyText((prev) => ({
                                    ...prev,
                                    [comment.id]: "",
                                  }));
                                }}
                                className="px-4 py-2 border-2 border-[#dedede] text-black rounded-lg hover:border-[#4442dd] transition-colors"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleCommentSubmit(comment.id)}
                                className="px-4 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
                              >
                                답글 작성
                              </button>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* 답글 리스트 */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {comment.replies.map((reply) => {
                          // 게시글 작성자인지 확인
                          const isReplyPostAuthor =
                            displayPostData.authorId === reply.userId ||
                            displayPostData.userId === reply.userId ||
                            displayPostData.authorNickname === reply.nickname;
                          // 내가 쓴 답글인지 확인
                          const isMyReply =
                            isAuthenticated &&
                            (currentUserId === reply.userId ||
                              currentUserNickname === reply.nickname);

                          return (
                            <div
                              key={reply.id}
                              className={`rounded-lg p-4 border-l-4 border-[#4442dd] ${
                                isMyReply
                                  ? "bg-[#e8e8ff] border-l-[#4442dd]"
                                  : "bg-[#f5f5f5]"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <p className="text-black font-semibold">
                                    {reply.nickname || "익명"}
                                  </p>
                                  {isReplyPostAuthor && (
                                    <span className="px-2 py-0.5 bg-[#4442dd] text-white text-[12px] rounded font-medium">
                                      작성자
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  {/* 내가 쓴 답글일 때만 수정/삭제 표시 */}
                                  {isAuthenticated &&
                                    (currentUserId === reply.userId ||
                                      currentUserNickname ===
                                        reply.nickname) && (
                                      <div className="flex items-center gap-2 text-[14px]">
                                        <span
                                          onClick={() =>
                                            handleCommentEdit(reply)
                                          }
                                          className="text-[#666] hover:text-[#4442dd] cursor-pointer transition-colors"
                                        >
                                          수정
                                        </span>
                                        <span className="text-[#dedede]">
                                          |
                                        </span>
                                        <span
                                          onClick={() =>
                                            handleCommentDelete(reply.id)
                                          }
                                          className="text-[#666] hover:text-red-500 cursor-pointer transition-colors"
                                        >
                                          삭제
                                        </span>
                                      </div>
                                    )}
                                </div>
                              </div>

                              {/* 수정 모드 */}
                              {editingCommentId === reply.id ? (
                                <div className="mb-2">
                                  <textarea
                                    value={editingText}
                                    onChange={(e) =>
                                      setEditingText(e.target.value)
                                    }
                                    className="w-full p-3 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none"
                                    rows={2}
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      onClick={handleCommentEditCancel}
                                      className="px-4 py-2 border-2 border-[#dedede] text-black rounded-lg hover:border-[#4442dd] transition-colors"
                                    >
                                      취소
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleCommentUpdate(reply.id)
                                      }
                                      className="px-4 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
                                    >
                                      수정 완료
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-[#333] mb-2">
                                  {reply.deleted
                                    ? "삭제된 댓글입니다."
                                    : reply.text}
                                </p>
                              )}

                              {/* 하트 버튼 */}
                              <div className="flex justify-end mt-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCommentLike(reply.id);
                                  }}
                                  className="flex items-center gap-1 hover:scale-110 transition-transform"
                                >
                                  <Heart
                                    className={`w-4 h-4 transition-colors ${
                                      reply.isLiked
                                        ? "fill-red-500 text-red-500"
                                        : "fill-none text-[#666]"
                                    }`}
                                  />
                                  <span
                                    className={`text-[14px] transition-colors ${
                                      reply.isLiked
                                        ? "text-red-500 font-semibold"
                                        : "text-[#666]"
                                    }`}
                                  >
                                    {reply.likeCount || 0}
                                  </span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 수정 모달 */}
      {isEditModalOpen && (
        <PostWriteModal
          mode="edit"
          initialPost={post}
          onClose={() => setIsEditModalOpen(false)}
          onPostCreated={handlePostUpdated}
        />
      )}
    </div>
  );
}

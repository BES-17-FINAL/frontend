import { Heart } from "lucide-react";
import { Bookmark, Image as ImageIcon, Edit2, Trash2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import useAuthStore from "../../store/authStore";
import { PostWriteModal } from "./PostWriteModal";
import api from "../../services/api";

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

  // 게시글 좋아요 상태 관리 (백엔드에서 받은 초기값 사용)
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  // 댓글 좋아요 상태 관리 (댓글 ID를 키로 사용)
  const [commentLikes, setCommentLikes] = useState({});
  // 답글 좋아요 상태 관리 (답글 ID를 키로 사용)
  const [replyLikes, setReplyLikes] = useState({});

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
  const handleLikeClick = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
  };

  // 댓글 좋아요 토글 함수
  const handleCommentLike = (commentId) => {
    setCommentLikes((prev) => {
      const isLiked = prev[commentId] || false;
      return {
        ...prev,
        [commentId]: !isLiked,
      };
    });
  };

  // 답글 좋아요 토글 함수
  const handleReplyLike = (replyId) => {
    setReplyLikes((prev) => {
      const isLiked = prev[replyId] || false;
      return {
        ...prev,
        [replyId]: !isLiked,
      };
    });
  };

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

  // 댓글 수정 핸들러
  const handleCommentEdit = (commentId) => {
    // TODO: 댓글 수정 기능 구현
    console.log("댓글 수정:", commentId);
    alert("댓글 수정 기능은 곧 구현될 예정입니다.");
  };

  // 댓글 삭제 핸들러
  const handleCommentDelete = (commentId) => {
    if (window.confirm("정말 이 댓글을 삭제하시겠습니까?")) {
      // TODO: 댓글 삭제 API 호출
      console.log("댓글 삭제:", commentId);
      alert("댓글 삭제 기능은 곧 구현될 예정입니다.");
    }
  };

  // 답글 수정 핸들러
  const handleReplyEdit = (replyId) => {
    // TODO: 답글 수정 기능 구현
    console.log("답글 수정:", replyId);
    alert("답글 수정 기능은 곧 구현될 예정입니다.");
  };

  // 답글 삭제 핸들러
  const handleReplyDelete = (replyId) => {
    if (window.confirm("정말 이 답글을 삭제하시겠습니까?")) {
      // TODO: 답글 삭제 API 호출
      console.log("답글 삭제:", replyId);
      alert("답글 삭제 기능은 곧 구현될 예정입니다.");
    }
  };

  // 전달받은 post 객체에서 데이터 매핑
  const getImagesFromPost = () => {
    if (post.images && Array.isArray(post.images) && post.images.length > 0) {
      // PostImageResponse 배열인 경우
      return post.images
        .map((img) => {
          if (typeof img === "string") return img;
          return img.imageUrl || img.url || img;
        })
        .filter(Boolean); // null/undefined 제거
    }
    // thumbnailUrl이 있는 경우
    if (source?.thumbnailUrl) {
      return [source.thumbnailUrl];
    }
    return [];
  };

  const postData = useMemo(
    () => ({
      id: post.id,
      title: post.title || post.content || "제목 없음",
      author: post.authorName || post.nickname || "익명",
      authorNickname:
        post.authorNickname || post.nickname || post.authorName || "익명",
      authorId: post.userId,
      authorAvatar: post.authorAvatar || "#4442dd",
      date: formatDate(post.createdAt),
      likes: post.likes || 0,
      views: post.views || 0,
      category: post.category || "잡담",
      images: getImagesFromPost(),
      content: post.fullContent || post.content || "",
    }),
    [post]
  );

  // 디버깅: 현재 상태 확인
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
    console.log("  - postData.authorNickname:", postData.authorNickname);
    console.log("  - postData.authorId:", postData.authorId);

    const canEdit =
      isAuthenticated &&
      ((currentUserNickname &&
        postData.authorNickname &&
        currentUserNickname === postData.authorNickname) ||
        (currentUserId &&
          postData.authorId &&
          currentUserId === postData.authorId));
    console.log("  - 수정/삭제 버튼 표시 여부:", canEdit);
  }, [isAuthenticated, currentUserNickname, currentUserId, post, postData]);

  const comments = [
    {
      id: 1,
      authorName: "이영희",
      authorNickname: "이영희",
      content: "저도 최근에 다녀왔는데 정말 좋았어요!",
      likes: 5,
      replies: [
        {
          id: 11,
          authorName: "김철수",
          authorNickname: "김철수",
          content: "감사합니다! 어느 계절에 가셨나요?",
          likes: 2,
        },
      ],
    },
    {
      id: 2,
      authorName: "박민수",
      authorNickname: "박민수",
      content: "사진 공유해주시면 좋을 것 같아요!",
      likes: 3,
    },
  ];

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
              postData.category
            )}`}
          >
            {postData.category}
          </span>
        </div>
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-[32px] text-black flex-1">{postData.title}</h1>

          {/* 내가 쓴 글일 때만 수정/삭제 버튼 표시 */}
          {(() => {
            const canEdit =
              isAuthenticated &&
              ((currentUserNickname &&
                postData.authorNickname &&
                currentUserNickname === postData.authorNickname) ||
                (currentUserId &&
                  postData.authorId &&
                  currentUserId === postData.authorId));

            if (!canEdit) {
              console.log("CommunityDetail 수정/삭제 버튼 표시 안 함:", {
                isAuthenticated,
                currentUserNickname,
                postDataAuthorNickname: postData.authorNickname,
                nicknameMatch: currentUserNickname === postData.authorNickname,
                currentUserId,
                postDataAuthorId: postData.authorId,
                userIdMatch: currentUserId === postData.authorId,
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
            <button className="flex items-center gap-2 hover:text-[#4442dd] transition-colors">
              <Heart className="w-5 h-5 text-[#666]" />
              <span className="text-[#666]">{postData.likes}</span>
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
        {postData.images && postData.images.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            {postData.images.map((img, idx) => (
              <img
                key={idx}
                src={getImageUrl(img)}
                alt={`게시글 이미지 ${idx + 1}`}
                className="w-full h-[200px] object-cover rounded-lg"
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
        <div className="mb-6 bg-[#f5f5f5] rounded-lg p-4">
          <textarea
            placeholder="댓글을 입력하세요..."
            className="w-full p-3 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button className="px-6 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors">
              댓글 작성
            </button>
          </div>
        </div>

        {/* 댓글 리스트 */}
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id}>
              <div className="bg-[#f5f5f5] rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-black">{comment.authorName}</p>
                  <div className="flex items-center gap-3">
                    <button className="text-[14px] text-[#666] hover:text-[#4442dd] transition-colors cursor-pointer">
                      답글
                    </button>
                    {/* 내가 쓴 댓글일 때만 수정/삭제 표시 */}
                    {isAuthenticated &&
                      currentUserNickname === comment.authorNickname && (
                        <div className="flex items-center gap-2 text-[14px]">
                          <span
                            onClick={() => handleCommentEdit(comment.id)}
                            className="text-[#666] hover:text-[#4442dd] cursor-pointer transition-colors"
                          >
                            수정
                          </span>
                          <span className="text-[#dedede]">|</span>
                          <span
                            onClick={() => handleCommentDelete(comment.id)}
                            className="text-[#666] hover:text-red-500 cursor-pointer transition-colors"
                          >
                            삭제
                          </span>
                        </div>
                      )}
                  </div>
                </div>
                <p className="text-[#333] mb-2">{comment.content}</p>
                {/* 하트 버튼 (답글, 수정, 삭제 아래) */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={() => handleCommentLike(comment.id)}
                    className="flex items-center gap-1 hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        commentLikes[comment.id]
                          ? "fill-red-500 text-red-500"
                          : "fill-none text-[#666]"
                      }`}
                    />
                    <span
                      className={`text-[14px] transition-colors ${
                        commentLikes[comment.id]
                          ? "text-red-500 font-semibold"
                          : "text-[#666]"
                      }`}
                    >
                      {comment.likes + (commentLikes[comment.id] ? 1 : 0)}
                    </span>
                  </button>
                </div>
              </div>

              {/* 답글 */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 mt-2 space-y-2">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="bg-[#f5f5f5] rounded-lg p-4 border-l-4 border-[#4442dd]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-black">{reply.authorName}</p>
                        <div className="flex items-center gap-3">
                          {/* 내가 쓴 답글일 때만 수정/삭제 표시 */}
                          {isAuthenticated &&
                            currentUserNickname === reply.authorNickname && (
                              <div className="flex items-center gap-2 text-[14px]">
                                <span
                                  onClick={() => handleReplyEdit(reply.id)}
                                  className="text-[#666] hover:text-[#4442dd] cursor-pointer transition-colors"
                                >
                                  수정
                                </span>
                                <span className="text-[#dedede]">|</span>
                                <span
                                  onClick={() => handleReplyDelete(reply.id)}
                                  className="text-[#666] hover:text-red-500 cursor-pointer transition-colors"
                                >
                                  삭제
                                </span>
                              </div>
                            )}
                        </div>
                      </div>
                      <p className="text-[#333] mb-2">{reply.content}</p>
                      {/* 하트 버튼 (수정, 삭제 아래) */}
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleReplyLike(reply.id)}
                          className="flex items-center gap-1 hover:scale-110 transition-transform"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              replyLikes[reply.id]
                                ? "fill-red-500 text-red-500"
                                : "fill-none text-[#666]"
                            }`}
                          />
                          <span
                            className={`text-[14px] transition-colors ${
                              replyLikes[reply.id]
                                ? "text-red-500 font-semibold"
                                : "text-[#666]"
                            }`}
                          >
                            {reply.likes + (replyLikes[reply.id] ? 1 : 0)}
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
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

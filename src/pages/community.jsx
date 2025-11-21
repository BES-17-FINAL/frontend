import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CommunityList from "../components/community/CommunityList";
import { CommunityDetail } from "../components/community/CommunityDetail";
import { PostWriteModal } from "../components/community/PostWriteModal";
import Header from "../components/layout/Header";

const Community = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const postId = searchParams.get("postId");

  const [selectedPost, setSelectedPost] = useState(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [postCommentCounts, setPostCommentCounts] = useState({}); // 게시글별 댓글 수 저장

  // 게시글 작성 완료 후 목록 새로고침
  const handlePostCreated = () => {
    console.log("🟡 [3단계] handlePostCreated 호출됨");
    setRefreshTrigger((prev) => {
      const newValue = prev + 1;
      console.log("🟡 [3단계] refreshTrigger 변경:", prev, "->", newValue);
      return newValue;
    });
  };

  // URL 파라미터 변경 시 게시글 선택
  useEffect(() => {
    if (postId) {
    } else {
      // postId가 없으면 목록으로
      setSelectedPost(null);
    }
  }, [postId]);

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    const handlePopState = (event) => {
      // 브라우저 뒤로가기 버튼을 누르면 현재 URL 확인
      const currentPostId = new URLSearchParams(window.location.search).get(
        "postId"
      );
      if (!currentPostId && selectedPost) {
        // URL에서 postId가 제거되었으면 목록으로 이동
        setSelectedPost(null);
        setRefreshTrigger((prev) => prev + 1);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [selectedPost]);

  // 게시글 클릭 핸들러
  const handlePostClick = (post) => {
    setSelectedPost(post);
    // URL에 postId 추가
    setSearchParams({ postId: post.id.toString() });
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (postId) {
      setSearchParams({});
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      {selectedPost === null ? (
        <CommunityList
          onPostClick={handlePostClick}
          onWriteClick={() => setIsWriteModalOpen(true)}
          refreshTrigger={refreshTrigger}
          updatedPostCommentCount={postCommentCounts}
        />
      ) : (
        <CommunityDetail
          post={selectedPost}
          onBack={handleBack}
          onPostUpdated={(updatedPost) => {
            // 게시글 수정 또는 댓글 수 업데이트
            console.log("🟢 [Community] 게시글/댓글 수 업데이트:", updatedPost);

            // 댓글 수만 업데이트하는 경우 (댓글 로드 시)
            if (updatedPost.commentCount !== undefined && updatedPost.id) {
              // 댓글 수를 별도로 저장 (리스트에서 사용)
              setPostCommentCounts((prev) => ({
                ...prev,
                [updatedPost.id]: updatedPost.commentCount,
              }));

              // selectedPost의 댓글 수도 업데이트
              if (selectedPost && selectedPost.id === updatedPost.id) {
                setSelectedPost((prev) => ({
                  ...prev,
                  commentCount: updatedPost.commentCount,
                }));
              }

              // 게시글 수정이 아닌 경우 (댓글 수만 업데이트) 목록 새로고침은 하지 않음
              if (!updatedPost.title && !updatedPost.content) {
                return;
              }
            }

            // 게시글 수정인 경우
            if (updatedPost.title || updatedPost.content) {
              // 백엔드에서 받은 PostResponse를 프론트엔드 형식으로 변환
              const transformedPost = {
                ...selectedPost,
                title: updatedPost.title,
                content: updatedPost.content,
                fullContent: updatedPost.content,
                category: updatedPost.category,
                images: updatedPost.images || [],
                thumbnailUrl: updatedPost.thumbnailUrl,
                // 기존 필드 유지
                id: updatedPost.id || selectedPost.id,
                authorName: updatedPost.nickname || selectedPost.authorName,
                authorNickname:
                  updatedPost.nickname || selectedPost.authorNickname,
                userId: updatedPost.userId || selectedPost.userId,
                likes: updatedPost.likeCount || selectedPost.likes,
                views: updatedPost.viewCount || selectedPost.views,
                createdAt: updatedPost.createdAt || selectedPost.createdAt,
                // 댓글 수 업데이트 (상세 페이지에서 계산한 값)
                commentCount:
                  updatedPost.commentCount !== undefined
                    ? updatedPost.commentCount
                    : selectedPost.commentCount,
              };

              setSelectedPost(transformedPost);

              // 댓글 수를 별도로 저장 (리스트에서 사용)
              if (
                updatedPost.commentCount !== undefined &&
                transformedPost.id
              ) {
                setPostCommentCounts((prev) => ({
                  ...prev,
                  [transformedPost.id]: updatedPost.commentCount,
                }));
              }

              // 목록도 새로고침 (목록으로 돌아갔을 때 수정된 내용이 보이도록)
              setRefreshTrigger((prev) => prev + 1);
            }
          }}
        />
      )}

      {/* 게시글 작성 모달 */}
      {isWriteModalOpen && (
        <PostWriteModal
          onClose={() => setIsWriteModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default Community;

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
    console.log("🟡 [Community] 게시글 작성 완료 -> 목록 새로고침");
    setRefreshTrigger((prev) => prev + 1);
  };

  // URL 파라미터 변경 시 게시글 선택 상태 동기화
  useEffect(() => {
    if (!postId) {
      // postId가 없으면 목록으로 (모달 닫기)
      setSelectedPost(null);
    }
  }, [postId]);

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    const handlePopState = () => {
      const currentPostId = new URLSearchParams(window.location.search).get(
        "postId"
      );
      if (!currentPostId && selectedPost) {
        setSelectedPost(null);
        // 상세에서 목록으로 돌아올 때 데이터 최신화가 필요하다면 아래 주석 해제
        // setRefreshTrigger((prev) => prev + 1);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [selectedPost]);

  // 게시글 클릭 핸들러 (목록 -> 상세)
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setSearchParams({ postId: post.id.toString() });
  };

  // 뒤로가기 핸들러 (상세 -> 목록)
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
            // 게시글 수정 또는 댓글 수 업데이트 시 호출됨
            console.log("🟢 [Community] 게시글/댓글 업데이트 감지:", updatedPost);

            // 1. 댓글 수 업데이트 처리
            if (updatedPost.commentCount !== undefined && updatedPost.id) {
              // 리스트 컴포넌트에 전달할 댓글 수 상태 업데이트
              setPostCommentCounts((prev) => ({
                ...prev,
                [updatedPost.id]: updatedPost.commentCount,
              }));

              // 현재 보고 있는 상세 게시글 상태도 업데이트
              if (selectedPost && selectedPost.id === updatedPost.id) {
                setSelectedPost((prev) => ({
                  ...prev,
                  commentCount: updatedPost.commentCount,
                }));
              }
            }

            // 2. 게시글 내용(제목, 본문 등) 수정 처리
            if (updatedPost.title || updatedPost.content) {
              // 상세 페이지의 현재 포스트 정보 업데이트
              const transformedPost = {
                ...selectedPost,
                ...updatedPost, // 업데이트된 필드 덮어쓰기
                // 필수 필드 안전 처리
                id: updatedPost.id || selectedPost.id,
                authorName: updatedPost.nickname || selectedPost.authorName,
                authorNickname: updatedPost.nickname || selectedPost.authorNickname,
                userId: updatedPost.userId || selectedPost.userId,
              };

              setSelectedPost(transformedPost);

              // 목록 데이터도 갱신되도록 트리거 (제목 등이 바뀌었으므로)
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

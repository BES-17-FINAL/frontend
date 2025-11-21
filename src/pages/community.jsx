import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CommunityList from '../components/community/CommunityList';
import { CommunityDetail } from '../components/community/CommunityDetail';
import { PostWriteModal } from '../components/community/PostWriteModal';
import Header from "../components/layout/Header";

const Community = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const postId = searchParams.get('postId');
  
  const [selectedPost, setSelectedPost] = useState(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 게시글 작성 완료 후 목록 새로고침
  const handlePostCreated = () => {
    console.log('🟡 [3단계] handlePostCreated 호출됨');
    setRefreshTrigger(prev => {
      const newValue = prev + 1;
      console.log('🟡 [3단계] refreshTrigger 변경:', prev, '->', newValue);
      return newValue;
    });
  };

  // URL 파라미터 변경 시 게시글 선택
  useEffect(() => {
    if (postId) {
      // postId가 있으면 해당 게시글을 찾아서 선택
      // 실제로는 CommunityList에서 게시글을 클릭할 때 URL을 변경하므로
      // 여기서는 URL만 확인하고, 실제 게시글 데이터는 CommunityList에서 전달받음
    } else {
      // postId가 없으면 목록으로
      setSelectedPost(null);
    }
  }, [postId]);

  // 게시글 클릭 핸들러
  const handlePostClick = (post) => {
    setSelectedPost(post);
    // URL에 postId 추가 (뒤로가기 지원)
    setSearchParams({ postId: post.id.toString() });
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    // URL에서 postId 제거 (목록으로)
    setSearchParams({});
    setSelectedPost(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <Header/>

      {/* Main Content */}
      {selectedPost === null ? (
        <CommunityList  
          onPostClick={handlePostClick}
          onWriteClick={() => setIsWriteModalOpen(true)}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <CommunityDetail 
          post={selectedPost} 
          onBack={handleBack}
          onPostUpdated={(updatedPost) => {
            // 수정된 게시글로 selectedPost 업데이트
            console.log('🟢 [Community] 게시글 수정 완료, selectedPost 업데이트:', updatedPost);
            
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
              authorNickname: updatedPost.nickname || selectedPost.authorNickname,
              userId: updatedPost.userId || selectedPost.userId,
              likes: updatedPost.likeCount || selectedPost.likes,
              views: updatedPost.viewCount || selectedPost.views,
              createdAt: updatedPost.createdAt || selectedPost.createdAt,
            };
            
            setSelectedPost(transformedPost);
            
            // 목록도 새로고침 (목록으로 돌아갔을 때 수정된 내용이 보이도록)
            setRefreshTrigger(prev => prev + 1);
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
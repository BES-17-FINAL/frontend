import React, { useState } from "react";
import CommunityList from '../components/community/CommunityList';
import { CommunityDetail } from '../components/community/CommunityDetail';
import { PostWriteModal } from '../components/community/PostWriteModal';

const Community = () => {
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

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <header className="py-4 px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-lg">TH</div>
          <div>
            <h1 className="text-lg font-semibold">Travel Hub</h1>
            <p className="text-xs text-gray-500">지역별 관광정보 한눈에</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {selectedPost === null ? (
        <CommunityList  
          onPostClick={setSelectedPost}
          onWriteClick={() => setIsWriteModalOpen(true)}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <CommunityDetail 
          post={selectedPost} 
          onBack={() => {
            // 목록으로 돌아갈 때 목록 새로고침
            setSelectedPost(null);
            setRefreshTrigger(prev => prev + 1);
          }}
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
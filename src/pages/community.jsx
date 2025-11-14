import React, { useState } from "react";
import CommunityList from '../components/community/CommunityList';
import { CommunityDetail } from '../components/community/CommunityDetail';
import { PostWriteModal } from '../components/community/PostWriteModal';

const Community = () => {
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
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
      {selectedPostId === null ? (
        <CommunityList  onPostClick={setSelectedPostId}
          onWriteClick={() => setIsWriteModalOpen(true)}
          />
      ) : (
        <CommunityDetail 
          postId={selectedPostId} 
          onBack={() => setSelectedPostId(null)} 
        />
      )}

      {/* 게시글 작성 모달 */}
      {isWriteModalOpen && (
        <PostWriteModal onClose={() => setIsWriteModalOpen(false)} />
      )}
    </div>
  );
};

export default Community;
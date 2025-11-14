import { Heart } from 'lucide-react';
import React, { useState } from 'react';

const CommunityList = ({ onPostClick, onWriteClick }) => {

  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const posts = [
    {
      id: 1,
      authorName: '김철수',
      authorAvatar: '#4442dd',
      content: '경복궁 정말 멋있었어요! 근정전이 웅장하고 아름다웠습니다.',
      likes: 24,
      rating: 5,
      category: '꿀팁',
      commentCount: 12,
      views: 156,
      hasImage: true,
    },
    {
      id: 2,
      authorName: '이영희',
      authorAvatar: '#adf382',
      content: '남산타워에서 본 야경이 정말 환상적이었습니다. 추천합니다!',
      likes: 18,
      category: '잡담',
      commentCount: 8,
      views: 98,
    },
    {
      id: 3,
      authorName: '박민수',
      authorAvatar: '#ff6b6b',
      content: '제주도 여행 다녀왔는데 날씨도 좋고 경치가 너무 좋았어요.',
      likes: 32,
      category: '질문',
      commentCount: 15,
      views: 203,
      hasImage: true,
    },
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case '잡담': return 'bg-[#adf382] text-black';
      case '질문': return 'bg-[#4442dd] text-white';
      case '꿀팁': return 'bg-[#ff6b6b] text-white';
      default: return 'bg-[#dedede] text-black';
    }
  };

  const isCategorySelected = (button) => {
    // 카테고리 선택 상태 관리 로직 구현 예정
    if (button === selectedCategory) return "px-4 py-2 bg-[#4442dd] text-white rounded-lg";
    return "px-4 py-2 bg-white border-2 border-[#dedede] text-black rounded-lg hover:border-[#4442dd] transition-colors";
  };


  const handleSearch = () => {
    console.log('Searching for:', search);
    // 검색 기능 구현 예정
  };
  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      {/* 검색바와 버튼 */}
      <div className="mb-8">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="flex-1 h-[43px] px-4 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] transition-colors"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="bg-[#4442dd] hover:bg-[#3331cc] px-8 h-[43px] text-white rounded-lg transition-colors"
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
          <button
            id='all-button'
            className={isCategorySelected('전체')}
            onClick={() => setSelectedCategory('전체')}
          >전체</button>
          <button
            id='chat-button'
            className={isCategorySelected('잡담')}
            onClick={() => setSelectedCategory('잡담')}
          >잡담</button>
          <button
            id='question-button'
            className={isCategorySelected('질문')}
            onClick={() => setSelectedCategory('질문')}
          >질문</button>
          <button
            id='tip-button'
            className={isCategorySelected('꿀팁')}
            onClick={() => setSelectedCategory('꿀팁')}
          >꿀팁</button>
        </div>
        <select className="px-4 py-2 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd]">
          <option>최신순</option>
          <option>인기순</option>
          <option>조회순</option>
          <option>댓글순</option>
        </select>
      </div>

      {/* 게시글 리스트 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            onClick={() => onPostClick(post.id)}
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-[12px] ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <p className="text-black">{post.authorName}</p>
                  {post.rating && (
                    <span className="text-[14px] text-[#666]">⭐ {post.rating}/5</span>
                  )}
                </div>
                <p className="text-[#333] line-clamp-2 mb-3">{post.content}</p>
                <div className="flex items-center gap-4 text-[14px] text-[#666]">
                  <span>💬 {post.commentCount}</span>
                  <span>👁️ {post.views}</span>
                  <span>❤️ {post.likes}</span>
                  {post.hasImage && <span>📷</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <button className="px-3 py-1 border-2 border-[#dedede] rounded hover:border-[#4442dd] transition-colors">
          ‹
        </button>
        <button className="px-3 py-1 bg-[#4442dd] text-white rounded">1</button>
        <button className="px-3 py-1 border-2 border-[#dedede] rounded hover:border-[#4442dd] transition-colors">2</button>
        <button className="px-3 py-1 border-2 border-[#dedede] rounded hover:border-[#4442dd] transition-colors">3</button>
        <button className="px-3 py-1 border-2 border-[#dedede] rounded hover:border-[#4442dd] transition-colors">
          ›
        </button>
      </div>
    </div>
  );
}

export default CommunityList ;
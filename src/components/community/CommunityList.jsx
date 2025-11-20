import { Heart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../services/api';

const CommunityList = ({ onPostClick, onWriteClick, refreshTrigger }) => {

  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchType, setSearchType] = useState('TITLE'); // 검색 타입 상태
  const [posts, setPosts] = useState([]); // 게시글 목록 상태
  const [loading, setLoading] = useState(false); // 로딩 상태

  // PostSearchType - 일반적인 검색 타입들
  const POST_SEARCH_TYPES = {
    TITLE: '제목',
    CONTENT: '내용',
    AUTHOR: '작성자',
    TITLE_CONTENT: '제목+내용',
  };

  // 카테고리 Enum → 한글 변환
  const categoryToKorean = (category) => {
    const map = {
      'CHAT': '잡담',
      'QUESTION': '질문',
      'TIP': '꿀팁'
    };
    return map[category] || category || '잡담';
  };

  // 게시글 목록 가져오기 함수
  const fetchPosts = async () => {
    setLoading(true);
    
    // 테스트 데이터 (백엔드 게시글이 없을 때 보여줄 기본 게시글)
    const defaultPosts = [
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
        thumbnailUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop',
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
        thumbnailUrl: null,
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
        thumbnailUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&h=300&fit=crop',
      },
    ];
    
    try {
      console.log('🔵 [4단계] 게시글 목록 요청 시작');
      
      // 백엔드 API 호출
      const response = await api.get('/api/posts', {
        params: {
          page: 0,
          size: 100 // 임시로 많은 수 가져오기
        }
      });
      
      console.log('🟢 [5단계] 게시글 목록 응답 받음:', response);
      console.log('🟢 [5단계] 응답 데이터 전체:', response.data);
      console.log('🟢 [5단계] 응답 데이터 타입:', typeof response.data);
      console.log('🟢 [5단계] 응답 데이터 JSON:', JSON.stringify(response.data, null, 2));
      console.log('🟢 [5단계] 응답 상태 코드:', response.status);
      console.log('🟢 [5단계] 응답 헤더:', response.headers);
      console.log('🟢 [5단계] 요청 URL:', response.config?.url);
      console.log('🟢 [5단계] 요청 baseURL:', response.config?.baseURL);
      
      // 백엔드 응답 형식에 맞게 변환
      let backendPosts = [];
      
      console.log('🟡 [6단계] 응답 데이터 파싱 시작');
      console.log('🟡 [6단계] response.data:', response.data);
      console.log('🟡 [6단계] response.data.content:', response.data?.content);
      console.log('🟡 [6단계] Array.isArray(response.data):', Array.isArray(response.data));
      
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        // 백엔드에서 Page<PostResponse>로 반환하는 경우 (content 배열)
        console.log('🟡 [6단계] Page.content 배열로 파싱, 개수:', response.data.content.length);
        backendPosts = response.data.content.map(post => ({
          id: post.id,
          authorName: post.nickname || '익명',
          authorNickname: post.nickname || '익명', // 작성자 닉네임 추가
          authorAvatar: '#4442dd', // 기본값, 나중에 사용자 아바타 추가 가능
          content: post.title || '', // 제목을 content로 표시 (또는 title + content 결합 가능)
          title: post.title || '', // 제목도 별도로 저장
          fullContent: post.content || '', // 전체 내용
          likes: post.likeCount || 0,
          isLiked: post.isLiked || false, // 좋아요 상태 추가
          rating: null, // rating 필드는 백엔드에 없음
          category: categoryToKorean(post.category), // Enum을 한글로 변환
          commentCount: post.commentCount || 0,
          views: post.viewCount || 0,
          hasImage: !!post.thumbnailUrl || (post.images && post.images.length > 0),
          thumbnailUrl: post.thumbnailUrl || (post.images && post.images.length > 0 ? post.images[0].url : null),
          images: post.images || [], // 이미지 배열 추가
          createdAt: post.createdAt,
          userId: post.userId
        }));
      } else if (Array.isArray(response.data)) {
        // 백엔드에서 배열로 직접 반환하는 경우 (비정상적이지만 대비)
        console.log('🟡 [6단계] 직접 배열로 파싱, 개수:', response.data.length);
        backendPosts = response.data.map(post => ({
          id: post.id,
          authorName: post.nickname || '익명',
          authorNickname: post.nickname || '익명', // 작성자 닉네임 추가
          authorAvatar: '#4442dd',
          content: post.title || '',
          title: post.title || '',
          fullContent: post.content || '',
          likes: post.likeCount || 0,
          isLiked: post.isLiked || false, // 좋아요 상태 추가
          rating: null,
          category: categoryToKorean(post.category),
          commentCount: post.commentCount || 0,
          views: post.viewCount || 0,
          hasImage: !!post.thumbnailUrl || (post.images && post.images.length > 0),
          thumbnailUrl: post.thumbnailUrl || (post.images && post.images.length > 0 ? post.images[0].url : null),
          images: post.images || [], // 이미지 배열 추가
          createdAt: post.createdAt,
          userId: post.userId
        }));
      }
      
      console.log('🟢 [7단계] 변환된 백엔드 게시글:', backendPosts);
      console.log('🟢 [7단계] 백엔드 게시글 개수:', backendPosts.length);
      
      // 백엔드 게시글이 있으면 백엔드 데이터만 사용, 없으면 테스트 데이터 사용
      if (backendPosts.length > 0) {
        console.log('✅ [8단계] 백엔드 게시글 사용:', backendPosts.length, '개');
        console.log('✅ [8단계] 표시할 게시글들:', backendPosts.map(p => ({ id: p.id, title: p.content })));
        setPosts(backendPosts);
      } else {
        console.log('⚠️ [8단계] 백엔드 게시글이 없어 테스트 데이터 사용');
        setPosts(defaultPosts);
      }
    } catch (error) {
      console.error('게시글 목록 가져오기 실패:', error);
      console.error('에러 상세:', error.response?.data);
      // 에러 발생 시 테스트 데이터 사용
      setPosts(defaultPosts);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 게시글 목록 가져오기
  useEffect(() => {
    fetchPosts();
  }, []);

  // refreshTrigger가 변경되면 목록 새로고침
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 [새로고침] refreshTrigger 변경:', refreshTrigger);
      console.log('🔄 [새로고침] 게시글 목록 다시 가져오기 시작');
      fetchPosts();
    }
  }, [refreshTrigger]);

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
    console.log('Searching for:', search, 'Type:', searchType);
    // 검색 기능 구현 예정
    // searchType과 search를 백엔드 API에 전달
  };
  return (
    <div className="max-w-[800px] mx-auto px-6 py-8">
      {/* 검색바와 버튼 */}
      <div className="mb-8">
        <div className="flex gap-3 mb-4">
          {/* 검색 타입 선택 (왼쪽) */}
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
            className="flex-1 h-[43px] px-4 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] transition-colors"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          {/* 검색 버튼 */}
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
        {loading && (
          <div className="text-center py-8 text-[#666]">게시글을 불러오는 중...</div>
        )}
        {!loading && posts.length === 0 && (
          <div className="text-center py-8 text-[#666]">작성된 게시글이 없습니다.</div>
        )}
        {!loading && posts.map((post) => (
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

              {/* 썸네일 이미지 (오른쪽) - 이미지가 있을 때만 표시 */}
              {post.thumbnailUrl && (
                <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(post.thumbnailUrl)}
                    alt="게시글 썸네일"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('이미지 로드 실패:', post.thumbnailUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
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
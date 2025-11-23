import { Heart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../../services/api';

const CommunityList = ({ onPostClick, onWriteClick, refreshTrigger, updatedViewCounts = {} }) => {

  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchType, setSearchType] = useState('TITLE_CONTENT'); // 검색 타입 상태
  const [sortType, setSortType] = useState('LATEST'); // 정렬 타입 상태
  const [posts, setPosts] = useState([]); // 게시글 목록 상태
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [failedImagePosts, setFailedImagePosts] = useState(new Set()); // 이미지 로드 실패한 게시글 ID들
  const [currentKeyword, setCurrentKeyword] = useState(''); // 현재 검색 키워드
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 (0부터 시작)
  const [totalPages, setTotalPages] = useState(0); // 전체 페이지 수
  const [totalElements, setTotalElements] = useState(0); // 전체 게시글 수
  const pageSize = 10; // 페이지당 게시글 수

  // PostSearchType - 일반적인 검색 타입들
  const POST_SEARCH_TYPES = {
    TITLE: '제목',
    CONTENT: '내용',
    NICKNAME: '작성자',
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
    
    try {
      const categoryParam = selectedCategory !== '전체' 
        ? (selectedCategory === '잡담' ? 'CHAT' : selectedCategory === '질문' ? 'QUESTION' : 'TIP') 
        : undefined;
      
      console.log('🔵 [API 호출] 게시글 목록 요청 시작');
      console.log('🔵 [API 호출] 카테고리:', selectedCategory, '→', categoryParam);
      console.log('🔵 [API 호출] 검색어:', currentKeyword);
      console.log('🔵 [API 호출] 검색 타입:', searchType);
      
      // 백엔드 API 호출
      const params = {
        page: currentPage,
        size: pageSize,
        sortType: sortType // 정렬 타입 추가
      };
      if (categoryParam) {
        params.category = categoryParam;
      }
      if (currentKeyword && currentKeyword.trim()) {
        params.keyword = currentKeyword.trim();
        params.searchType = searchType;
      }
      
      console.log('🔵 [API 호출] 요청 파라미터:', params);
      
      const response = await api.get('/api/posts', { params });
      
      console.log('🟢 [API 응답] 상태 코드:', response.status);
      console.log('🟢 [API 응답] response.data:', response.data);
      
      // 페이징 정보 추출
      if (response.data) {
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        console.log('📄 [페이징] 현재 페이지:', response.data.number, '/ 전체 페이지:', response.data.totalPages, '/ 전체 게시글:', response.data.totalElements);
      }
      
      // 이미지 URL 디버깅
      if (response.data?.content && Array.isArray(response.data.content)) {
        response.data.content.forEach((post, idx) => {
          if (post.images && post.images.length > 0) {
            console.log(`🖼️ [이미지 디버깅] 게시글 ${post.id}:`, {
              thumbnailUrl: post.thumbnailUrl,
              images: post.images.map(img => typeof img === 'string' ? img : (img?.imageUrl || img?.url)),
              imagesCount: post.images.length
            });
          }
        });
      }
      
      // 백엔드 응답 형식에 맞게 변환
      let backendPosts = [];
      
      if (response.data && response.data.content && Array.isArray(response.data.content)) {
        // 백엔드에서 Page<PostResponse>로 반환하는 경우 (content 배열)
        console.log('🟡 [파싱] Page.content 배열로 파싱 시작, 개수:', response.data.content.length);
        console.log('🟡 [파싱] 첫 번째 게시글 샘플:', response.data.content[0]);
        
        backendPosts = response.data.content.map((post, index) => {
          const mapped = {
            id: post.id,
            authorName: post.nickname || '익명',
            authorNickname: post.nickname || '익명',
            authorAvatar: '#4442dd',
            content: post.title || '',
            title: post.title || '',
            fullContent: post.content || '',
            likes: post.likeCount || 0,
            isLiked: post.isLiked || false,
            rating: null,
            category: categoryToKorean(post.category),
            commentCount: post.commentCount || 0,
            views: updatedViewCounts[post.id] !== undefined ? updatedViewCounts[post.id] : (post.viewCount || 0), // 업데이트된 조회수가 있으면 우선 사용
            hasImage: (() => {
              // images 배열에 유효한 이미지가 있는지 확인 (가장 확실한 방법)
              // 백엔드에서 이미지가 없으면 images 배열이 비어있음
              if (post.images && Array.isArray(post.images) && post.images.length > 0) {
                // 배열에 실제로 유효한 이미지 URL이 있는지 확인
                const validImages = post.images.filter(img => {
                  const url = typeof img === 'string' ? img : (img?.imageUrl || img?.url || img);
                  return url && typeof url === 'string' && url.trim() !== '' && url.trim().toLowerCase() !== 'null';
                });
                return validImages.length > 0;
              }
              return false;
            })(),
            thumbnailUrl: (() => {
              // 이미지가 실제로 있는지 먼저 확인
              if (!post.images || !Array.isArray(post.images) || post.images.length === 0) {
                return null;
              }
              const thumbUrl = post.thumbnailUrl || (post.images && post.images.length > 0 ? (post.images[0].imageUrl || post.images[0].url) : null);
              // 유효한 URL인지 확인
              if (!thumbUrl || typeof thumbUrl !== 'string' || thumbUrl.trim() === '' || thumbUrl.trim().toLowerCase() === 'null') {
                return null;
              }
              // 이미 완전한 URL인 경우 그대로 사용, 상대 경로인 경우만 변환
              try {
                const finalUrl = getImageUrl(thumbUrl);
                // URL이 유효한지 추가 검증 (http:// 또는 https://로 시작하는지 확인)
                if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
                  return finalUrl;
                }
              } catch (error) {
                console.warn('이미지 URL 변환 실패:', thumbUrl, error);
              }
              return null;
            })(),
            images: (post.images || []).map(img => {
              const url = typeof img === 'string' ? img : (img.imageUrl || img.url || img);
              return url && url.trim() !== '' ? getImageUrl(url) : null;
            }).filter(url => url && url !== null),
            createdAt: post.createdAt,
            userId: post.userId
          };
          if (index === 0) {
            console.log('🟡 [파싱] 첫 번째 게시글 매핑 결과:', mapped);
          }
          return mapped;
        });
      } else if (Array.isArray(response.data)) {
        // 백엔드에서 배열로 직접 반환하는 경우
        console.log('🟡 [파싱] 직접 배열로 파싱, 개수:', response.data.length);
        backendPosts = response.data.map(post => ({
          id: post.id,
          authorName: post.nickname || '익명',
          authorNickname: post.nickname || '익명',
          authorAvatar: '#4442dd',
          content: post.title || '',
          title: post.title || '',
          fullContent: post.content || '',
          likes: post.likeCount || 0,
          isLiked: post.isLiked || false,
          rating: null,
          category: categoryToKorean(post.category),
          commentCount: post.commentCount || 0,
            views: updatedViewCounts[post.id] !== undefined ? updatedViewCounts[post.id] : (post.viewCount || 0), // 업데이트된 조회수가 있으면 우선 사용
            hasImage: (() => {
              // images 배열에 유효한 이미지가 있는지 확인 (가장 확실한 방법)
              // 백엔드에서 이미지가 없으면 images 배열이 비어있음
              if (post.images && Array.isArray(post.images) && post.images.length > 0) {
                // 배열에 실제로 유효한 이미지 URL이 있는지 확인
                const validImages = post.images.filter(img => {
                  const url = typeof img === 'string' ? img : (img?.imageUrl || img?.url || img);
                  return url && typeof url === 'string' && url.trim() !== '' && url.trim().toLowerCase() !== 'null';
                });
                return validImages.length > 0;
              }
              return false;
            })(),
            thumbnailUrl: (() => {
              // 이미지가 실제로 있는지 먼저 확인
              if (!post.images || !Array.isArray(post.images) || post.images.length === 0) {
                return null;
              }
              const thumbUrl = post.thumbnailUrl || (post.images && post.images.length > 0 ? (post.images[0].imageUrl || post.images[0].url) : null);
              // 유효한 URL인지 확인
              if (!thumbUrl || typeof thumbUrl !== 'string' || thumbUrl.trim() === '' || thumbUrl.trim().toLowerCase() === 'null') {
                return null;
              }
              // 이미 완전한 URL인 경우 그대로 사용, 상대 경로인 경우만 변환
              try {
                const finalUrl = getImageUrl(thumbUrl);
                // URL이 유효한지 추가 검증 (http:// 또는 https://로 시작하는지 확인)
                if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
                  return finalUrl;
                }
              } catch (error) {
                console.warn('이미지 URL 변환 실패:', thumbUrl, error);
              }
              return null;
            })(),
            images: (post.images || []).map(img => {
              const url = typeof img === 'string' ? img : (img.imageUrl || img.url || img);
              return url && url.trim() !== '' ? getImageUrl(url) : null;
            }).filter(url => url && url !== null),
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          userId: post.userId
        }));
      } else {
        console.warn('⚠️ [파싱] 예상하지 못한 응답 형식:', response.data);
        console.warn('⚠️ [파싱] response.data 키들:', response.data ? Object.keys(response.data) : 'null');
      }
      
      console.log('✅ [결과] 변환된 게시글 개수:', backendPosts.length);
      console.log('✅ [결과] 변환된 게시글 목록:', backendPosts);
      console.log('✅ [결과] posts state에 설정할 데이터:', backendPosts);
      
      setPosts(backendPosts);
      
      console.log('✅ [완료] posts state 업데이트 완료');
    } catch (error) {
      console.error('❌ [에러] 게시글 목록 가져오기 실패');
      console.error('❌ [에러] 에러 객체:', error);
      console.error('❌ [에러] 에러 메시지:', error.message);
      console.error('❌ [에러] 에러 응답:', error.response);
      console.error('❌ [에러] 에러 응답 데이터:', error.response?.data);
      console.error('❌ [에러] 에러 상태 코드:', error.response?.status);
      console.error('❌ [에러] 에러 요청 URL:', error.config?.url);
      console.error('❌ [에러] 에러 요청 baseURL:', error.config?.baseURL);
      // 에러 발생 시 빈 배열로 설정 (샘플 데이터 표시 안 함)
      setPosts([]);
    } finally {
      setLoading(false);
      console.log('✅ [완료] 로딩 상태 해제');
    }
  };

  // posts 상태 변경 디버깅
  useEffect(() => {
    console.log('📊 [상태] posts 상태 변경됨, 개수:', posts.length);
    console.log('📊 [상태] posts 내용:', posts);
  }, [posts]);

  // 컴포넌트 마운트 시 및 카테고리/검색어/정렬/페이지 변경 시 게시글 목록 가져오기
  useEffect(() => {
    console.log('🔄 [useEffect] fetchPosts 호출, selectedCategory:', selectedCategory, 'currentKeyword:', currentKeyword, 'sortType:', sortType, 'currentPage:', currentPage);
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentKeyword, sortType, currentPage]);
  
  // 카테고리나 검색어가 변경되면 첫 페이지로 리셋
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, currentKeyword, sortType]);

  // refreshTrigger가 변경되면 목록 새로고침 (첫 페이지로)
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 [새로고침] refreshTrigger 변경:', refreshTrigger);
      console.log('🔄 [새로고침] updatedViewCounts:', updatedViewCounts);
      setCurrentPage(0);
      fetchPosts();
    }
  }, [refreshTrigger]);

  // updatedViewCounts가 변경되면 해당 게시글의 조회수만 업데이트 (전체 새로고침 없이)
  useEffect(() => {
    if (Object.keys(updatedViewCounts).length > 0) {
      console.log('🔄 [조회수 업데이트] updatedViewCounts 변경:', updatedViewCounts);
      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (updatedViewCounts[post.id] !== undefined) {
            console.log('🔄 [조회수 업데이트] 게시글 ID:', post.id, '이전 조회수:', post.views, '새 조회수:', updatedViewCounts[post.id]);
            return { ...post, views: updatedViewCounts[post.id] };
          }
          return post;
        });
      });
    }
  }, [updatedViewCounts]);
  
  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // 페이지 번호 배열 생성 (최대 5개 페이지 번호 표시)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const getCategoryColor = (category) => {
    // category가 한글이면 Enum으로 변환
    const categoryMap = {
      '잡담': 'CHAT',
      '질문': 'QUESTION',
      '꿀팁': 'TIP'
    };
    const categoryEnum = categoryMap[category] || category;
    
    switch (categoryEnum) {
      case 'CHAT': return 'bg-[#adf382] text-black';
      case 'QUESTION': return 'bg-yellow-400 text-black';
      case 'TIP': return 'bg-[#ff6b6b] text-white';
      default: return 'bg-[#dedede] text-black';
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    // 7일 이상이면 날짜 표시
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // 카테고리 탭 색상 가져오기 함수
  const getCategoryTabColor = (category) => {
    switch (category) {
      case '잡담': return 'bg-[#adf382] text-black';
      case '질문': return 'bg-yellow-400 text-black';
      case '꿀팁': return 'bg-[#ff6b6b] text-white';
      case '전체': return 'bg-[#4442dd] text-white';
      default: return 'bg-[#dedede] text-black';
    }
  };

  // 카테고리 탭 hover 색상 가져오기 함수
  const getCategoryTabHoverColor = (category) => {
    switch (category) {
      case '잡담': return 'hover:border-[#adf382]';
      case '질문': return 'hover:border-yellow-400';
      case '꿀팁': return 'hover:border-[#ff6b6b]';
      case '전체': return 'hover:border-[#4442dd]';
      default: return 'hover:border-[#dedede]';
    }
  };

  const isCategorySelected = (button) => {
    if (button === selectedCategory) {
      // 선택된 카테고리는 각 카테고리 색상으로 표시
      return `px-4 py-2 ${getCategoryTabColor(button)} rounded-lg`;
    }
    // 선택되지 않은 카테고리는 기본 스타일 + hover 색상
    return `px-4 py-2 bg-white border-2 border-[#dedede] text-black rounded-lg ${getCategoryTabHoverColor(button)} transition-colors`;
  };


  const handleSearch = () => {
    console.log('🔍 [검색] 검색 실행:', search, '타입:', searchType);
    // 검색 키워드를 설정하고 게시글 목록 새로고침
    setCurrentKeyword(search);
    // fetchPosts는 useEffect에서 currentKeyword 변경 시 자동 호출됨
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
                  {post.hasImage && !failedImagePosts.has(post.id) && <span>📷</span>}
                </div>
              </div>

              {/* 우측 영역: 썸네일과 시간 */}
              <div className="flex-shrink-0 flex flex-col items-end justify-between">
                {/* 썸네일 이미지 (위쪽) - 이미지가 있고 로드 실패하지 않았을 때만 표시 */}
                {post.thumbnailUrl && post.hasImage && !failedImagePosts.has(post.id) && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden mb-2">
                    <img
                      src={post.thumbnailUrl}
                      alt="게시글 썸네일"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // 이미지 로드 실패 시 조용히 처리
                        e.target.style.display = 'none';
                        // 이미지 로드 실패 시 해당 게시글의 카메라 아이콘 제거
                        setFailedImagePosts(prev => new Set(prev).add(post.id));
                        // 디버깅용 로그 (필요시 주석 해제)
                        // console.warn('이미지 로드 실패:', post.thumbnailUrl, '게시글 ID:', post.id);
                      }}
                    />
                  </div>
                )}
                {/* 시간 (우측 하단) */}
                <div className="text-[12px] text-[#999] text-right mt-auto">
                  {post.updatedAt && post.updatedAt !== post.createdAt 
                    ? `수정 ${formatDate(post.updatedAt)}`
                    : formatDate(post.createdAt)
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8 mb-8">
          {/* 이전 페이지 버튼 */}
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`px-3 py-1 border-2 rounded transition-colors ${
              currentPage === 0 
                ? 'border-[#dedede] text-[#999] cursor-not-allowed' 
                : 'border-[#dedede] hover:border-[#4442dd] hover:text-[#4442dd]'
            }`}
          >
            ‹
          </button>
          
          {/* 첫 페이지 */}
          {currentPage > 2 && totalPages > 5 && (
            <>
              <button 
                onClick={() => handlePageChange(0)}
                className="px-3 py-1 border-2 border-[#dedede] rounded hover:border-[#4442dd] transition-colors"
              >
                1
              </button>
              {currentPage > 3 && <span className="px-2 text-[#999]">...</span>}
            </>
          )}
          
          {/* 페이지 번호들 */}
          {getPageNumbers().map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 border-2 rounded transition-colors ${
                pageNum === currentPage
                  ? 'bg-[#4442dd] text-white border-[#4442dd]'
                  : 'border-[#dedede] hover:border-[#4442dd] hover:text-[#4442dd]'
              }`}
            >
              {pageNum + 1}
            </button>
          ))}
          
          {/* 마지막 페이지 */}
          {currentPage < totalPages - 3 && totalPages > 5 && (
            <>
              {currentPage < totalPages - 4 && <span className="px-2 text-[#999]">...</span>}
              <button 
                onClick={() => handlePageChange(totalPages - 1)}
                className="px-3 py-1 border-2 border-[#dedede] rounded hover:border-[#4442dd] transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
          
          {/* 다음 페이지 버튼 */}
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className={`px-3 py-1 border-2 rounded transition-colors ${
              currentPage >= totalPages - 1
                ? 'border-[#dedede] text-[#999] cursor-not-allowed' 
                : 'border-[#dedede] hover:border-[#4442dd] hover:text-[#4442dd]'
            }`}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}

export default CommunityList ;
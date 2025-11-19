import { Heart } from 'lucide-react';
import { Bookmark, Image as ImageIcon, Edit2, Trash2 } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import { PostWriteModal } from './PostWriteModal';
import api, { getImageUrl } from '../../services/api';

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

  // 게시글 데이터 상태 관리
  const [postData, setPostData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 조회수 증가 중복 방지용 ref (post.id를 키로 사용)
  const fetchedPostIdsRef = useRef(new Set());
  const viewCountIncrementedRef = useRef(new Set());
  const abortControllerRef = useRef(null);
  
  // 게시글 좋아요 상태 관리 (백엔드에서 받은 초기값 사용)
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [viewCount, setViewCount] = useState(post.views || 0);

  // 댓글 좋아요 상태 관리 (댓글 ID를 키로 사용)
  const [commentLikes, setCommentLikes] = useState({});
  // 답글 좋아요 상태 관리 (답글 ID를 키로 사용)
  const [replyLikes, setReplyLikes] = useState({});

  // 현재 사용자 정보 가져오기
  const { isAuthenticated, user } = useAuthStore();
  const currentUserNickname = useMemo(() => {
    if (user?.nickname) return user.nickname;
    const nickname = localStorage.getItem('nickname');
    console.log('🔵 [CommunityDetail] currentUserNickname:', nickname);
    return nickname;
  }, [user]);
  const currentUserId = useMemo(() => {
    if (user?.id) return user.id;
    const storedUser = localStorage.getItem('user');
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


  // 조회수 증가 API 호출 (한 번만, localStorage로 추적)
  const incrementViewCount = async () => {
    if (!post?.id) return;
    
    const postId = post.id;
    const storageKey = `post_view_${postId}`;
    
    // localStorage에서 이미 조회수 증가를 호출했는지 확인
    const hasIncremented = localStorage.getItem(storageKey);
    if (hasIncremented) {
      console.log('조회수 증가 이미 호출됨 (localStorage), 스킵:', postId);
      return;
    }
    
    // ref에서도 확인 (이중 체크)
    if (viewCountIncrementedRef.current.has(postId)) {
      console.log('조회수 증가 이미 호출됨 (ref), 스킵:', postId);
      return;
    }
    
    try {
      // 즉시 localStorage와 ref에 저장 (중복 방지)
      localStorage.setItem(storageKey, 'true');
      viewCountIncrementedRef.current.add(postId);
      
      await api.post(`/api/posts/${postId}/view`);
      console.log('조회수 증가 성공:', postId);
    } catch (error) {
      // AbortError는 무시 (요청 취소)
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('조회수 증가 요청 취소됨');
        return;
      }
      console.error('조회수 증가 실패:', error);
      // 실패 시 localStorage와 ref에서 제거하여 재시도 가능하도록
      localStorage.removeItem(storageKey);
      viewCountIncrementedRef.current.delete(postId);
    }
  };

  // 게시글 상세 정보 불러오기 (조회수 증가 없이)
  const fetchPostDetail = async () => {
    if (!post?.id) return;
    
    try {
      setIsLoading(true);
      // 조회수 증가 없이 데이터만 가져오기
      const response = await api.get(`/api/posts/${post.id}/data`);
      const updatedPost = response.data;
      
      console.log('🟢 [게시글 상세] 받은 데이터:', updatedPost);
      console.log('🟢 [게시글 상세] isLiked:', updatedPost.isLiked, '타입:', typeof updatedPost.isLiked);
      console.log('🟢 [게시글 상세] liked:', updatedPost.liked, '타입:', typeof updatedPost.liked);
      console.log('🟢 [게시글 상세] likeCount:', updatedPost.likeCount);
      console.log('🟢 [게시글 상세] 전체 키:', Object.keys(updatedPost));
      
      // 조회수 업데이트
      setViewCount(updatedPost.viewCount || 0);
      // 좋아요 상태 업데이트 (백엔드에서 받은 값으로 덮어쓰기)
      // Jackson이 isLiked를 liked로 직렬화할 수 있으므로 둘 다 확인
      const newIsLiked = updatedPost.isLiked === true || 
                        updatedPost.liked === true || 
                        updatedPost.isLiked === 'true' || 
                        updatedPost.liked === 'true';
      console.log('🟢 [게시글 상세] 변환된 isLiked:', newIsLiked);
      setIsLiked(!!newIsLiked); // 명시적으로 boolean으로 변환
      setLikeCount(updatedPost.likeCount || 0);
      
      // 전체 postData 업데이트
      setPostData(updatedPost);
    } catch (error) {
      console.error('❌ [게시글 상세] 정보 불러오기 실패:', error);
      console.error('❌ [게시글 상세] 에러 응답:', error.response?.data);
      console.error('❌ [게시글 상세] 에러 상태:', error.response?.status);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 조회수 증가 (한 번만) 및 게시글 상세 불러오기
  useEffect(() => {
    if (!post?.id) return;
    
    const postId = post.id;
    const storageKey = `post_view_${postId}`;
    
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 새로운 AbortController 생성
    abortControllerRef.current = new AbortController();
    
    const hasFetched = fetchedPostIdsRef.current.has(postId);
    // localStorage와 ref 모두 확인
    const hasIncrementedView = localStorage.getItem(storageKey) || viewCountIncrementedRef.current.has(postId);
    
    // 조회수 증가 (한 번만, 게시글당)
    if (!hasIncrementedView) {
      incrementViewCount();
    }
    
    // 게시글 상세 정보 불러오기
    if (!hasFetched) {
      fetchedPostIdsRef.current.add(postId);
      fetchPostDetail();
    } else {
      // 이미 조회한 게시글이면 조회수 증가 없이 데이터만 가져오기
      fetchPostDetail();
    }
    
    // cleanup: 컴포넌트 언마운트 시 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  // 게시글 좋아요 토글 함수
  const handleLikeClick = async () => {
    if (!post?.id) return;
    
    // 로그인 확인
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    // 낙관적 업데이트 (즉시 UI 업데이트)
    const previousLiked = isLiked;
    const previousCount = likeCount;
    
    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);
    
    try {
      console.log('🔵 [좋아요] API 호출 시작, postId:', post.id);
      // 백엔드 API 호출
      const response = await api.post(`/api/posts/${post.id}/like`);
      console.log('🟢 [좋아요] API 호출 성공:', response);
      
      // 성공 시 최신 데이터로 업데이트
      await fetchPostDetail();
      console.log('🟢 [좋아요] 데이터 업데이트 완료');
    } catch (error) {
      console.error('❌ [좋아요] 토글 실패:', error);
      console.error('❌ [좋아요] 에러 응답:', error.response?.data);
      console.error('❌ [좋아요] 에러 상태:', error.response?.status);
      console.error('❌ [좋아요] 에러 메시지:', error.message);
      
      // 실패 시 이전 상태로 복구
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '알 수 없는 오류';
      alert(`좋아요 처리에 실패했습니다.\n\n에러: ${errorMessage}`);
    }
  };

  // 댓글 좋아요 토글 함수
  const handleCommentLike = (commentId) => {
    setCommentLikes(prev => {
      const isLiked = prev[commentId] || false;
      return {
        ...prev,
        [commentId]: !isLiked
      };
    });
  };

  // 답글 좋아요 토글 함수
  const handleReplyLike = (replyId) => {
    setReplyLikes(prev => {
      const isLiked = prev[replyId] || false;
      return {
        ...prev,
        [replyId]: !isLiked
      };
    });
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch (e) {
      return dateString;
    }
  };

  // 수정 버튼 클릭 핸들러
  const handleEdit = () => {
    console.log('게시글 수정 모달 열기:', post.id);
    setIsEditModalOpen(true);
  };

  // 수정 완료 핸들러
  const handlePostUpdated = (updatedPost) => {
    console.log('🟢 [CommunityDetail] 게시글 수정 완료:', updatedPost);
    
    // 상위 컴포넌트에 수정된 게시글 전달
    if (onPostUpdated) {
      // Community 페이지에서 selectedPost를 업데이트하도록 콜백 호출
      onPostUpdated(updatedPost);
    }
    
    // 모달 닫기
    setIsEditModalOpen(false);
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      console.log('🔵 [삭제] 게시글 삭제 요청:', post.id);
      console.log('🔵 [삭제] 요청 URL:', `/api/posts/${post.id}`);
      
      // 삭제 API 호출
      const response = await api.delete(`/api/posts/${post.id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🟢 [삭제] 게시글 삭제 완료:', post.id);
      console.log('🟢 [삭제] 응답 상태:', response?.status);
      
      // 삭제 완료 알림
      alert('게시글이 삭제되었습니다.');
      
      // 목록으로 돌아가기
      onBack();
      
    } catch (error) {
      console.error('🔴 [삭제] 게시글 삭제 실패:', error);
      console.error('🔴 [삭제] 에러 응답:', error.response?.data);
      console.error('🔴 [삭제] 에러 상태 코드:', error.response?.status);
      
      // 에러 메시지 추출
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '알 수 없는 오류가 발생했습니다.';
      
      alert(`게시글 삭제에 실패했습니다.\n\n에러: ${errorMessage}\n\n상세 내용은 콘솔을 확인해주세요.`);
    } finally {
      setIsDeleting(false);
    }
  };

  // 댓글 수정 핸들러
  const handleCommentEdit = (commentId) => {
    // TODO: 댓글 수정 기능 구현
    console.log('댓글 수정:', commentId);
    alert('댓글 수정 기능은 곧 구현될 예정입니다.');
  };

  // 댓글 삭제 핸들러
  const handleCommentDelete = (commentId) => {
    if (window.confirm('정말 이 댓글을 삭제하시겠습니까?')) {
      // TODO: 댓글 삭제 API 호출
      console.log('댓글 삭제:', commentId);
      alert('댓글 삭제 기능은 곧 구현될 예정입니다.');
    }
  };

  // 답글 수정 핸들러
  const handleReplyEdit = (replyId) => {
    // TODO: 답글 수정 기능 구현
    console.log('답글 수정:', replyId);
    alert('답글 수정 기능은 곧 구현될 예정입니다.');
  };

  // 답글 삭제 핸들러
  const handleReplyDelete = (replyId) => {
    if (window.confirm('정말 이 답글을 삭제하시겠습니까?')) {
      // TODO: 답글 삭제 API 호출
      console.log('답글 삭제:', replyId);
      alert('답글 삭제 기능은 곧 구현될 예정입니다.');
    }
  };

  // getImagesFromPost 함수 정의
  const getImagesFromPost = (sourcePost = post) => {
    if (sourcePost.images && Array.isArray(sourcePost.images) && sourcePost.images.length > 0) {
      // PostImageResponse 배열인 경우
      return sourcePost.images.map(img => {
        if (typeof img === 'string') return img;
        return img.imageUrl || img.url || img;
      }).filter(Boolean); // null/undefined 제거
    }
    // thumbnailUrl이 있는 경우
    if (sourcePost.thumbnailUrl) {
      return [sourcePost.thumbnailUrl];
    }
    return [];
  };

  // postData 계산 (postData state가 있으면 우선 사용, 없으면 post prop 사용)
  const displayPostData = useMemo(() => {
    const source = postData || post;
    return {
      id: source.id,
      title: source.title || source.content || '제목 없음',
      author: source.authorName || source.nickname || '익명',
      authorNickname: source.authorNickname || source.nickname || source.authorName || '익명',
      authorId: source.userId,
      authorAvatar: source.authorAvatar || '#4442dd',
      date: formatDate(source.createdAt),
      likes: likeCount, // 상태에서 가져오기
      views: viewCount, // 상태에서 가져오기
      category: source.category || '잡담',
      images: getImagesFromPost(source),
      content: source.fullContent || source.content || '',
    };
  }, [postData, post, likeCount, viewCount]);

  // 디버깅: 현재 상태 확인
  useEffect(() => {
    console.log('🔵 [CommunityDetail] 디버깅 정보:');
    console.log('  - isAuthenticated:', isAuthenticated);
    console.log('  - currentUserNickname:', currentUserNickname);
    console.log('  - currentUserId:', currentUserId);
    console.log('  - post.authorNickname:', post?.authorNickname || post?.nickname);
    console.log('  - post.userId:', post?.userId);
    console.log('  - displayPostData.authorNickname:', displayPostData.authorNickname);
    console.log('  - displayPostData.authorId:', displayPostData.authorId);
    
    const canEdit = isAuthenticated && (
      (currentUserNickname && displayPostData.authorNickname && currentUserNickname === displayPostData.authorNickname) ||
      (currentUserId && displayPostData.authorId && currentUserId === displayPostData.authorId)
    );
    console.log('  - 수정/삭제 버튼 표시 여부:', canEdit);
  }, [isAuthenticated, currentUserNickname, currentUserId, post, displayPostData]);

  const comments = [
    {
      id: 1,
      authorName: '이영희',
      authorNickname: '이영희',
      content: '저도 최근에 다녀왔는데 정말 좋았어요!',
      likes: 5,
      replies: [
        {
          id: 11,
          authorName: '김철수',
          authorNickname: '김철수',
          content: '감사합니다! 어느 계절에 가셨나요?',
          likes: 2,
        },
      ],
    },
    {
      id: 2,
      authorName: '박민수',
      authorNickname: '박민수',
      content: '사진 공유해주시면 좋을 것 같아요!',
      likes: 3,
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
          <span className={`px-3 py-1 rounded text-[14px] ${getCategoryColor(displayPostData.category)}`}>
            {displayPostData.category}
          </span>
        </div>
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-[32px] text-black flex-1">{displayPostData.title}</h1>
          
          {/* 내가 쓴 글일 때만 수정/삭제 버튼 표시 */}
          {(() => {
            const canEdit = isAuthenticated && (
              (currentUserNickname && displayPostData.authorNickname && currentUserNickname === displayPostData.authorNickname) ||
              (currentUserId && displayPostData.authorId && currentUserId === displayPostData.authorId)
            );
            
            if (!canEdit) {
              console.log('❌ [CommunityDetail] 수정/삭제 버튼 표시 안 함:', {
                isAuthenticated,
                currentUserNickname,
                postDataAuthorNickname: displayPostData.authorNickname,
                nicknameMatch: currentUserNickname === displayPostData.authorNickname,
                currentUserId,
                postDataAuthorId: displayPostData.authorId,
                userIdMatch: currentUserId === displayPostData.authorId
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
                  <span className="text-[14px]">{isDeleting ? '삭제 중...' : '삭제'}</span>
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
              <span className="text-[#666]">{displayPostData.likes}</span>
            </button>
            <button className="hover:text-[#4442dd] transition-colors">
              <Bookmark className="w-5 h-5 text-[#666]" />
            </button>
          </div>
        </div>

        {/* 이미지 */}
        {displayPostData.images && displayPostData.images.length > 0 && (
          <div className="mb-6 space-y-4">
            {displayPostData.images.map((img, idx) => (
              <img
                key={idx}
                src={getImageUrl(img)}
                alt={`게시글 이미지 ${idx + 1}`}
                className="w-full rounded-lg"
                style={{ maxHeight: '600px', objectFit: 'contain' }}
                onError={(e) => {
                  console.error('이미지 로드 실패:', img);
                  e.target.style.display = 'none';
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
                isLiked ? 'fill-red-500 text-red-500' : 'fill-none text-[#666]'
              }`}
            />
            <span className={`text-[14px] ${isLiked ? 'text-red-500 font-semibold' : 'text-[#666]'}`}>
              {likeCount}
            </span>
          </button>
        </div>
      </div>

      {/* 댓글 섹션 */}
      <div>
        <h3 className="text-[20px] text-black mb-4">댓글 {comments.length}개</h3>
        
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
                    <button className="text-[14px] text-[#666] hover:text-[#4442dd] transition-colors cursor-pointer">답글</button>
                    {/* 내가 쓴 댓글일 때만 수정/삭제 표시 */}
                    {isAuthenticated && currentUserNickname === comment.authorNickname && (
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
                          ? 'fill-red-500 text-red-500'
                          : 'fill-none text-[#666]'
                      }`}
                    />
                    <span
                      className={`text-[14px] transition-colors ${
                        commentLikes[comment.id] ? 'text-red-500 font-semibold' : 'text-[#666]'
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
                    <div key={reply.id} className="bg-[#f5f5f5] rounded-lg p-4 border-l-4 border-[#4442dd]">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-black">{reply.authorName}</p>
                        <div className="flex items-center gap-3">
                          {/* 내가 쓴 답글일 때만 수정/삭제 표시 */}
                          {isAuthenticated && currentUserNickname === reply.authorNickname && (
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
                                ? 'fill-red-500 text-red-500'
                                : 'fill-none text-[#666]'
                            }`}
                          />
                          <span
                            className={`text-[14px] transition-colors ${
                              replyLikes[reply.id] ? 'text-red-500 font-semibold' : 'text-[#666]'
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
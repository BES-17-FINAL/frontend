import { X, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';

export function PostWriteModal({ onClose, onPostCreated, mode = 'create', initialPost = null }) {
  // 카테고리 Enum → 한글 변환
  const categoryToKorean = (category) => {
    const map = {
      'CHAT': '잡담',
      'QUESTION': '질문',
      'TIP': '꿀팁'
    };
    return map[category] || '잡담';
  };

  const [formData, setFormData] = useState({
    category: '잡담',
    title: '',
    content: '',
    images: []
  });
  const [loading, setLoading] = useState(false);

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (mode === 'edit' && initialPost) {
      setFormData({
        category: categoryToKorean(initialPost.category) || '잡담',
        title: initialPost.title || '',
        content: initialPost.fullContent || initialPost.content || '',
        images: [] // 기존 이미지는 서버에 있으므로 빈 배열로 시작
      });
    }
  }, [mode, initialPost]);

  // 폼 데이터 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 이미지 업로드 핸들러
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  // 카테고리 한글 → Enum 변환
  const categoryToEnum = (category) => {
    const map = {
      '잡담': 'CHAT',
      '질문': 'QUESTION',
      '꿀팁': 'TIP'
    };
    return map[category] || 'CHAT';
  };

  // 작성/수정 완료 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    
    try {
      // FormData 생성 (MultipartFormData 형식)
      const formDataToSend = new FormData();
      
      // PostRequest를 JSON 문자열로 추가
      const postRequest = {
        title: formData.title,
        content: formData.content,
        category: categoryToEnum(formData.category),
        thumbnailIndex: formData.images.length > 0 ? 0 : null // 첫 번째 이미지를 썸네일로
      };
      
      formDataToSend.append('post', new Blob([JSON.stringify(postRequest)], {
        type: 'application/json'
      }));
      
      // 이미지 파일 추가
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((file) => {
          formDataToSend.append('images', file);
        });
      }

      const isEditMode = mode === 'edit' && initialPost;
      const url = isEditMode ? `/api/posts/${initialPost.id}` : '/api/posts';
      const method = isEditMode ? 'put' : 'post';

      console.log(`🔵 [1단계] API 요청 전송 (${isEditMode ? '수정' : '작성'}):`, postRequest);
      console.log('🔵 [1단계] 이미지 개수:', formData.images?.length || 0);
      console.log(`🔵 [1단계] 요청 URL: ${url}`);

      // API 호출 (MultipartFormData)
      const response = await api[method](url, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log(`🟢 [2단계] API 응답 받음 (${isEditMode ? '수정' : '작성'}):`, response);
      console.log('🟢 [2단계] 응답 데이터:', response.data);
      console.log('🟢 [2단계] 응답 상태 코드:', response.status);
      
      // 게시글 목록/상세 새로고침 (모달 닫기 전에 호출)
      if (onPostCreated) {
        console.log('🟡 [3단계] onPostCreated 콜백 호출');
        onPostCreated(response.data); // 수정된 게시글 데이터 전달
      } else {
        console.warn('⚠️ [3단계] onPostCreated 콜백이 없습니다!');
      }
      
      // 모달 닫기
      onClose();
      
      alert(isEditMode ? '게시글이 수정되었습니다!' : '게시글이 작성되었습니다!');
      
    } catch (error) {
      console.error(`🔴 [에러] 게시글 ${mode === 'edit' ? '수정' : '작성'} 실패:`, error);
      console.error('🔴 [에러] 에러 응답:', error.response?.data);
      console.error('🔴 [에러] 에러 상태 코드:', error.response?.status);
      console.error('🔴 [에러] 에러 메시지:', error.response?.data?.message || error.message);
      
      // 에러 메시지 추출
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '알 수 없는 오류가 발생했습니다.';
      
      alert(`게시글 ${mode === 'edit' ? '수정' : '작성'}에 실패했습니다.\n\n에러: ${errorMessage}\n\n상세 내용은 콘솔을 확인해주세요.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#dedede]">
          <h2 className="text-[24px] text-black">{mode === 'edit' ? '게시글 수정' : '게시글 작성'}</h2>
          <button
            onClick={onClose}
            className="hover:text-[#4442dd] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* 카테고리 선택 */}
            <div>
              <label className="block text-black mb-2">카테고리</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd]"
              >
                <option value="잡담">잡담</option>
                <option value="질문">질문</option>
                <option value="꿀팁">꿀팁</option>
              </select>
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-black mb-2">제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="제목을 입력하세요"
                className="w-full px-4 py-2 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd]"
                required
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-black mb-2">내용</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="내용을 입력하세요"
                className="w-full px-4 py-2 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none"
                rows={10}
                required
              />
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label className="block text-black mb-2">이미지 첨부</label>
              <label className="border-2 border-dashed border-[#dedede] rounded-lg p-8 text-center hover:border-[#4442dd] transition-colors cursor-pointer block">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-[#666]" />
                <p className="text-[#666]">클릭하거나 드래그하여 이미지를 업로드하세요</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {formData.images.length > 0 && (
                  <p className="text-[#4442dd] mt-2">{formData.images.length}개의 이미지 선택됨</p>
                )}
              </label>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex gap-3 p-6 border-t-2 border-[#dedede]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-[#dedede] text-black rounded-lg hover:border-[#4442dd] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (mode === 'edit' ? '수정 중...' : '작성 중...') : (mode === 'edit' ? '수정 완료' : '작성 완료')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
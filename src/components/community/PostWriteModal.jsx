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
    images: [] // 새로 추가한 이미지 파일들
  });
  const [existingImages, setExistingImages] = useState([]); // 기존 이미지 URL들
  const [deletedImageUrls, setDeletedImageUrls] = useState([]); // 삭제된 기존 이미지 URL들
  const [thumbnailIndex, setThumbnailIndex] = useState(0); // 썸네일 인덱스 (기본값: 첫 번째 이미지)
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null); // 드래그 중인 이미지 인덱스
  const [dragOverIndex, setDragOverIndex] = useState(null); // 드래그 오버 중인 이미지 인덱스

  // 수정 모드일 때 초기 데이터 설정
  useEffect(() => {
    if (mode === 'edit' && initialPost) {
      setFormData({
        category: categoryToKorean(initialPost.category) || '잡담',
        title: initialPost.title || '',
        content: initialPost.fullContent || initialPost.content || '',
        images: [] // 새로 추가할 이미지 파일들
      });
      
      // 기존 이미지 URL 추출
      if (initialPost.images && Array.isArray(initialPost.images) && initialPost.images.length > 0) {
        const imageUrls = initialPost.images.map(img => {
          if (typeof img === 'string') return img;
          return img.imageUrl || img.url || img;
        }).filter(Boolean);
        setExistingImages(imageUrls);
        
        // 기존 이미지 중 썸네일 인덱스 찾기
        const thumbnailIndex = initialPost.images.findIndex(img => img.isThumbnail || img.thumbnail);
        setThumbnailIndex(thumbnailIndex >= 0 ? thumbnailIndex : 0);
      } else {
        setExistingImages([]);
        setThumbnailIndex(0);
      }
      
      setDeletedImageUrls([]); // 삭제된 이미지 목록 초기화
    } else if (mode === 'create') {
      // 작성 모드로 전환 시 초기화
      setExistingImages([]);
      setDeletedImageUrls([]);
      setThumbnailIndex(0);
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
      images: [...prev.images, ...files] // 기존 이미지에 추가
    }));
    // 새 이미지가 추가되면 첫 번째 이미지를 썸네일로 설정 (기존 이미지가 없을 때만)
    if (files.length > 0 && existingImages.length === 0 && formData.images.length === 0) {
      setThumbnailIndex(0);
    }
  };

  // 썸네일 변경 핸들러
  const handleThumbnailChange = (index) => {
    setThumbnailIndex(index);
  };

  // 드래그 시작 핸들러
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  };

  // 드래그 종료 핸들러
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 드래그 오버 핸들러
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  // 드래그 리브 핸들러
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // 드롭 핸들러
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const isDraggedExisting = draggedIndex < existingImages.length;
    const isDropExisting = dropIndex < existingImages.length;

    if (isDraggedExisting && isDropExisting) {
      // 기존 이미지끼리 순서 변경
      const newExistingImages = [...existingImages];
      const [draggedItem] = newExistingImages.splice(draggedIndex, 1);
      newExistingImages.splice(dropIndex, 0, draggedItem);
      setExistingImages(newExistingImages);
      
      // 썸네일 인덱스 조정
      if (draggedIndex === thumbnailIndex) {
        setThumbnailIndex(dropIndex);
      } else if (dropIndex === thumbnailIndex && draggedIndex < thumbnailIndex) {
        setThumbnailIndex(thumbnailIndex + 1);
      } else if (dropIndex < thumbnailIndex && draggedIndex > thumbnailIndex) {
        setThumbnailIndex(thumbnailIndex - 1);
      }
    } else if (!isDraggedExisting && !isDropExisting) {
      // 새 이미지끼리 순서 변경
      const newImages = [...formData.images];
      const draggedNewIndex = draggedIndex - existingImages.length;
      const dropNewIndex = dropIndex - existingImages.length;
      const [draggedItem] = newImages.splice(draggedNewIndex, 1);
      newImages.splice(dropNewIndex, 0, draggedItem);
      setFormData(prev => ({ ...prev, images: newImages }));
      
      // 썸네일 인덱스 조정
      if (draggedIndex === thumbnailIndex) {
        setThumbnailIndex(dropIndex);
      } else if (dropIndex === thumbnailIndex && draggedIndex < thumbnailIndex) {
        setThumbnailIndex(thumbnailIndex + 1);
      } else if (dropIndex < thumbnailIndex && draggedIndex > thumbnailIndex) {
        setThumbnailIndex(thumbnailIndex - 1);
      }
    } else {
      // 기존 이미지와 새 이미지 간 순서 변경
      // 기존 이미지를 삭제하고 새 이미지로 변환하거나, 그 반대
      if (isDraggedExisting) {
        // 기존 이미지를 새 이미지 위치로 이동
        const draggedUrl = existingImages[draggedIndex];
        const newExistingImages = existingImages.filter((_, i) => i !== draggedIndex);
        setExistingImages(newExistingImages);
        
        // 기존 이미지를 새 이미지로 변환 (URL을 File로 변환할 수 없으므로 삭제 처리)
        // 대신 기존 이미지를 삭제 목록에 추가하고, 사용자에게 알림
        setDeletedImageUrls(prev => [...prev, draggedUrl]);
        
        // 새 이미지 배열에 추가할 수 없으므로, 기존 이미지는 삭제되고 새 이미지가 그 자리를 차지
        // 썸네일 인덱스 조정
        if (draggedIndex === thumbnailIndex) {
          // 드래그된 이미지가 썸네일이었으면, 드롭 위치로 변경
          setThumbnailIndex(dropIndex);
        } else if (dropIndex === thumbnailIndex && draggedIndex < thumbnailIndex) {
          setThumbnailIndex(thumbnailIndex + 1);
        } else if (dropIndex < thumbnailIndex && draggedIndex > thumbnailIndex) {
          setThumbnailIndex(thumbnailIndex - 1);
        } else if (draggedIndex < thumbnailIndex) {
          setThumbnailIndex(thumbnailIndex - 1);
        }
      } else {
        // 새 이미지를 기존 이미지 위치로 이동
        const draggedNewIndex = draggedIndex - existingImages.length;
        const draggedFile = formData.images[draggedNewIndex];
        const newImages = formData.images.filter((_, i) => i !== draggedNewIndex);
        setFormData(prev => ({ ...prev, images: newImages }));
        
        // 새 이미지를 기존 이미지 배열에 추가할 수 없으므로, 새 이미지는 그대로 유지
        // 대신 순서만 조정 (실제로는 불가능하므로 알림 표시)
        alert('기존 이미지와 새로 추가한 이미지 간 순서 변경은 제한적입니다.\n기존 이미지를 삭제하고 새 이미지를 추가한 후 순서를 조정해주세요.');
        setFormData(prev => ({ ...prev, images: [...prev.images, draggedFile] }));
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = (index, isExisting = false) => {
    const totalImages = existingImages.length + formData.images.length;
    
    if (isExisting) {
      // 기존 이미지 삭제
      const imageUrlToDelete = existingImages[index];
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      setDeletedImageUrls(prev => [...prev, imageUrlToDelete]);
      
      // 썸네일 인덱스 조정 (기존 이미지가 썸네일이었거나 그 이전이면)
      if (index < thumbnailIndex) {
        setThumbnailIndex(Math.max(0, thumbnailIndex - 1));
      } else if (index === thumbnailIndex && totalImages > 1) {
        // 삭제된 이미지가 썸네일이면 첫 번째 이미지로 설정
        setThumbnailIndex(0);
      }
    } else {
      // 새로 추가한 이미지 삭제
      const fileToRemove = formData.images[index];
      // URL 해제 (메모리 누수 방지)
      if (fileToRemove) {
        const url = URL.createObjectURL(fileToRemove);
        URL.revokeObjectURL(url);
      }
      
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
      
      // 제거된 이미지가 썸네일이었거나 그 이전이면 썸네일 인덱스 조정
      const existingCount = existingImages.length;
      const adjustedIndex = existingCount + index; // 전체 이미지 중 인덱스
      if (adjustedIndex <= thumbnailIndex) {
        setThumbnailIndex(Math.max(0, thumbnailIndex - 1));
      }
    }
    
    // 모든 이미지가 제거되면 썸네일 인덱스 초기화
    const remainingTotal = isExisting 
      ? (existingImages.length - 1 + formData.images.length)
      : (existingImages.length + formData.images.length - 1);
    if (remainingTotal === 0) {
      setThumbnailIndex(0);
    }
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
      
      // 전체 이미지 개수 (기존 + 새로 추가)
      const totalImageCount = existingImages.length + formData.images.length;
      
      // PostRequest를 JSON 문자열로 추가
      const postRequest = {
        title: formData.title,
        content: formData.content,
        category: categoryToEnum(formData.category),
        thumbnailIndex: totalImageCount > 0 ? thumbnailIndex : null, // 사용자가 선택한 썸네일 인덱스
        deletedImageUrls: deletedImageUrls.length > 0 ? deletedImageUrls : null // 삭제된 기존 이미지 URL들
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
              {/* 이미지 미리보기 (기존 이미지 + 새로 추가한 이미지) */}
              {(existingImages.length > 0 || formData.images.length > 0) && (
                <div className="mt-4">
                  <p className="text-sm text-[#666] mb-2">
                    이미지를 클릭하여 썸네일로 설정하세요 | 드래그하여 순서를 변경할 수 있습니다
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    {/* 기존 이미지 표시 */}
                    {existingImages.map((imageUrl, index) => {
                      const globalIndex = index; // 전체 이미지 중 인덱스
                      return (
                        <div 
                          key={`existing-${index}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, globalIndex)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, globalIndex)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, globalIndex)}
                          className={`relative cursor-move transition-all ${
                            globalIndex === thumbnailIndex ? 'ring-4 ring-[#4442dd] ring-offset-2' : ''
                          } ${
                            draggedIndex === globalIndex ? 'opacity-50' : ''
                          } ${
                            dragOverIndex === globalIndex && draggedIndex !== globalIndex ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                          }`}
                          onClick={() => handleThumbnailChange(globalIndex)}
                        >
                          <img
                            src={imageUrl}
                            alt={`기존 이미지 ${index + 1}`}
                            className={`w-full h-24 object-cover rounded-lg border-2 ${
                              globalIndex === thumbnailIndex ? 'border-[#4442dd]' : 'border-[#dedede]'
                            }`}
                            draggable={false}
                            onError={(e) => {
                              console.error('이미지 로드 실패:', imageUrl);
                              e.target.style.display = 'none';
                            }}
                          />
                          {globalIndex === thumbnailIndex && (
                            <span className="absolute top-1 left-1 bg-[#4442dd] text-white text-xs px-2 py-1 rounded font-bold z-20">
                              썸네일
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // 클릭 이벤트 전파 방지
                              handleRemoveImage(index, true); // 기존 이미지 삭제
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-20"
                            title="이미지 제거"
                            onMouseDown={(e) => e.stopPropagation()} // 드래그 방지
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                    {/* 새로 추가한 이미지 표시 */}
                    {formData.images.map((file, index) => {
                      const globalIndex = existingImages.length + index; // 전체 이미지 중 인덱스
                      return (
                        <div 
                          key={`new-${index}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, globalIndex)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, globalIndex)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, globalIndex)}
                          className={`relative cursor-move transition-all ${
                            globalIndex === thumbnailIndex ? 'ring-4 ring-[#4442dd] ring-offset-2' : ''
                          } ${
                            draggedIndex === globalIndex ? 'opacity-50' : ''
                          } ${
                            dragOverIndex === globalIndex && draggedIndex !== globalIndex ? 'ring-2 ring-blue-400 ring-offset-2' : ''
                          }`}
                          onClick={() => handleThumbnailChange(globalIndex)}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`새 이미지 ${index + 1}`}
                            className={`w-full h-24 object-cover rounded-lg border-2 ${
                              globalIndex === thumbnailIndex ? 'border-[#4442dd]' : 'border-[#dedede]'
                            }`}
                            draggable={false}
                          />
                          {globalIndex === thumbnailIndex && (
                            <span className="absolute top-1 left-1 bg-[#4442dd] text-white text-xs px-2 py-1 rounded font-bold z-20">
                              썸네일
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation(); // 클릭 이벤트 전파 방지
                              handleRemoveImage(index, false); // 새 이미지 삭제
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors z-20"
                            title="이미지 제거"
                            onMouseDown={(e) => e.stopPropagation()} // 드래그 방지
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
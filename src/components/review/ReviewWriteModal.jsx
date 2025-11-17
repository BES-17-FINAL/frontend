import { useState } from 'react';
import { X, Star } from 'lucide-react';

export function ReviewWriteModal({ onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // 실제로는 파일을 업로드하고 URL을 받아와야 하지만, 여기서는 미리보기만
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  const handleSubmit = () => {
    console.log(rating + "확인" + comment)
    if (rating === 0) {
      alert('별점을 선택해주세요!');
      return;
    }
    if (!comment.trim()) {
      alert('리뷰 내용을 입력해주세요!');
      return;
    }

    // reviewStore의 addReview 호출
    onSubmit({
      rating,
      comment
    });
    
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#dedede]">
          <h2 className="text-[24px] text-black">리뷰 작성</h2>
          <button
            onClick={onClose}
            className="text-[#666] hover:text-black transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6 space-y-6">
          {/* 별점 선택 */}
          <div>
            <label className="block text-[16px] text-black mb-3">
              별점 <span className="text-[#ff6b6b]">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-300 text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-[20px] text-black ml-2">
                {rating > 0 ? `${rating}.0` : ''}
              </span>
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div>
            <label className="block text-[16px] text-black mb-2">
              리뷰 내용 <span className="text-[#ff6b6b]">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="이 관광지에 대한 솔직한 후기를 남겨주세요"
              className="w-full h-[200px] p-4 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none transition-colors"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 p-6 border-t-2 border-[#dedede]">
          <button
            onClick={onClose}
            className="flex-1 py-3 border-2 border-[#dedede] text-black rounded-lg hover:border-[#4442dd] transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
          >
            작성 완료
          </button>
        </div>
      </div>
    </div>
  );
}

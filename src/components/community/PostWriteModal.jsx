import { X, Image as ImageIcon } from 'lucide-react';

export function PostWriteModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b-2 border-[#dedede]">
          <h2 className="text-[24px] text-black">게시글 작성</h2>
          <button
            onClick={onClose}
            className="hover:text-[#4442dd] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-black mb-2">카테고리</label>
            <select className="w-full px-4 py-2 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd]">
              <option>잡담</option>
              <option>질문</option>
              <option>꿀팁</option>
            </select>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-black mb-2">제목</label>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-2 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd]"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-black mb-2">내용</label>
            <textarea
              placeholder="내용을 입력하세요"
              className="w-full px-4 py-2 border-2 border-[#dedede] rounded-lg focus:outline-none focus:border-[#4442dd] resize-none"
              rows={10}
            />
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-black mb-2">이미지 첨부</label>
            <div className="border-2 border-dashed border-[#dedede] rounded-lg p-8 text-center hover:border-[#4442dd] transition-colors cursor-pointer">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-[#666]" />
              <p className="text-[#666]">클릭하거나 드래그하여 이미지를 업로드하세요</p>
              <input type="file" multiple accept="image/*" className="hidden" />
            </div>
          </div>


        </div>

        {/* 푸터 */}
        <div className="flex gap-3 p-6 border-t-2 border-[#dedede]">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-[#dedede] text-black rounded-lg hover:border-[#4442dd] transition-colors"
          >
            취소
          </button>
          <button className="flex-1 px-6 py-3 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors">
            작성 완료
          </button>
        </div>
      </div>
    </div>
  );
}
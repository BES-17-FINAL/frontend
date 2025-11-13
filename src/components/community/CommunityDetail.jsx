import { Heart } from 'lucide-react';
import { Bookmark, Image as ImageIcon } from 'lucide-react';

export function CommunityDetail({ postId, onBack }) {
  // 예시 데이터
  const post = {
    id: postId,
    title: '경복궁 방문 후기',
    author: '김철수',
    authorAvatar: '#4442dd',
    date: '2025.11.10',
    likes: 24,
    bookmarked: false,
    views: 156,
    category: '꿀팁',
    images: [
      'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800',
    ],
    content: `오늘 경복궁을 방문했습니다. 날씨도 좋고 정말 멋진 경험이었어요.
    
근정전의 웅장함과 아름다움에 감탄했고, 경회루의 연못에 비친 건물이 정말 인상적이었습니다.

한복을 입고 방문하면 무료 입장이라는 점도 좋았고, 곳곳에 사진 찍기 좋은 포인트들이 많았습니다.

가을에 방문하니 단풍과 어우러진 궁궐의 모습이 더욱 아름다웠어요. 가족들과 함께 다시 방문하고 싶습니다.`,
  };

  const comments = [
    {
      id: 1,
      authorName: '이영희',
      content: '저도 최근에 다녀왔는데 정말 좋았어요!',
      likes: 5,
      replies: [
        {
          id: 11,
          authorName: '김철수',
          content: '감사합니다! 어느 계절에 가셨나요?',
          likes: 2,
        },
      ],
    },
    {
      id: 2,
      authorName: '박민수',
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
          <span className={`px-3 py-1 rounded text-[14px] ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>
        <h1 className="text-[32px] text-black mb-6">{post.title}</h1>

        {/* 메타 정보 */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b-2 border-[#dedede]">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: post.authorAvatar }}
          >
            <span>{post.author[0]}</span>
          </div>
          <span className="text-black">{post.author}</span>
          <span className="text-[#666]">{post.date}</span>
          <span className="text-[#666]">조회 {post.views}</span>
          <div className="ml-auto flex items-center gap-4">
            <button className="flex items-center gap-2 hover:text-[#4442dd] transition-colors">
              <Heart className="w-5 h-5 text-[#666]" />
              <span className="text-[#666]">{post.likes}</span>
            </button>
            <button className="hover:text-[#4442dd] transition-colors">
              <Bookmark className="w-5 h-5 text-[#666]" />
            </button>
          </div>
        </div>

        {/* 이미지 */}
        {post.images && post.images.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4">
            {post.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`게시글 이미지 ${idx + 1}`}
                className="w-full h-[200px] object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* 본문 */}
        <div className="py-6">
          <p className="text-[#333] whitespace-pre-line leading-relaxed">
            {post.content}
          </p>
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
                    <button className="flex items-center gap-1 hover:text-[#4442dd] transition-colors">
                      <Heart className="w-4 h-4 text-[#666]" />
                      <span className="text-[#666] text-[14px]">{comment.likes}</span>
                    </button>
                    <button className="text-[14px] text-[#666] hover:text-[#4442dd]">답글</button>
                  </div>
                </div>
                <p className="text-[#333]">{comment.content}</p>
              </div>

              {/* 답글 */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 mt-2 space-y-2">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="bg-[#f5f5f5] rounded-lg p-4 border-l-4 border-[#4442dd]">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-black">{reply.authorName}</p>
                        <button className="flex items-center gap-1 hover:text-[#4442dd] transition-colors">
                          <Heart className="w-4 h-4 text-[#666]" />
                          <span className="text-[#666] text-[14px]">{reply.likes}</span>
                        </button>
                      </div>
                      <p className="text-[#333]">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
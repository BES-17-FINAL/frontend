import { useEffect, useState } from 'react';
import { Star, Heart, MessageCircle, Calendar, MapPin, Camera, Edit2, X, Check } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import useUserStore from '../store/userStore';
import usePostStore from '../store/postStore';
import useReviewStore from '../store/reviewStore';
import { Link } from "react-router-dom";

export function UserProfile() {
  const { getUser, editUser } = useUserStore();
  const { getUserPost } = usePostStore();
  const { getMyReviews } = useReviewStore();

  const [profile, setProfile] = useState([]);

  const [activeTab, setActiveTab] = useState('reviews'); // reviews, posts, comments
  const [profileImage, setProfileImage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [nickName, setNickName] = useState("");
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSaveProfile = async () => {
    // 여기서 프로필 저장 로직
    await editUser({
      user_name: userName,
      nickname: nickName,
      profile_img: profileImage
    })
    const data = await getUser();
    setProfile(data);
    setIsEditModalOpen(false);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
  };



    useEffect(() => {
        const fetchUser = async () => {
            const data = await getUser();
            const postData = await getUserPost();
            const reviewData = await getMyReviews();
            console.log("posts: ", postData)
            setProfile(data);
            setPosts(postData);
            setReviews(reviewData);
        }
        fetchUser();
    }, [getUser, getUserPost])


    const formatDate = (isoString) => {
      const date = new Date(isoString);
      return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    };

  // 예시 유저 데이터
  const user = {
    name: '김철수',
    joinDate: '2024.01.15',
    bio: '여행을 좋아하는 평범한 직장인입니다. 주로 국내 여행을 다니며 맛집과 힐링 장소를 찾아다닙니다.',
    stats: {
      reviews: 12,
      posts: 8,
      comments: 24,
    }
  };

  // 예시 리뷰 데이터
  const userReviews = [
    {
      id: 1,
      spotName: '경복궁',
      rating: 5,
      content: '한복을 입고 방문하니 무료 입장이라 좋았고, 근정전의 웅장함이 정말 인상적이었습니다. 가을 단풍과 어우러진 모습이 아름다웠어요.',
      date: '2025.11.10',
      spotId: 1,
    },
    {
      id: 2,
      spotName: '남산타워',
      rating: 4,
      content: '야경이 정말 환상적입니다. 다만 주말에는 사람이 많아서 평일 방문을 추천합니다.',
      date: '2025.11.05',
      spotId: 2,
    },
    {
      id: 3,
      spotName: '제주 섭지코지',
      rating: 5,
      content: '바다와 절벽이 어우러진 풍경이 정말 멋있었습니다. 일출 보러 꼭 다시 가고 싶어요!',
      date: '2025.10.28',
      spotId: 3,
    },
  ];

  // 예시 게시글 데이터
  const userPosts = [
    {
      id: 1,
      title: '경복궁 방문 후기',
      category: '꿀팁',
      content: '오늘 경복궁을 방문했습니다. 날씨도 좋고 정말 멋진 경험이었어요.',
      likes: 24,
      comments: 12,
      date: '2025.11.10',
    },
    {
      id: 2,
      title: '가을 여행지 추천 부탁드려요',
      category: '질문',
      content: '가을에 가기 좋은 국내 여행지를 추천해주세요. 단풍 구경하고 싶어요!',
      likes: 8,
      comments: 15,
      date: '2025.10.20',
    },
  ];

  // 예시 댓글 데이터
  const userComments = [
    {
      id: 1,
      postTitle: '제주도 3박 4일 코스 추천',
      content: '저도 최근에 다녀왔는데 정말 좋았어요! 섭지코지 일출이 특히 인상적이었습니다.',
      date: '2025.11.12',
      postId: 5,
    },
    {
      id: 2,
      postTitle: '부산 맛집 추천해주세요',
      content: '광안리 근처 해운대 국밥집 강추합니다! 현지인들도 많이 가는 곳이에요.',
      date: '2025.11.08',
      postId: 7,
    },
    {
      id: 3,
      postTitle: '경주 여행 코스 질문',
      content: '첨성대 → 대릉원 → 황리단길 순서로 다녀오시면 좋을 것 같아요.',
      date: '2025.11.01',
      postId: 9,
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
    <div className="max-w-[1000px] mx-auto px-6 py-8">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => {}}
        className="mb-6 px-6 py-2 border-2 border-[#dedede] text-black hover:border-[#4442dd] rounded-lg transition-colors"
      >
        ← 뒤로가기
      </button>

      {/* 프로필 헤더 */}
      <div className="bg-white border-2 border-[#dedede] rounded-lg p-8 mb-6">
        <div className="flex items-start gap-6">
          {/* 아바타 */}
          <div className="relative group">
            <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-[#4442dd]">
              <ImageWithFallback
                src={profileImage || null}
                alt=''
                className="w-full h-full object-cover block"
              />
            </div>
            
            {/* 프로필 사진 변경 버튼 */}
            <label
              htmlFor="profile-image-upload"
              className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="w-5 h-5 text-white" />
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          

          {/* 유저 정보 */}
          <div className="flex-1 min-h-[140px] flex flex-col justify-between mt-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h2 className="text-[28px] text-black">{profile.nickname}</h2>
              </div>
              <button
                onClick={() => {
                  setUserName(profile.user_name || "");
                  setNickName(profile.nickname || "");
                  setProfileImage(profile.profile_img || "");
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                프로필 편집
              </button>
            </div>

            {/* 통계 */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-[24px] text-[#4442dd]">{reviews ? reviews.length : "0"}</div>
                <div className="text-[14px] text-[#666]">리뷰</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] text-[#4442dd]">{posts ? posts.length : "0"}</div>
                <div className="text-[14px] text-[#666]">게시글</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] text-[#4442dd]">{user.stats.comments}</div>
                <div className="text-[14px] text-[#666]">댓글</div>
              </div>
            </div>
          </div>
        </div>
      </div>

            {/* 비밀번호 변경 링크 추가 */}
      <div className="mb-6">
        <Link
          to="/change-password"
          className="text-blue-500 hover:underline"
        >
          비밀번호 변경하기
        </Link>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-2 mb-6 border-b-2 border-[#dedede]">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'reviews'
              ? 'text-[#4442dd] border-b-2 border-[#4442dd] -mb-[2px]'
              : 'text-[#666] hover:text-black'
          }`}
        >
          작성한 리뷰 ({reviews?.length || "0"})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'posts'
              ? 'text-[#4442dd] border-b-2 border-[#4442dd] -mb-[2px]'
              : 'text-[#666] hover:text-black'
          }`}
        >
          작성한 게시글 ({posts?.length || "0"})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-6 py-3 transition-colors ${
            activeTab === 'comments'
              ? 'text-[#4442dd] border-b-2 border-[#4442dd] -mb-[2px]'
              : 'text-[#666] hover:text-black'
          }`}
        >
          작성한 댓글 ({user.stats.comments || "0"})
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="space-y-4">
        {/* 리뷰 탭 */}
        {activeTab === 'reviews' && (
          <>
            {reviews?.map((review) => (
              <div
                key={review.id}
                className="bg-white border-2 border-[#dedede] rounded-lg p-6 hover:border-[#4442dd] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#4442dd]" />
                    <h3 className="text-[18px] text-black">{review.spotName}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-[16px] text-[#333] mb-3 line-clamp-2">{review.comment}</p>
                <div className="text-[14px] text-[#666]">{review.createdAt}</div>
              </div>
            ))}
          </>
        )}

        {/* 게시글 탭 */}
        {activeTab === 'posts' && (
          <>
            {posts?.map((post) => (
              <div
                key={post.id}
                className="bg-white border-2 border-[#dedede] rounded-lg p-6 hover:border-[#4442dd] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-[12px] ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                  <span className="text-[14px] text-[#666]">{post.createdAt}</span>
                </div>
                <h3 className="text-[18px] text-black mb-2">{post.title}</h3>
                <p className="text-[16px] text-[#333] mb-3 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 text-[14px] text-[#666]">
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {post.comments}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* 댓글 탭 */}
        {activeTab === 'comments' && (
          <>
            {userComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white border-2 border-[#dedede] rounded-lg p-6 hover:border-[#4442dd] hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="w-4 h-4 text-[#4442dd]" />
                  <span className="text-[14px] text-[#666]">
                    "{comment.postTitle}" 게시글에 작성한 댓글
                  </span>
                  <span className="text-[14px] text-[#666] ml-auto">{comment.date}</span>
                </div>
                <p className="text-[16px] text-[#333]">{comment.content}</p>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 내용이 없을 때 */}
      {((activeTab === 'reviews' && userReviews.length === 0) ||
        (activeTab === 'posts' && userPosts.length === 0) ||
        (activeTab === 'comments' && userComments.length === 0)) && (
        <div className="text-center py-12 text-[#666]">
          <p className="text-[18px]">아직 작성한 내용이 없습니다.</p>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-[600px] w-full relative">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[24px] text-black">프로필 편집</h3>
              <button
                onClick={handleCancelEdit}
                className="text-[#666] hover:text-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 모달 컨텐츠 */}
            <div className="space-y-4">
              <div>
                <label className="block text-[14px] text-[#666] mb-2">이름</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#dedede] rounded-lg focus:border-[#4442dd] focus:outline-none"
                  placeholder="이름을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-[14px] text-[#666] mb-2">닉네임</label>
                <input
                  type="text"
                  value={nickName}
                  onChange={(e) => setNickName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#dedede] rounded-lg focus:border-[#4442dd] focus:outline-none resize-none"
                  placeholder="닉네임을 입력하세요"
                />
              </div>
            </div>

            {/* 모달 버튼 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveProfile}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors"
              >
                <Check className="w-5 h-5" />
                저장
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#dedede] text-black rounded-lg hover:bg-[#cccccc] transition-colors"
              >
                <X className="w-5 h-5" />
                취소
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
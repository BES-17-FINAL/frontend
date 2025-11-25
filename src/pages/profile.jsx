import { useEffect, useState } from 'react';
import { Star, Heart, MessageCircle, Calendar, MapPin, Camera, Edit2, X, Check } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import useUserStore from '../store/userStore';
import usePostStore from '../store/postStore';
import useReviewStore from '../store/reviewStore';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import ScheduleCalendar from '../components/schedule/ScheduleCalendar';
import ScheduleModal from '../components/schedule/ScheduleModal';
import { scheduleService } from '../services/scheduleService';

export function UserProfile() {
  const { getUser, editUser, imageUpdate } = useUserStore();
  const { getUserPost } = usePostStore();
  const { getMyReviews } = useReviewStore();
  const { isAuthenticated } = useAuthStore();
  const [profile, setProfile] = useState([]);

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('reviews'); // reviews, posts, comments, schedules
  const [profileImage, setProfileImage] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [nickName, setNickName] = useState("");
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("image", file);
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }
      const result = await imageUpdate(formData);
      console.log("업로드 결과:", result);
    }
  };

  const handleSaveProfile = async () => {
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
      setProfile(data);
      setPosts(postData);
      setReviews(reviewData);
    }
    fetchUser();
  }, [getUser, getUserPost])

  // Fetch schedules whenever authenticated, regardless of tab
  useEffect(() => {
    if (isAuthenticated) {
      fetchSchedules();
    }
  }, [isAuthenticated]);

  const fetchSchedules = async () => {
    try {
      const data = await scheduleService.getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to fetch schedules", error);
      if (error.response?.status === 401) {
        setSchedules([]);
      }
    }
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setIsScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
      try {
        await scheduleService.deleteSchedule(scheduleId);
        fetchSchedules();
      } catch (error) {
        console.error("Failed to delete schedule", error);
        alert("일정 삭제에 실패했습니다.");
      }
    }
  };

  const handleUpdateSchedule = async (scheduleData) => {
    try {
      if (selectedSchedule) {
        await scheduleService.updateSchedule(selectedSchedule.id, scheduleData);
        fetchSchedules();
        setIsScheduleModalOpen(false);
        setSelectedSchedule(null);
      }
    } catch (error) {
      console.error("Failed to update schedule", error);
      alert("일정 수정에 실패했습니다.");
    }
  };

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

  const userReviews = [];
  const userPosts = [];
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
      <Header />

      <button
        onClick={() => { navigate(-1) }}
        className="mb-6 px-6 py-2 border-2 border-[#dedede] text-black hover:border-[#4442dd] rounded-lg transition-colors"
      >
        ← 뒤로가기
      </button>

      <div className="bg-white border-2 border-[#dedede] rounded-lg p-8 mb-6">
        <div className="flex items-start gap-6">
          <div className="relative group">
            <div className="w-48 h-48 rounded-full overflow-hidden border-2 border-[#4442dd]">
              <ImageWithFallback
                src={profileImage || null}
                alt=''
                className="w-full h-full object-cover block"
              />
            </div>

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
              <div className="text-center">
                <div className="text-[24px] text-[#4442dd]">{schedules ? schedules.length : "0"}</div>
                <div className="text-[14px] text-[#666]">일정</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b-2 border-[#dedede]">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-3 transition-colors ${activeTab === 'reviews'
              ? 'text-[#4442dd] border-b-2 border-[#4442dd] -mb-[2px]'
              : 'text-[#666] hover:text-black'
            }`}
        >
          작성한 리뷰 ({reviews?.length || "0"})
        </button>
        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-6 py-3 transition-colors ${activeTab === 'schedules'
              ? 'text-[#4442dd] border-b-2 border-[#4442dd] -mb-[2px]'
              : 'text-[#666] hover:text-black'
            }`}
        >
          여행 일정 ({schedules?.length || "0"})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-6 py-3 transition-colors ${activeTab === 'posts'
              ? 'text-[#4442dd] border-b-2 border-[#4442dd] -mb-[2px]'
              : 'text-[#666] hover:text-black'
            }`}
        >
          작성한 게시글 ({posts?.length || "0"})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-6 py-3 transition-colors ${activeTab === 'comments'
              ? 'text-[#4442dd] border-b-2 border-[#4442dd] -mb-[2px]'
              : 'text-[#666] hover:text-black'
            }`}
        >
          작성한 댓글 ({user.stats.comments || "0"})
        </button>
      </div>

      <div className="space-y-4">
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
                      <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[16px] text-[#333] mb-3 line-clamp-2">{review.comment}</p>
                <div className="text-[14px] text-[#666]">{review.createdAt}</div>
              </div>
            ))}
          </>
        )}

        {activeTab === 'schedules' && (
          <ScheduleCalendar
            schedules={schedules}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
          />
        )}

        {activeTab === 'posts' && (
          <>
            {posts?.map((post) => (
              <div key={post.id} className="bg-white border-2 border-[#dedede] rounded-lg p-6 hover:border-[#4442dd] hover:shadow-md transition-all cursor-pointer">
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

        {activeTab === 'comments' && (
          <>
            {userComments.map((comment) => (
              <div key={comment.id} className="bg-white border-2 border-[#dedede] rounded-lg p-6 hover:border-[#4442dd] hover:shadow-md transition-all cursor-pointer">
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

      {((activeTab === 'reviews' && userReviews.length === 0) ||
        (activeTab === 'posts' && userPosts.length === 0) ||
        (activeTab === 'comments' && userComments.length === 0) ||
        (activeTab === 'schedules' && schedules.length === 0)) && (
          <div className="text-center py-12 text-[#666]">
            <p className="text-[18px]">아직 작성한 내용이 없습니다.</p>
          </div>
        )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-[600px] w-full relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[24px] text-black">프로필 편집</h3>
              <button onClick={handleCancelEdit} className="text-[#666] hover:text-black transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

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

            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveProfile} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#4442dd] text-white rounded-lg hover:bg-[#3331cc] transition-colors">
                <Check className="w-5 h-5" />
                저장
              </button>
              <button onClick={handleCancelEdit} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#dedede] text-black rounded-lg hover:bg-[#cccccc] transition-colors">
                <X className="w-5 h-5" />
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedSchedule(null);
        }}
        onSubmit={handleUpdateSchedule}
        initialDate={selectedSchedule ? new Date(selectedSchedule.startDate) : new Date()}
        spotTitle={selectedSchedule?.spotTitle}
      />

    </div>
  );
}
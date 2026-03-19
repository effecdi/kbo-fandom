import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MediaKit() {
  const [formData, setFormData] = useState({
    // 프로필 정보
    username: "@username",
    profileName: "프로필 이름",
    category: "",
    bio: "간단한 설명을 입력하여 AI가 전문으로 나누어 드립니다...",

    // 연락처
    email: "email@example.com",
    kakaoId: "kakao_id",

    // 지표 & 인사이트
    reach: "10000",
    impression: "5000",
    views: "500",
    clicks: "50",
    followers: "50000",
    fanRate: "5.2",

    // 연령 분포
    age13_17: "35",
    age18_24: "30",
    age25_34: "20",
    age35plus: "15",

    // 성별 비율
    male: "35",
    female: "65",

    // 광고 단가
    feedPost: "100000",
    story: "50000",
    reels: "200000",
    package: "300000",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">미디어킷</h1>
          <p className="text-gray-400">광고주에게 보낼 미디어킷을 만들어보세요</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Panel - Form Inputs */}
          <div className="space-y-6">
            {/* 프로필 정보 */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">프로필 정보</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      인스타그램 핸들
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      프로필 이름
                    </label>
                    <input
                      type="text"
                      value={formData.profileName}
                      onChange={(e) => handleChange("profileName", e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    카테고리
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  >
                    <option value="">선택</option>
                    <option value="lifestyle">라이프스타일</option>
                    <option value="food">음식</option>
                    <option value="fashion">패션</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm text-gray-400">자기 소개</label>
                    <button className="flex items-center gap-1 text-xs text-[#00e5cc] hover:text-[#00f0ff]">
                      <Sparkles className="w-3 h-3" />
                      AI 작성
                    </button>
                  </div>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 연락처 */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">연락처</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">이메일</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    카카오톡 ID
                  </label>
                  <input
                    type="text"
                    value={formData.kakaoId}
                    onChange={(e) => handleChange("kakaoId", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - More Form Inputs */}
          <div className="space-y-6">
            {/* 지표 & 인사이트 */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">지표 & 인사이트</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">리치</label>
                  <input
                    type="number"
                    value={formData.reach}
                    onChange={(e) => handleChange("reach", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">노출양</label>
                  <input
                    type="number"
                    value={formData.impression}
                    onChange={(e) => handleChange("impression", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">팔로 클릭수</label>
                  <input
                    type="number"
                    value={formData.views}
                    onChange={(e) => handleChange("views", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">팔로 댓글</label>
                  <input
                    type="number"
                    value={formData.clicks}
                    onChange={(e) => handleChange("clicks", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">팔로 도달</label>
                  <input
                    type="number"
                    value={formData.followers}
                    onChange={(e) => handleChange("followers", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">참여율 (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fanRate}
                    onChange={(e) => handleChange("fanRate", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
              </div>

              {/* 연령 분포 */}
              <div className="mt-6">
                <label className="block text-sm text-gray-400 mb-3">연령 분포 (%)</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "13-17", key: "age13_17" },
                    { label: "18-24", key: "age18_24" },
                    { label: "25-34", key: "age25_34" },
                    { label: "35+", key: "age35plus" },
                  ].map((age) => (
                    <div key={age.key}>
                      <label className="block text-xs text-gray-500 mb-1">
                        {age.label}
                      </label>
                      <input
                        type="number"
                        value={formData[age.key as keyof typeof formData]}
                        onChange={(e) => handleChange(age.key, e.target.value)}
                        className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 성별 비율 */}
              <div className="mt-4">
                <label className="block text-sm text-gray-400 mb-3">성별 비율 (%)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">남성</label>
                    <input
                      type="number"
                      value={formData.male}
                      onChange={(e) => handleChange("male", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">여성</label>
                    <input
                      type="number"
                      value={formData.female}
                      onChange={(e) => handleChange("female", e.target.value)}
                      className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 광고 단가 */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">광고 단가 (원)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    피드 게시글
                  </label>
                  <input
                    type="number"
                    value={formData.feedPost}
                    onChange={(e) => handleChange("feedPost", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">스토리</label>
                  <input
                    type="number"
                    value={formData.story}
                    onChange={(e) => handleChange("story", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">릴스</label>
                  <input
                    type="number"
                    value={formData.reels}
                    onChange={(e) => handleChange("reels", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">패키지</label>
                  <input
                    type="number"
                    value={formData.package}
                    onChange={(e) => handleChange("package", e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="mt-8">
          <button className="w-full py-4 bg-[#00e5cc] text-black font-bold text-lg rounded-xl hover:bg-[#00f0ff] transition-all flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            미디어킷 생성
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatMaker() {
  const [friendName, setFriendName] = useState("친구");
  const [profileImage, setProfileImage] = useState("");
  const [category, setCategory] = useState("친구");
  const [leftMessage, setLeftMessage] = useState("");
  const [rightMessage, setRightMessage] = useState("");

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">채팅 이미지 메이커</h1>
          <p className="text-gray-400">카카오톡 스타일 채팅 이미지를 만들어보세요</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Panel - Input Form */}
          <div className="space-y-6">
            {/* 대상 상대 이름 */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">대상 상대 이름</h3>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="친구"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
              />
            </div>

            {/* 프로필 이미지 & 카테고리 */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">프로필 이미지</h3>
                  <select
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  >
                    <option value="">선택</option>
                    <option value="아바타 정면 (기본)">아바타 정면 (기본)</option>
                  </select>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">카테고리</h3>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                  >
                    <option value="친구">친구</option>
                    <option value="가족">가족</option>
                    <option value="회사">회사</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 메시지 입력 */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[#00e5cc]">친구 (상대방)</h3>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={leftMessage}
                      onChange={(e) => setLeftMessage(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#00e5cc] rounded-lg hover:bg-[#00f0ff] transition-colors">
                      <Send className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-yellow-400">나</h3>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={rightMessage}
                      onChange={(e) => setRightMessage(e.target.value)}
                      placeholder="메시지를 입력하세요..."
                      className="w-full px-4 py-3 pr-12 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00e5cc] focus:border-transparent"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#00e5cc] rounded-lg hover:bg-[#00f0ff] transition-colors">
                      <Send className="w-4 h-4 text-black" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button className="w-full py-4 bg-[#00e5cc] text-black font-bold text-lg rounded-xl hover:bg-[#00f0ff] transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              채팅 이미지 다운로드
            </button>
          </div>

          {/* Right Panel - Preview */}
          <div>
            <div className="sticky top-8">
              <h3 className="text-lg font-bold text-white mb-4">미리보기</h3>
              <div className="bg-gradient-to-b from-[#a8c5dd] to-[#b5d4e8] rounded-2xl p-6 min-h-[500px] shadow-2xl">
                <div className="bg-white/90 rounded-xl p-4">
                  <div className="space-y-4">
                    {/* Friend's Header */}
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                      <div className="w-8 h-8 rounded-full bg-[#00e5cc] flex items-center justify-center">
                        <span className="text-xs font-bold text-black">
                          {friendName.charAt(0)}
                        </span>
                      </div>
                      <span className="font-bold text-gray-800">{friendName}</span>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3">
                      {leftMessage && (
                        <div className="flex items-start gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                          <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 max-w-[70%] shadow-sm">
                            <p className="text-sm text-gray-800">{leftMessage}</p>
                          </div>
                        </div>
                      )}

                      {rightMessage && (
                        <div className="flex items-end gap-2 justify-end">
                          <div className="bg-[#FFE812] rounded-2xl rounded-tr-none px-4 py-2 max-w-[70%] shadow-sm">
                            <p className="text-sm text-gray-800">{rightMessage}</p>
                          </div>
                        </div>
                      )}

                      {!leftMessage && !rightMessage && (
                        <div className="text-center py-12 text-gray-400">
                          <p>메시지를 추가하면 미리보기가 표시됩니다</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

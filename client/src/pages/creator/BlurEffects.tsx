import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { Upload, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BlurEffects() {
  const [blurType, setBlurType] = useState("가우시안");
  const [blurStrength, setBlurStrength] = useState(3);
  const [imageUploaded, setImageUploaded] = useState(false);

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">블러 효과</h1>
          <p className="text-gray-400">이미지에 블러 효과를 적용해보세요 (Gaussian / Motion / Radial)</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* Image Upload */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-sm font-bold text-white mb-4">이미지 업로드</h3>
              <div className="flex items-center gap-3">
                <button className="flex-1 py-3 bg-[#252525] border border-gray-700 rounded-lg text-gray-300 font-semibold hover:bg-[#2a2a2a] hover:border-[#00e5cc] transition-all flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  파일
                </button>
                <button className="p-3 bg-[#252525] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#2a2a2a] hover:border-[#00e5cc] transition-all">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Blur Type */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <h3 className="text-sm font-bold text-white mb-4">블러 타입</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setBlurType("가우시안")}
                  className={`w-full px-4 py-3 rounded-lg text-left font-semibold transition-all ${
                    blurType === "가우시안"
                      ? "bg-[#00e5cc] text-black"
                      : "bg-[#252525] text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                  }`}
                >
                  가우시안 · 가우시안 블러
                </button>
                <button
                  onClick={() => setBlurType("모션")}
                  className={`w-full px-4 py-3 rounded-lg text-left font-semibold transition-all ${
                    blurType === "모션"
                      ? "bg-[#00e5cc] text-black"
                      : "bg-[#252525] text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                  }`}
                >
                  모션 · 모션 블러
                </button>
                <button
                  onClick={() => setBlurType("방사형")}
                  className={`w-full px-4 py-3 rounded-lg text-left font-semibold transition-all ${
                    blurType === "방사형"
                      ? "bg-[#00e5cc] text-black"
                      : "bg-[#252525] text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                  }`}
                >
                  방사형 · 방사형 블러
                </button>
              </div>
            </div>

            {/* Blur Strength */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">강도</h3>
                <span className="text-lg font-black text-[#00e5cc]">{blurStrength}</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={blurStrength}
                  onChange={(e) => setBlurStrength(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00e5cc] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-[#252525] border border-gray-700 rounded-lg text-white font-semibold hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
              <button className="flex-1 py-3 bg-[#00e5cc] text-black font-bold rounded-lg hover:bg-[#00f0ff] transition-all flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                다운로드
              </button>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="col-span-2">
            <div className="sticky top-8">
              <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-8">
                <div className="aspect-[4/3] bg-gradient-to-br from-[#a8dde0] via-[#cfe9d8] to-[#f0e5b8] rounded-xl overflow-hidden flex items-center justify-center">
                  {!imageUploaded ? (
                    <div className="text-center">
                      <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 font-semibold">이미지를 업로드하세요</p>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop")',
                        filter: `blur(${blurStrength}px)`,
                      }}
                    />
                  )}
                </div>

                {/* Preview Info */}
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">블러 타입</p>
                    <p className="text-lg font-bold text-white">{blurType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">강도</p>
                    <p className="text-lg font-bold text-[#00e5cc]">{blurStrength}</p>
                  </div>
                </div>
              </div>

              {/* Quick Test Button */}
              <button
                onClick={() => setImageUploaded(!imageUploaded)}
                className="w-full mt-4 py-3 bg-[#252525] border border-gray-700 rounded-lg text-gray-300 font-semibold hover:bg-[#2a2a2a] hover:text-white transition-all"
              >
                {imageUploaded ? "이미지 제거" : "샘플 이미지 로드"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

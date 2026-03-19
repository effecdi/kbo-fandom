import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Wand2,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Type,
  Zap,
  ArrowRight,
  Info,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type CreationMethod = "text" | "image" | "variation";

export function CharacterNew() {
  const [method, setMethod] = useState<CreationMethod>("text");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState<string[]>([]);

  const moods = [
    "밝은", "차분한", "유머러스", "진지한", 
    "귀여운", "쿨한", "따뜻한", "시크한"
  ];

  const toggleMood = (m: string) => {
    if (mood.includes(m)) {
      setMood(mood.filter(item => item !== m));
    } else {
      setMood([...mood, m]);
    }
  };

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            새 캐릭터 만들기
          </h1>
          <p className="text-gray-600">
            AI가 당신의 아이디어를 멋진 캐릭터로 만들어드립니다
          </p>
        </div>

        {/* Method Selection */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-4">
            생성 방식 선택
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setMethod("text")}
              className={`p-6 rounded-xl border-2 transition-all ${
                method === "text"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Type className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">텍스트로 시작</h3>
              <p className="text-sm text-gray-600">
                설명만으로 생성
              </p>
            </button>

            <button
              onClick={() => setMethod("image")}
              className={`p-6 rounded-xl border-2 transition-all ${
                method === "image"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">이미지 참고</h3>
              <p className="text-sm text-gray-600">
                사진 업로드해서 생성
              </p>
            </button>

            <button
              onClick={() => setMethod("variation")}
              className={`p-6 rounded-xl border-2 transition-all ${
                method === "variation"
                  ? "border-purple-600 bg-purple-50"
                  : "border-gray-200 hover:border-purple-300"
              }`}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">기존 변형</h3>
              <p className="text-sm text-gray-600">
                기존 캐릭터 수정
              </p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-xl font-black text-gray-900 mb-6">
                기본 정보
              </h2>
              
              {/* Character Name */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  캐릭터 이름
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 민지, 토리, 뽀로로..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Mood Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  성격/무드 (복수 선택 가능)
                </label>
                <div className="flex flex-wrap gap-2">
                  {moods.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMood(m)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                        mood.includes(m)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  외형 설명
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="캐릭터의 외모, 특징, 스타일을 자유롭게 설명해주세요.&#10;예: 20대 여성, 긴 생머리, 안경 착용, 캐주얼한 옷차림"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  상세할수록 더 정확한 결과를 얻을 수 있어요
                </p>
              </div>

              {/* Image Upload */}
              {method === "image" && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    참고 이미지 업로드
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-all cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      클릭하거나 드래그해서 업로드
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG 지원 · 최대 10MB
                    </p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                disabled={!name || !description}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                캐릭터 생성하기
              </Button>
            </div>
          </div>

          {/* Right - Guide */}
          <div className="space-y-6">
            {/* Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900">생성 팁</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span className="text-sm text-gray-700">
                    구체적인 설명일수록 더 정확한 결과가 나와요
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span className="text-sm text-gray-700">
                    성격/무드는 캐릭터의 분위기를 결정해요
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span className="text-sm text-gray-700">
                    여러 번 생성해서 마음에 드는 것을 선택하세요
                  </span>
                </li>
              </ul>
            </div>

            {/* Examples */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">예시 프롬프트</h3>
              <div className="space-y-3">
                <button className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-all">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    직장인 캐릭터
                  </p>
                  <p className="text-xs text-gray-600">
                    30대 남성, 정장 착용, 피곤한 표정, 커피 들고 있음
                  </p>
                </button>
                <button className="w-full p-4 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-all">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    동물 캐릭터
                  </p>
                  <p className="text-xs text-gray-600">
                    귀여운 곰돌이, 파란색 후드티, 큰 눈, 통통한 체형
                  </p>
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900">안내</h3>
              </div>
              <p className="text-sm text-gray-700">
                생성된 캐릭터는 언제든지 수정하고 다시 생성할 수 있습니다.
                마음에 드는 결과가 나올 때까지 여러 번 시도해보세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

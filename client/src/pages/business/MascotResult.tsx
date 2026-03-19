import { DashboardLayout } from "@/components/DashboardLayout";
import {
  ArrowLeft,
  Download,
  Edit,
  Share2,
  Star,
  Sparkles,
  Check,
  FileCheck,
  Clock,
  GitBranch,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { useState } from "react";
const olliMascot = "/favicon.png";

export function MascotResult() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);

  const results = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
      style: "Friendly",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
      style: "Professional",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop",
      style: "Playful",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=400&h=400&fit=crop",
      style: "Modern",
    },
  ];

  return (
    <DashboardLayout userType="business">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/business/mascot")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              마스코트 초안 생성 완료! 🎉
            </h1>
            <p className="text-gray-600">
              초안을 검토하고 수정 후 승인 프로세스를 시작하세요
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <GitBranch className="w-4 h-4 mr-2" />
              버전 관리
            </Button>
          </div>
        </div>
      </div>

      {/* Status & Workflow */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-900">검토·승인 워크플로우</h3>
          <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
            <Clock className="w-4 h-4" />
            시안 검토 중
          </span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[
            { step: "AI 생성", icon: Sparkles, status: "complete" },
            { step: "시안 저장", icon: FileCheck, status: "current" },
            { step: "내부 검토", icon: Edit, status: "pending" },
            { step: "승인 대기", icon: Clock, status: "pending" },
            { step: "확정본", icon: Check, status: "pending" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center text-center p-4 rounded-xl ${
                item.status === "complete"
                  ? "bg-green-100 border border-green-300"
                  : item.status === "current"
                  ? "bg-blue-100 border-2 border-blue-500"
                  : "bg-gray-100 border border-gray-300"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  item.status === "complete"
                    ? "bg-green-500"
                    : item.status === "current"
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-700">{item.step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {results.map((result) => (
          <div
            key={result.id}
            onClick={() => setSelected(result.id)}
            className={`relative group cursor-pointer rounded-2xl overflow-hidden border-4 transition-all ${
              selected === result.id
                ? "border-blue-600 shadow-2xl scale-105"
                : "border-transparent hover:border-blue-200 hover:shadow-lg"
            }`}
          >
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={result.image}
                alt={`Generated mascot ${result.id}`}
                className="w-full h-full object-cover"
              />
              {selected === result.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold mb-2">{result.style} 스타일</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      수정
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      다운로드
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white">
              <p className="text-sm font-semibold text-gray-700">{result.style} 스타일</p>
              <p className="text-xs text-gray-500">브랜드/공공 마스코트 옵션</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            다음 단계
          </h2>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start"
              onClick={() => navigate("/business/content")}
            >
              <div className="text-left">
                <div className="font-bold mb-1">브랜드 콘텐츠 만들기</div>
                <div className="text-xs text-gray-500">마스코트로 직접 콘텐츠 제작</div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full h-auto py-4 justify-start"
              onClick={() => navigate("/business/creators")}
            >
              <div className="text-left">
                <div className="font-bold mb-1 flex items-center gap-2">
                  작가와 협업하기
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-xs text-gray-500">전문 작가에게 작업 의뢰</div>
              </div>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-black text-gray-900 mb-4">세부 수정 옵션</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-4 flex-col">
              <div className="font-bold mb-1">색상 변경</div>
              <div className="text-xs text-gray-500">브랜드 컬러 적용</div>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <div className="font-bold mb-1">스타일 조정</div>
              <div className="text-xs text-gray-500">톤앤매너 수정</div>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <div className="font-bold mb-1">표정 추가</div>
              <div className="text-xs text-gray-500">다양한 감정 생성</div>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col">
              <div className="font-bold mb-1">포즈 생성</div>
              <div className="text-xs text-gray-500">액션 포즈 만들기</div>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
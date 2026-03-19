import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Edit, Check, Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function CharacterResult() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);

  const results = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop",
      style: "Modern",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
      style: "Cute",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
      style: "Elegant",
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop",
      style: "Dynamic",
    },
  ];

  return (
    <DashboardLayout userType="creator">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/creator/character/new")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로 가기
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              캐릭터 생성 완료! 🎉
            </h1>
            <p className="text-gray-600">
              마음에 드는 결과를 선택하고 저장하세요
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/creator/character/new")}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 생성하기
            </Button>
            <Button
              disabled={selected === null}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              onClick={() => navigate("/creator/characters")}
            >
              <Check className="w-4 h-4 mr-2" />
              선택 후 저장
            </Button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {results.map((result) => (
          <div
            key={result.id}
            onClick={() => setSelected(result.id)}
            className={`relative group cursor-pointer rounded-2xl overflow-hidden border-4 transition-all ${
              selected === result.id
                ? "border-purple-600 shadow-2xl scale-105"
                : "border-transparent hover:border-purple-200 hover:shadow-lg"
            }`}
          >
            <div className="aspect-square bg-gray-100 relative">
              <img
                src={result.image}
                alt={`Generated character ${result.id}`}
                className="w-full h-full object-cover"
              />
              {selected === result.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
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
              <p className="text-xs text-gray-500">생성일: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modification Options */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          세부 수정 옵션
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col">
            <div className="font-bold mb-1">표정 변경</div>
            <div className="text-xs text-gray-500">다양한 감정 표현 추가</div>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col">
            <div className="font-bold mb-1">포즈 변경</div>
            <div className="text-xs text-gray-500">액션 포즈 생성</div>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col">
            <div className="font-bold mb-1">배경 추가</div>
            <div className="text-xs text-gray-500">캐릭터와 어울리는 배경</div>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

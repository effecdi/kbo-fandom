import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Sparkles,
  FileText,
  Users,
  Wand2,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export function ContentCreate() {
  const navigate = useNavigate();

  return (
    <DashboardLayout userType="business">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">
            콘텐츠 제작
          </h1>
          <p className="text-muted-foreground">
            마스코트로 직접 콘텐츠를 만들거나 전문 작가와 협업하세요
          </p>
        </div>

        {/* Creation Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate("/business/content/editor")}
            className="bg-card rounded-2xl p-8 border-2 border-border hover:border-indigo-600 hover:shadow-lg transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3">
              AI로 직접 제작
            </h2>
            <p className="text-muted-foreground mb-4">
              보유한 마스코트를 활용해 템플릿 기반으로 빠르게 콘텐츠를 생성하세요
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                공지 배너, 행사 안내 템플릿
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                SNS 카드뉴스 자동 생성
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                정책 홍보용 인스타툰
              </li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              직접 제작 시작
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </button>

          <button
            onClick={() => navigate("/business/collaboration/new")}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200 hover:border-purple-600 hover:shadow-xl transition-all text-left group"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3">
              작가와 협업 🎨
            </h2>
            <p className="text-muted-foreground mb-4">
              전문 작가와 함께 스토리텔링이 필요한 고퀄리티 콘텐츠를 제작하세요
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                지역행사 · 정책홍보 인스타툰
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                AI 기반 작가 매칭
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                브랜드/기관 맞춤형 스토리
              </li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              작가 협업 시작
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </button>
        </div>

        {/* Recent Contents */}
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-foreground">
              최근 제작한 콘텐츠
            </h2>
            <Button variant="ghost" size="sm">
              전체 보기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { id: 1, title: "봄맞이 행사 안내", date: "2024.03.01", type: "직접 제작" },
              { id: 2, title: "정책 홍보 인스타툰", date: "2024.02.25", type: "작가 협업" },
              { id: 3, title: "공지사항 배너", date: "2024.02.20", type: "직접 제작" },
            ].map((content) => (
              <div key={content.id} className="group cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl mb-3 flex items-center justify-center group-hover:shadow-lg transition-all relative overflow-hidden">
                  <FileText className="w-16 h-16 text-indigo-300" />
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold text-foreground px-2 py-1 rounded-full">
                      {content.type}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-foreground mb-1">{content.title}</h3>
                <p className="text-sm text-muted-foreground">{content.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
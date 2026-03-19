import {
  Building2,
  TrendingUp,
  Target,
  Users,
  Award,
  BarChart3,
  CheckCircle2,
  Zap,
  Clock,
  Shield,
  ArrowRight,
  Sparkles,
  Search,
  FileText,
  Send,
  Activity,
  Star,
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
const olliMascot = "/favicon.png";

export function BusinessPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src={olliMascot}
                alt="OLLI"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-2xl font-black text-gray-900">OLLI</span>
              <p className="text-xs text-indigo-600 font-semibold">for Business</p>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 font-semibold">
              기능
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 font-semibold">
              활용방법
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600 font-semibold">
              요금제
            </a>
            <Link to="/login/business" className="text-gray-600 hover:text-indigo-600 font-semibold">
              로그인
            </Link>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              무료 체험 시작
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-100 rounded-full px-4 py-2 mb-6">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-indigo-700 font-semibold text-sm">
                  기업 · 기관 · 관공서 전용
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6 text-gray-900 leading-tight">
                브랜드 마스코트를
                <br />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                  직접 만들고
                </span>
                <br />
                작가와 협업까지
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                기업 브랜드부터 공공기관 홍보까지.
                <br />
                마스코트 생성, 작가 매칭, 협업 관리를 한 곳에서.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg px-8 py-6 hover:shadow-xl transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  무료로 시작하기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-indigo-600 text-indigo-600 text-lg px-8 py-6 hover:bg-indigo-50"
                >
                  <Play className="w-5 h-5 mr-2" />
                  데모 영상 보기
                </Button>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-600 font-semibold">
                    10,000+ 활동 작가
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-600 font-semibold">
                    캠페인 성공률 94%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl p-6">
                {/* Mock Dashboard */}
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="font-bold text-gray-900">추천 작가</h3>
                    <span className="text-sm text-indigo-600 font-semibold">
                      AI 분석 완료
                    </span>
                  </div>
                  {/* Creator Cards */}
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
                    >
                      <div className="w-16 h-16 flex items-center justify-center bg-white rounded-xl">
                        <img
                          src={olliMascot}
                          alt={`Creator ${item}`}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">작가 {item}</p>
                        <p className="text-sm text-gray-600">
                          팔로워 {(Math.random() * 50 + 10).toFixed(1)}K
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-gray-700">
                          {(Math.random() * 0.5 + 4.5).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span className="font-bold text-sm">96% 매칭률</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-900">
            이런 고민 있으셨나요?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            OLLI가 광고주님들의 인플루언서 마케팅 페인포인트를 해결합니다
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                problem: "작가 찾기가 너무 어려워요",
                solution: "AI가 브랜드 맞춤 작가를 자동 추천",
                color: "red",
              },
              {
                icon: FileText,
                problem: "정보가 부족해서 판단하기 힘들어요",
                solution: "상세한 미디어키트로 한눈에 비교",
                color: "orange",
              },
              {
                icon: Clock,
                problem: "협업 진행이 지연돼요",
                solution: "제안부터 관리까지 원스톱 플랫폼",
                color: "blue",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all"
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-xl flex items-center justify-center mb-6 mx-auto`}
                >
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  {item.problem}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600" />
                  <ArrowRight className="w-5 h-5 text-indigo-600" />
                  <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600" />
                </div>
                <p className="text-indigo-600 font-semibold">
                  {item.solution}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              OLLI만의 차별화된 기능
            </h2>
            <p className="text-xl text-gray-600">
              안전한 검토·승인 프로세스부터 자산 관리까지
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Shield,
                title: "안전한 검토·승인 프로세스",
                description:
                  "AI 생성 후 내부 검토와 수정을 거쳐 승인할 수 있습니다. 관공서·기관의 보수적 업무 흐름에 최적화되었습니다.",
                features: [
                  "시안 저장 및 버전 비교",
                  "승인 대기·확정본 관리",
                  "수정 이력 추적",
                ],
                color: "green",
              },
              {
                icon: FileText,
                title: "마스코트 자산 라이브러리",
                description:
                  "기본형부터 표정형, 계절형, 캠페인형까지 다양한 버전을 체계적으로 관리합니다.",
                features: [
                  "기본·표정·계절·캠페인·행사형",
                  "일관된 디자인 시스템",
                  "언제든 재사용 가능",
                ],
                color: "purple",
              },
              {
                icon: Target,
                title: "템플릿형 콘텐츠 생성",
                description:
                  "공지사항, 행사 안내, 정책 홍보 등 관공서·기관에 필요한 콘텐츠를 빠르게 제작합니다.",
                features: [
                  "공지 배너 & 행사 안내",
                  "SNS 카드뉴스",
                  "인스타툰형 정책 홍보",
                ],
                color: "pink",
              },
              {
                icon: Users,
                title: "필요시 작가 협업 연결",
                description:
                  "직접 제작하다 한계가 있을 때 전문 작가에게 확장을 요청할 수 있습니다.",
                features: [
                  "지역행사 인스타툰 제작",
                  "정책홍보용 스토리텔링",
                  "AI 기반 작가 매칭",
                ],
                color: "blue",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 hover:shadow-2xl transition-all"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-2xl flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.features.map((item, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              6단계로 완성되는 캠페인
            </h2>
            <p className="text-xl text-gray-600">
              가입부터 성과 분석까지, 심플하고 효율적인 프로세스
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200" />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  icon: Building2,
                  title: "브랜드 정보 입력",
                  description:
                    "브랜드 특성, 타겟 오디언스, 캠페인 목적을 간단히 입력하세요.",
                },
                {
                  step: "02",
                  icon: Target,
                  title: "AI 작가 추천",
                  description:
                    "입력된 정보를 기반으로 가장 적합한 작가들을 자동으로 추천받습니다.",
                },
                {
                  step: "03",
                  icon: FileText,
                  title: "미디어키트 확인",
                  description:
                    "작가별 포트폴리오, 통계, 과거 협업 성과를 상세히 비교합니다.",
                },
                {
                  step: "04",
                  icon: Send,
                  title: "협업 제안 발송",
                  description:
                    "선택한 작가에게 조건과 함께 협업 제안을 전송합니다.",
                },
                {
                  step: "05",
                  icon: Activity,
                  title: "캠페인 진행",
                  description:
                    "플랫폼에서 일정, 콘텐츠 검토, 커뮤니케이션을 관리합니다.",
                },
                {
                  step: "06",
                  icon: BarChart3,
                  title: "성과 분석",
                  description:
                    "캠페인 성과를 실시간으로 확인하고 리포트를 자동 생성합니다.",
                },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-8 hover:shadow-xl transition-all h-full">
                    {/* Step Number */}
                    <div className="text-6xl font-black text-indigo-100 mb-4">
                      {item.step}
                    </div>
                    {/* Icon */}
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 relative z-10">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
              OLLI와 함께라면
            </h2>
            <p className="text-xl text-white/90">
              데이터로 입증된 성과, 신뢰할 수 있는 결과
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Clock,
                value: "24시간",
                label: "평균 매칭 시간",
                description: "빠른 작가 발굴",
              },
              {
                icon: TrendingUp,
                value: "94%",
                label: "캠페인 성공률",
                description: "높은 완료율",
              },
              {
                icon: Award,
                value: "87%",
                label: "재계약률",
                description: "만족도 기반",
              },
              {
                icon: Users,
                value: "10K+",
                label: "활동 작가",
                description: "다양한 선택지",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all text-center"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-5xl font-black text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-lg font-bold text-white mb-1">
                  {stat.label}
                </p>
                <p className="text-white/80 text-sm">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              투명한 요금제
            </h2>
            <p className="text-xl text-gray-600">
              규모에 맞는 플랜을 선택하세요
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "스타터",
                price: "₩99,000",
                period: "월",
                description: "스타트업과 소규모 브랜드에 적합",
                features: [
                  "월 3개 캠페인",
                  "기본 AI 매칭",
                  "미디어키트 확인",
                  "이메일 지원",
                ],
                cta: "시작하기",
                popular: false,
              },
              {
                name: "비즈니스",
                price: "₩299,000",
                period: "월",
                description: "성장하는 기업을 위한 최적의 선택",
                features: [
                  "무제한 캠페인",
                  "프리미엄 AI 매칭",
                  "상세 성과 분석",
                  "전담 매니저",
                  "우선 작가 접근",
                ],
                cta: "추천 플랜",
                popular: true,
              },
              {
                name: "엔터프라이즈",
                price: "맞춤 견적",
                period: "",
                description: "대규모 조직을 위한 커스텀 솔루션",
                features: [
                  "비즈니스의 모든 기능",
                  "전용 API 연동",
                  "커스텀 리포팅",
                  "24/7 전화 지원",
                  "SLA 보장",
                ],
                cta: "문의하기",
                popular: false,
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-3xl p-8 ${
                  plan.popular
                    ? "ring-4 ring-indigo-600 shadow-2xl scale-105"
                    : "border-2 border-gray-200 shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    가장 인기있는
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {plan.description}
                  </p>
                  <div className="mb-2">
                    <span className="text-5xl font-black text-gray-900">
                      {plan.price}
                    </span>
                  </div>
                  {plan.period && (
                    <p className="text-gray-600">/{plan.period}</p>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full py-6 ${
                    plan.popular
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
              고객 성공 사례
            </h2>
            <p className="text-xl text-gray-600">
              실제 브랜드들의 OLLI 활용 후기
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                company: "뷰티 브랜드 A",
                role: "마케팅 팀장",
                content:
                  "AI 매칭 덕분에 우리 브랜드와 완벽하게 맞는 작가들을 찾았어요. 캠페인 성과가 이전 대비 3배 증가했습니다.",
                result: "ROI 300% 증가",
              },
              {
                company: "F&B 스타트업 B",
                role: "대표",
                content:
                  "작가 발굴에 쓰던 시간을 90% 줄였어요. 미디어키트로 사전 검토가 가능해서 의사결정이 빨라졌습니다.",
                result: "작업 시간 90% 단축",
              },
              {
                company: "패션 브랜드 C",
                role: "브랜드 매니저",
                content:
                  "여러 작가와의 협업을 한 곳에서 관리할 수 있어서 너무 편해요. 성과 분석 리포트도 자동으로 나와서 좋습니다.",
                result: "협업 효율 200% 향상",
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="pt-6 border-t border-gray-200">
                  <p className="font-bold text-gray-900">
                    {testimonial.company}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {testimonial.role}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-indigo-50 rounded-full px-4 py-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-600">
                      {testimonial.result}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 flex items-center justify-center bg-white/20 rounded-3xl backdrop-blur-sm">
              <img
                src={olliMascot}
                alt="OLLI"
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-white/90 mb-8">
            14일 무료 체험으로 OLLI의 강력한 기능을 경험해보세요.
            <br />
            신용카드 등록 없이 바로 시작할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 text-xl px-12 py-8 shadow-2xl"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              무료 체험 시작
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-xl px-12 py-8"
            >
              영업팀과 상담
              <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
          <p className="text-white/80 mt-6">
            궁금한 점이 있으신가요?{" "}
            <a href="#" className="underline font-semibold">
              자주 묻는 질문
            </a>
            을 확인하세요
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src={olliMascot}
                    alt="OLLI"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xl font-black text-white">OLLI</span>
                  <p className="text-xs text-indigo-400">for Business</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                AI 기반 인스타툰 작가 매칭 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">서비스</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    작가 탐색
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    캠페인 관리
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    성과 분석
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">지원</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    도움말 센터
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API 문서
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    문의하기
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">회사</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    채용
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    파트너십
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            © 2026 OLLI for Business. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
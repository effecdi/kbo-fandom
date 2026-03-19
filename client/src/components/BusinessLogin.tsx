import { useState } from "react";
import {
  Award,
  Building2,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
const olliMascot = "/favicon.png";

export function BusinessLogin() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src={olliMascot}
                alt="OLLI"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">OLLI</h1>
              <p className="text-xs text-gray-500 font-semibold">for Business</p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2 mb-8 bg-gray-100 rounded-xl p-1">
            <button className="flex-1 px-4 py-3 rounded-lg bg-white shadow-sm text-gray-900 font-semibold text-sm transition-all">
              광고주 로그인
            </button>
            <button className="flex-1 px-4 py-3 rounded-lg text-gray-600 font-semibold text-sm hover:text-gray-900 transition-all">
              작가 로그인
            </button>
          </div>

          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              환영합니다! 👋
            </h2>
            <p className="text-gray-600">
              브랜드에 맞는 인스타툰 작가를 찾아보세요
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                이메일
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="business@company.com"
                  className="pl-11 h-12 border-gray-300 focus:ring-purple-600 focus:border-purple-600"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 border-gray-300 focus:ring-purple-600 focus:border-purple-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  로그인 상태 유지
                </label>
              </div>
              <a
                href="#"
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold"
              >
                비밀번호 찾기
              </a>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all"
            >
              로그인
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-12 border-gray-300 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 계속하기
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 border-gray-300 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-3" fill="#03C75A" viewBox="0 0 24 24">
                <path d="M13.5 2C7.152 2 2 7.152 2 13.5S7.152 25 13.5 25 25 19.848 25 13.5 19.848 2 13.5 2zm-1.5 18.5h-2v-7h2v7zm7 0h-2v-7c0-1.1-.9-2-2-2h-1v9h-2v-7h-1c-1.1 0-2 .9-2 2v5h-2v-7c0-2.21 1.79-4 4-4h2c2.21 0 4 1.79 4 4v7z" />
              </svg>
              네이버로 계속하기
            </Button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              아직 계정이 없으신가요?{" "}
              <a
                href="#"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                광고주 계정 만들기
              </a>
            </p>
          </div>

          {/* Help Links */}
          <div className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-700">
              고객지원
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700">
              이용약관
            </a>
            <span>•</span>
            <a href="#" className="hover:text-gray-700">
              개인정보처리방침
            </a>
          </div>
        </div>
      </div>

      {/* Right Side - Brand Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-12">
            <Award className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">
              OLLI Business Platform
            </span>
          </div>

          {/* Main Message */}
          <div className="mb-12">
            <h2 className="text-5xl font-black text-white mb-6 leading-tight">
              브랜드에 딱 맞는
              <br />
              인스타툰 작가를
              <br />
              AI가 찾아드립니다
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              데이터 기반 매칭으로 효율적인 광고 집행,
              <br />
              OLLI에서 시작하세요.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {[
              {
                icon: Users,
                title: "10,000+ 활동 작가",
                description: "다양한 스타일과 팔로워를 보유한 검증된 크리에이터",
              },
              {
                icon: TrendingUp,
                title: "AI 기반 매칭",
                description: "브랜드 톤앤매너에 맞는 최적의 작가를 자동 추천",
              },
              {
                icon: Building2,
                title: "원스톱 캠페인 관리",
                description: "제안부터 집행, 성과 분석까지 한 곳에서",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6"
              >
                <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          {[
            { label: "평균 매칭 시간", value: "24시간" },
            { label: "캠페인 성공률", value: "94%" },
            { label: "재계약률", value: "87%" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl font-black text-white mb-1">
                {stat.value}
              </p>
              <p className="text-white/80 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

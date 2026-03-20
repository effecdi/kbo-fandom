import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Building2, Mail, Lock, CheckCircle2, Eye, EyeOff, Phone, Briefcase } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
const olliMascot = "/favicon.png";

export function Signup() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"creator" | "business">("creator");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로
          </Button>

          {/* Logo & Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src={olliMascot} alt="OLLI" className="w-full h-full" />
              </div>
              <h1 className="text-3xl font-black text-foreground">
                OLLI
              </h1>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              새로운 계정 만들기
            </h2>
            <p className="text-muted-foreground">
              AI 인스타툰 제작을 시작하세요
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl p-8 shadow-xl border bg-card border-border">
            {/* Tab Selector */}
            <div className="grid grid-cols-2 gap-3 mb-8 p-2 rounded-2xl bg-muted/50">
              <button
                onClick={() => setSelectedTab("creator")}
                className={`py-4 px-6 rounded-xl font-bold text-sm transition-all ${
                  selectedTab === "creator"
                    ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                작가 계정
              </button>
              <button
                onClick={() => setSelectedTab("business")}
                className={`py-4 px-6 rounded-xl font-bold text-sm transition-all ${
                  selectedTab === "business"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                기업/기관
              </button>
            </div>

            {/* Form */}
            <form className="space-y-5">
              {/* Name/Company Name */}
              <div>
                <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                  {selectedTab === "creator" ? "이름" : "기업/기관명"}
                </Label>
                <div className="relative">
                  {selectedTab === "creator" ? (
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  )}
                  <Input
                    placeholder={selectedTab === "creator" ? "홍길동" : "(주)올리코리아"}
                    className="pl-12 h-12 text-base bg-transparent border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Business Type (Business only) */}
              {selectedTab === "business" && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                    조직 유형
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      className="w-full pl-12 h-12 text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent border-border text-foreground"
                    >
                      <option value="">선택해주세요</option>
                      <option value="enterprise">기업</option>
                      <option value="government">관공서</option>
                      <option value="public">공공기관</option>
                      <option value="nonprofit">비영리단체</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                  이메일
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    className="pl-12 h-12 text-base bg-transparent border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Phone (Business only) */}
              {selectedTab === "business" && (
                <div>
                  <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                    연락처
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="010-1234-5678"
                      className="pl-12 h-12 text-base bg-transparent border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                  비밀번호
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="8자 이상, 영문/숫자 포함"
                    className="pl-12 pr-12 h-12 text-base bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                  비밀번호 확인
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="pl-12 pr-12 h-12 text-base bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <Eye className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-teal-500 focus:ring-teal-500 mt-0.5"
                  />
                  <label htmlFor="terms" className="text-sm text-foreground">
                    <span className="font-semibold">이용약관</span>에 동의합니다 (필수)
                  </label>
                </div>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={agreedToPrivacy}
                    onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                    className="w-5 h-5 rounded border-border text-teal-500 focus:ring-teal-500 mt-0.5"
                  />
                  <label htmlFor="privacy" className="text-sm text-foreground">
                    <span className="font-semibold">개인정보처리방침</span>에 동의합니다 (필수)
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full h-14 text-base font-bold shadow-lg ${
                  selectedTab === "creator"
                    ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6]"
                    : "bg-gradient-to-r from-blue-500 to-indigo-500"
                } text-white hover:shadow-xl`}
                disabled={!agreedToTerms || !agreedToPrivacy}
              >
                계정 만들기
              </Button>

              {/* Divider */}
              <div className="relative my-6">
                <Separator className="bg-muted" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-semibold bg-card text-muted-foreground">
                  또는
                </span>
              </div>

              {/* Social Signup */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-border bg-muted text-foreground hover:bg-muted/80"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google로 계속하기
                </Button>
              </div>

              {/* Login Link */}
              <p className="text-center text-sm mt-6 text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className={`font-bold ${
                    selectedTab === "creator" ? "text-[#00e5cc]" : "text-blue-500"
                  } hover:underline`}
                >
                  로그인
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Info Panel */}
      <div className={`hidden lg:flex lg:w-1/2 p-12 items-center justify-center ${
        selectedTab === "creator"
          ? "bg-gradient-to-br from-[#00e5cc] to-[#00b3a6]"
          : "bg-gradient-to-br from-blue-500 to-indigo-500"
      }`}>
        <div className="max-w-lg text-white">
          <h2 className="text-4xl font-black mb-6">
            {selectedTab === "creator"
              ? "AI로 쉽게 만드는 인스타툰"
              : "브랜드 마스코트 & 작가 협업"}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {selectedTab === "creator"
              ? "창작부터 수익화까지, OLLI와 함께 시작하세요"
              : "공공기관과 기업을 위한 안전한 콘텐츠 제작 플랫폼"}
          </p>

          <div className="space-y-4">
            {selectedTab === "creator" ? (
              <>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">AI 캐릭터 생성</h3>
                    <p className="text-white/80">텍스트만으로 나만의 캐릭터를 만드세요</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">스토리 에디터</h3>
                    <p className="text-white/80">직관적인 툴로 쉽게 툰을 완성하세요</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">광고 매칭</h3>
                    <p className="text-white/80">AI가 최적의 광고 기회를 찾아드립니다</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">브랜드 마스코트 생성</h3>
                    <p className="text-white/80">AI로 브랜드 정체성을 담은 마스코트 제작</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">승인 워크플로우</h3>
                    <p className="text-white/80">검토와 승인 프로세스로 안전하게 관리</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-lg mb-1">작가 협업</h3>
                    <p className="text-white/80">검증된 크리에이터와 쉽게 연결</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

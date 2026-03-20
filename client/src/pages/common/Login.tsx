import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Building2, Mail, Lock, LogIn, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "@/components/theme-provider";
const olliMascot = "/favicon.png";

export function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedTab, setSelectedTab] = useState<"creator" | "business">("creator");

  const handleLogin = (userType: "creator" | "business") => {
    // Mock login - redirect to onboarding for role selection
    navigate("/onboarding");
  };

  return (
    <div className={`min-h-screen flex ${theme === "dark" ? "bg-gray-900" : "bg-muted"}`}>
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className={`mb-8 ${theme === "dark" ? "text-gray-300 hover:text-white hover:bg-gray-800" : ""}`}
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
              <h1 className={`text-3xl font-black ${theme === "dark" ? "text-white" : "text-foreground"}`}>
                OLLI
              </h1>
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${theme === "dark" ? "text-white" : "text-foreground"}`}>
              다시 오신 것을 환영합니다
            </h2>
            <p className={theme === "dark" ? "text-gray-300" : "text-foreground"}>
              계정에 로그인하여 계속하세요
            </p>
          </div>

          {/* Form Card */}
          <div className={`rounded-3xl p-8 shadow-2xl border ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-card border-border"}`}>
            <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "creator" | "business")}>
              {/* Custom Tab Selector */}
              <div className={`grid grid-cols-2 gap-3 mb-8 p-2 rounded-2xl ${theme === "dark" ? "bg-gray-700/50" : "bg-muted"}`}>
                <button
                  onClick={() => setSelectedTab("creator")}
                  className={`py-4 px-6 rounded-xl font-bold text-sm transition-all ${
                    selectedTab === "creator"
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white shadow-lg"
                        : "bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white shadow-lg"
                      : theme === "dark"
                      ? "text-gray-300 hover:text-white hover:bg-gray-700"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  작가 계정
                </button>
                <button
                  onClick={() => setSelectedTab("business")}
                  className={`py-4 px-6 rounded-xl font-bold text-sm transition-all ${
                    selectedTab === "business"
                      ? theme === "dark"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                        : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                      : theme === "dark"
                      ? "text-gray-300 hover:text-white hover:bg-gray-700"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  기업/기관
                </button>
              </div>

              <TabsContent value="creator" className="mt-0">
                <form className="space-y-5">
                  {/* Email */}
                  <div>
                    <Label className={`text-sm font-semibold mb-2 block ${theme === "dark" ? "text-gray-300" : "text-foreground"}`}>
                      이메일
                    </Label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-muted-foreground"}`} />
                      <Input
                        id="creator-email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`pl-12 h-12 text-base ${
                          theme === "dark" 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                            : "bg-card border-border"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label className={`text-sm font-semibold mb-2 block ${theme === "dark" ? "text-gray-300" : "text-foreground"}`}>
                      비밀번호
                    </Label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-muted-foreground"}`} />
                      <Input
                        id="creator-password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`pl-12 h-12 text-base ${
                          theme === "dark" 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                            : "bg-card border-border"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-teal-500 focus:ring-teal-500" />
                      <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                        로그인 상태 유지
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-sm font-semibold text-teal-500 hover:text-teal-600 transition-colors"
                    >
                      비밀번호 찾기
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="button"
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={() => handleLogin("creator")}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    로그인
                  </Button>

                  {/* Divider */}
                  <div className="relative my-8">
                    <Separator className={theme === "dark" ? "bg-gray-700" : "bg-muted"} />
                    <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-semibold ${
                      theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-card text-muted-foreground"
                    }`}>
                      또는
                    </span>
                  </div>

                  {/* Social Login */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-full h-12 ${
                        theme === "dark" 
                          ? "border-gray-700 text-white hover:bg-gray-800" 
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-2" alt="Google" />
                      Google로 계속하기
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-full h-12 ${
                        theme === "dark" 
                          ? "border-gray-700 text-white hover:bg-gray-800" 
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="w-5 h-5 mr-2 bg-yellow-400 rounded-full" />
                      카카오로 계속하기
                    </Button>
                  </div>

                  {/* Signup Link */}
                  <p className={`text-center text-sm pt-4 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                    계정이 없으신가요?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="font-bold text-teal-500 hover:text-teal-600 transition-colors"
                    >
                      회원가입
                    </button>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="business" className="mt-0">
                <form className="space-y-5">
                  {/* Email */}
                  <div>
                    <Label className={`text-sm font-semibold mb-2 block ${theme === "dark" ? "text-gray-300" : "text-foreground"}`}>
                      업무 이메일
                    </Label>
                    <div className="relative">
                      <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-muted-foreground"}`} />
                      <Input
                        id="business-email"
                        type="email"
                        placeholder="your@company.com"
                        className={`pl-12 h-12 text-base ${
                          theme === "dark" 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                            : "bg-card border-border"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label className={`text-sm font-semibold mb-2 block ${theme === "dark" ? "text-gray-300" : "text-foreground"}`}>
                      비밀번호
                    </Label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === "dark" ? "text-gray-500" : "text-muted-foreground"}`} />
                      <Input
                        id="business-password"
                        type="password"
                        placeholder="비밀번호를 입력하세요"
                        className={`pl-12 h-12 text-base ${
                          theme === "dark" 
                            ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
                            : "bg-card border-border"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded border-border text-blue-500 focus:ring-blue-500" />
                      <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                        로그인 상태 유지
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      비밀번호 찾기
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="button"
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all"
                    onClick={() => handleLogin("business")}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    로그인
                  </Button>

                  {/* Divider */}
                  <div className="relative my-8">
                    <Separator className={theme === "dark" ? "bg-gray-700" : "bg-muted"} />
                    <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-semibold ${
                      theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-card text-muted-foreground"
                    }`}>
                      또는
                    </span>
                  </div>

                  {/* Social Login */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-full h-12 ${
                        theme === "dark" 
                          ? "border-gray-700 text-white hover:bg-gray-800" 
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-2" alt="Google" />
                      Google Workspace로 계속하기
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={`w-full h-12 ${
                        theme === "dark" 
                          ? "border-gray-700 text-white hover:bg-gray-800" 
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Building2 className="w-5 h-5 mr-2" />
                      기업 이메일로 계속하기
                    </Button>
                  </div>

                  {/* Signup Link */}
                  <p className={`text-center text-sm pt-4 ${theme === "dark" ? "text-gray-400" : "text-muted-foreground"}`}>
                    계정이 없으신가요?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="font-bold text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      회원가입
                    </button>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits */}
      <div className={`hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden ${
        selectedTab === "creator" 
          ? "bg-gradient-to-br from-[#00e5cc] to-[#00b3a6]" 
          : "bg-gradient-to-br from-blue-500 to-indigo-500"
      }`}>
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md p-12">
          {/* Icon Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">
              {selectedTab === "creator" ? "작가님, 다시 만나서 반가워요!" : "안전하고 효율적인 업무 환경"}
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            {selectedTab === "creator" 
              ? "창작의 여정을\n계속하세요" 
              : "스마트한 콘텐츠\n관리를 시작하세요"}
          </h2>
          <p className="text-white/90 text-lg mb-10">
            {selectedTab === "creator"
              ? "AI 도구와 함께 더 빠르고 쉽게 인스타툰을 제작하고, 수익화의 기회를 발견하세요."
              : "승인 워크플로우와 버전 관리로 브랜드 자산을 안전하게 관리하고, 최적의 작가와 협업하세요."}
          </p>

          {/* Features List */}
          <div className="space-y-5">
            {selectedTab === "creator" ? (
              <>
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">빠른 제작</h3>
                    <p className="text-white/80 text-sm">AI로 1분만에 캐릭터와 스토리 생성</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">수익 증대</h3>
                    <p className="text-white/80 text-sm">Ad Match AI로 자동 광고 매칭</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">간편한 관리</h3>
                    <p className="text-white/80 text-sm">모든 작품을 한 곳에서 관리</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">안전한 승인</h3>
                    <p className="text-white/80 text-sm">4단계 승인 프로세스로 안전하게</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">효율적인 협업</h3>
                    <p className="text-white/80 text-sm">검증된 작가와 즉시 협업 시작</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-1">브랜드 일관성</h3>
                    <p className="text-white/80 text-sm">버전 관리로 자산 통합 관리</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quote */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white/90 text-sm italic mb-3">
              "{selectedTab === "creator" 
                ? "OLLI 덕분에 작업 시간이 절반으로 줄었고, 수익은 2배로 늘었어요!" 
                : "승인 프로세스가 있어 내부 검토가 훨씬 수월해졌습니다."}"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20" />
              <div>
                <p className="text-white font-bold text-sm">
                  {selectedTab === "creator" ? "김작가" : "서울시청"}
                </p>
                <p className="text-white/70 text-xs">
                  {selectedTab === "creator" ? "인스타툰 크리에이터" : "공공기관"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
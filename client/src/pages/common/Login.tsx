import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Lock, LogIn, Heart, Music, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { getFandomProfile } from "@/lib/local-store";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const profile = getFandomProfile();
    if (profile?.verified) {
      navigate("/fandom");
    } else {
      navigate("/fandom/onboarding");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            홈으로
          </Button>

          {/* Logo & Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                MY FANDOM
              </h1>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              나만의 팬덤 세계로
            </h2>
            <p className="text-muted-foreground">
              팬아트, 소통, 이벤트 모두 한 곳에서
            </p>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl p-8 shadow-2xl border bg-card border-border">
            <form className="space-y-5">
              {/* Email */}
              <div>
                <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                  이메일
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 text-base bg-transparent border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label className="text-sm font-semibold mb-2 block text-muted-foreground">
                  비밀번호
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 h-12 text-base bg-transparent border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border text-violet-500 focus:ring-violet-500" />
                  <span className="text-sm text-muted-foreground">로그인 상태 유지</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-semibold text-violet-500 hover:text-violet-600 transition-colors"
                >
                  비밀번호 찾기
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="button"
                className="w-full h-14 text-base font-bold bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all"
                onClick={handleLogin}
              >
                <LogIn className="w-5 h-5 mr-2" />
                로그인
              </Button>

              {/* Divider */}
              <div className="relative my-8">
                <Separator className="bg-muted" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-semibold bg-card text-muted-foreground">
                  또는
                </span>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-border text-foreground hover:bg-muted"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-5 h-5 mr-2" alt="Google" />
                  Google로 계속하기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-border text-foreground hover:bg-muted"
                >
                  <div className="w-5 h-5 mr-2 bg-yellow-400 rounded-full" />
                  카카오로 계속하기
                </Button>
              </div>

              {/* Signup Link */}
              <p className="text-center text-sm pt-4 text-muted-foreground">
                계정이 없으신가요?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="font-bold text-violet-500 hover:text-violet-600 transition-colors"
                >
                  회원가입
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Fandom Benefits */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-pink-500">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md p-12">
          {/* Icon Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
            <Heart className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm">
              나만의 야구 팬덤 세계
            </span>
          </div>

          {/* Main Title */}
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            팬덤의 모든 것,<br/>한 곳에서
          </h2>
          <p className="text-white/90 text-lg mb-10">
            팬아트 제작, 팬덤 인증, 이벤트 참여까지. 진정한 팬의 세계를 경험하세요.
          </p>

          {/* Features List */}
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">AI 팬아트 제작</h3>
                <p className="text-white/80 text-sm">좋아하는 팀과 선수의 팬아트를 AI로 간편하게</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">팬덤 소통</h3>
                <p className="text-white/80 text-sm">같은 팬들과 작품 공유하고 소통하세요</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-white/20 rounded-xl p-3 flex-shrink-0">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-1">이벤트 & 챌린지</h3>
                <p className="text-white/80 text-sm">공식 이벤트에 참여하고 굿즈를 받으세요</p>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white/90 text-sm italic mb-3">
              "팬아트 만들고, 팬덤 인증하고, 이벤트까지! 진짜 팬을 위한 공간이에요 💜"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <div>
                <p className="text-white font-bold text-sm">아미드로잉</p>
                <p className="text-white/70 text-xs">BTS ARMY</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

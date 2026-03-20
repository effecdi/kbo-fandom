import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Compass } from "lucide-react";
import { useNavigate } from "react-router";
const olliLogo = "/favicon.png";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src={olliLogo}
                alt="OLLI"
                className="w-full h-full object-contain opacity-50"
              />
            </div>
            <span className="text-2xl font-black text-muted-foreground">
              OLLI
            </span>
          </div>
        </div>

        {/* 404 Illustration */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-48 h-48 rounded-full mb-6 bg-gradient-to-br from-muted/50 to-muted">
            <Compass className="w-24 h-24 text-muted-foreground" />
          </div>

          {/* 404 Text */}
          <h1 className="text-8xl md:text-9xl font-black mb-4 bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-transparent bg-clip-text">
            404
          </h1>
        </div>

        {/* Message */}
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-foreground">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-lg mb-6 text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었습니다
          </p>

          {/* Helpful Links */}
          <div className="rounded-2xl p-6 mb-8 border bg-card border-border">
            <p className="text-sm font-semibold mb-4 text-muted-foreground">
              자주 찾는 페이지
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/creator/dashboard")}
                className="p-3 rounded-xl text-sm font-semibold transition-all bg-muted text-foreground hover:bg-muted/80"
              >
                작가 대시보드
              </button>
              <button
                onClick={() => navigate("/business/dashboard")}
                className="p-3 rounded-xl text-sm font-semibold transition-all bg-muted text-foreground hover:bg-muted/80"
              >
                기업 대시보드
              </button>
              <button
                onClick={() => navigate("/pricing")}
                className="p-3 rounded-xl text-sm font-semibold transition-all bg-muted text-foreground hover:bg-muted/80"
              >
                요금제
              </button>
              <button
                onClick={() => navigate("/login")}
                className="p-3 rounded-xl text-sm font-semibold transition-all bg-muted text-foreground hover:bg-muted/80"
              >
                로그인
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-12 font-semibold border-border text-foreground hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 페이지
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#00e5cc] to-[#00b3a6] text-white h-12 font-semibold hover:shadow-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            홈으로 가기
          </Button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          계속 문제가 발생하면{" "}
          <button
            onClick={() => navigate("/contact")}
            className="text-[#00e5cc] hover:underline font-semibold"
          >
            고객 지원팀
          </button>
          에 문의해주세요
        </p>
      </div>
    </div>
  );
}

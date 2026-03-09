import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SpotlightTourProvider } from "@/components/spotlight-tour";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/hooks/use-auth";
import { UserRoleProvider, useUserRole } from "@/hooks/use-user-role";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import OnboardingPage from "@/pages/onboarding";
import BusinessDashboardPage from "@/pages/business/dashboard";
import CreatePage from "@/pages/create";
import CreateInstatoonPage from "@/pages/create-instatoon";
import PosePage from "@/pages/pose";
import GalleryPage from "@/pages/gallery";
import PricingPage from "@/pages/pricing";
import ChatPage from "@/pages/chat";
import AdMatchPage from "@/pages/ad-match";
import EffectsPage from "@/pages/effects";
import MediaKitPage from "@/pages/media-kit";
import BubblePage from "@/pages/bubble";
import BackgroundPage from "@/pages/background";
import StoryPage from "@/pages/story";
import EditsPage from "@/pages/edits";
import LoginPage from "@/pages/login";
import AuthCallbackPage from "@/pages/auth-callback";
import DashboardPage from "@/pages/dashboard";
import PaymentsPage from "@/pages/payments";
import AutoWebtoonPage from "@/pages/auto-webtoon";
import FeedPage from "@/pages/feed";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import RefundPolicyPage from "@/pages/refund-policy";

function HomeRoute() {
  const { isAuthenticated } = useAuth();
  const { role } = useUserRole();

  // role이 설정되어 있으면 (인증 여부 무관) 역할별 홈 표시
  if (role === "business") return <BusinessDashboardPage />;
  if (role === "creator") return <HomePage />;
  // 인증됐지만 역할 미선택 → 온보딩
  if (isAuthenticated) return <OnboardingPage />;
  // 미인증 + 역할 없음 → 랜딩
  return <LandingPage />;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/home" component={LandingPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/business/dashboard" component={BusinessDashboardPage} />
      <Route path="/create" component={CreatePage} />
      <Route path="/create-instatoon" component={CreateInstatoonPage} />
      <Route path="/pose" component={PosePage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/ad-match" component={AdMatchPage} />
      <Route path="/effects" component={EffectsPage} />
      <Route path="/media-kit" component={MediaKitPage} />
      <Route path="/bubble" component={BubblePage} />
      <Route path="/background" component={BackgroundPage} />
      <Route path="/story" component={StoryPage} />
      <Route path="/auto-webtoon" component={AutoWebtoonPage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/edits" component={EditsPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/payments" component={PaymentsPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/auth/callback" component={AuthCallbackPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/refund-policy" component={RefundPolicyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { role } = useUserRole();
  const [location] = useLocation();

  // 비즈니스 대시보드에서는 DashboardLayout 사용 → Navbar 숨김
  const isBusinessDashboard = role === "business" &&
    (location === "/" || location.startsWith("/business"));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isBusinessDashboard && <Navbar />}
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <UserRoleProvider>
            <SpotlightTourProvider>
              <AppContent />
            </SpotlightTourProvider>
          </UserRoleProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

import { Navbar } from "@/components/navbar";
import { ReactLenis } from "lenis/react";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
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

function ProGuard({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const { data: usage, isLoading } = useQuery<{ tier: string }>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) return <Redirect to="/login" />;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (usage?.tier === "free" || !usage?.tier) return <Redirect to="/pricing" />;
  return <Component />;
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
      <Route path="/" component={isAuthenticated ? DashboardPage : LandingPage} />
      <Route path="/home" component={LandingPage} />
      <Route path="/create" component={CreatePage} />
      <Route path="/create-instatoon" component={CreateInstatoonPage} />
      <Route path="/pose" component={PosePage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/chat">{() => <ProGuard component={ChatPage} />}</Route>
      <Route path="/ad-match">{() => <ProGuard component={AdMatchPage} />}</Route>
      <Route path="/effects">{() => <ProGuard component={EffectsPage} />}</Route>
      <Route path="/media-kit">{() => <ProGuard component={MediaKitPage} />}</Route>
      <Route path="/bubble">{() => <ProGuard component={BubblePage} />}</Route>
      <Route path="/background" component={BackgroundPage} />
      <Route path="/story">{() => <ProGuard component={StoryPage} />}</Route>
      <Route path="/auto-webtoon" component={AutoWebtoonPage} />
      <Route path="/feed" component={FeedPage} />
      <Route path="/edits">{() => <ProGuard component={EditsPage} />}</Route>
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

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
              <div className="min-h-screen bg-background text-foreground">
                <Navbar />
                <Router />
              </div>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReactLenis>
  );
}

export default App;

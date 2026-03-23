import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { ReactLenis } from "lenis/react";
import { useAuth } from "@/hooks/use-auth";
import { seedIfEmpty } from "@/lib/local-store";

// Seed localStorage with demo data on first load
seedIfEmpty();

// Design pages
import { LandingPage } from "@/pages/LandingPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { CreatorPage } from "@/pages/CreatorPage";
import { BusinessPage } from "@/pages/BusinessPage";
import { CreatorDashboard } from "@/pages/CreatorDashboard";
import { BusinessDashboard } from "@/pages/BusinessDashboard";
import { BusinessLogin } from "@/components/BusinessLogin";

// Creator pages
import { CharacterNew } from "@/pages/creator/CharacterNew";
import { CharacterResult } from "@/pages/creator/CharacterResult";
import { CharacterList } from "@/pages/creator/CharacterList";
import { CharacterDetail } from "@/pages/creator/CharacterDetail";
import { PoseExpression } from "@/pages/creator/PoseExpression";
import { Background } from "@/pages/creator/Background";
import { StoryEditor } from "@/pages/creator/StoryEditor";
import { StoryPreview } from "@/pages/creator/StoryPreview";
import { Publish } from "@/pages/creator/Publish";
import { Contents } from "@/pages/creator/Contents";
import { Revenue } from "@/pages/creator/Revenue";
import { CreatorSettings } from "@/pages/creator/Settings";
import { Feed } from "@/pages/creator/Feed";
import { ChatMaker } from "@/pages/creator/ChatMaker";
import { SpeechBubble } from "@/pages/creator/SpeechBubble";
import { BlurEffects } from "@/pages/creator/BlurEffects";
import { Profile } from "@/pages/creator/Profile";
import { Projects } from "@/pages/creator/Projects";
import { CreatorCampaigns } from "@/pages/creator/Campaigns";
import { CreatorCampaignDetail } from "@/pages/creator/CampaignDetail";
import { CreatorProposals } from "@/pages/creator/Proposals";
import { ProposalDetail } from "@/pages/creator/ProposalDetail";
import { Collaborations } from "@/pages/creator/Collaborations";
import { MediaKit } from "@/pages/creator/MediaKit";

// Business pages
import { MascotNew } from "@/pages/business/MascotNew";
import { MascotResult } from "@/pages/business/MascotResult";
import { Mascots } from "@/pages/business/Mascots";
import { ContentCreate } from "@/pages/business/ContentCreate";
import { ContentEditor } from "@/pages/business/ContentEditor";
import { CollaborationNew } from "@/pages/business/CollaborationNew";
import { CollaborationMatching } from "@/pages/business/CollaborationMatching";
import { Campaigns } from "@/pages/business/Campaigns";
import { CampaignNew } from "@/pages/business/CampaignNew";
import { CampaignDetail } from "@/pages/business/CampaignDetail";
import { ProposalNew } from "@/pages/business/ProposalNew";
import { CreatorSearch } from "@/pages/business/CreatorSearch";
import { CreatorDetail } from "@/pages/business/CreatorDetail";
import { BusinessProposals } from "@/pages/business/Proposals";
import { Reports } from "@/pages/business/Reports";
import { BrandAssets } from "@/pages/business/BrandAssets";
import { BusinessSettings } from "@/pages/business/Settings";

// Common pages
import { Login } from "@/pages/common/Login";
import { Signup } from "@/pages/common/Signup";
import { Pricing } from "@/pages/common/Pricing";
import { NotFound } from "@/pages/common/NotFound";
import { Payments } from "@/pages/common/Payments";

// Existing functional pages (preserved)
import StoryPage from "@/pages/story";
import BubblePage from "@/pages/bubble";
import CreatePage from "@/pages/create";
import CreateInstatoonPage from "@/pages/create-instatoon";
import PosePage from "@/pages/pose";
import BackgroundPage from "@/pages/background";
import ChatPage from "@/pages/chat";
import EffectsPage from "@/pages/effects";
import AuthCallbackPage from "@/pages/auth-callback";
import FeedPage from "@/pages/feed";
import DashboardPage from "@/pages/dashboard";
import GalleryPage from "@/pages/gallery";
import AdMatchPage from "@/pages/ad-match";
import EditsPage from "@/pages/edits";
import MediaKitPage from "@/pages/media-kit";
import AutoWebtoonPage from "@/pages/auto-webtoon";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import RefundPolicyPage from "@/pages/refund-policy";

// New pages - Studio
import { StudioProjects } from "@/pages/studio/Projects";
import { StudioNew } from "@/pages/studio/New";
import { StudioEditor } from "@/pages/studio/Editor";

// New pages - Gallery
import { GalleryIndex } from "@/pages/gallery/Index";
import { MyGalleryPage } from "@/pages/gallery/Mine";
import { FeedPage as NewFeedPage } from "@/pages/gallery/Feed";

// New pages - Assets
import { AssetsIndex } from "@/pages/assets/Index";
import { CharactersPage } from "@/pages/assets/Characters";
import { CharacterNewPage } from "@/pages/assets/CharacterNew";
import { CharacterDetailPage } from "@/pages/assets/CharacterDetail";
import { BrandAssetsPage } from "@/pages/assets/BrandAssets";
import { MascotCreatorPage } from "@/pages/assets/brand/MascotCreator";
import { LogoCreatorPage } from "@/pages/assets/brand/LogoCreator";
import { ColorCreatorPage } from "@/pages/assets/brand/ColorCreator";
import { DocumentCreatorPage } from "@/pages/assets/brand/DocumentCreator";

// New pages - Dashboard
import { DashboardIndex } from "@/pages/dashboard/Index";
import { AnalyticsPage } from "@/pages/dashboard/Analytics";
import { RevenuePage } from "@/pages/dashboard/Revenue";
import { ReportsPage } from "@/pages/dashboard/Reports";
import { MediaKitPage as NewMediaKitPage } from "@/pages/dashboard/MediaKit";

// New pages - Market
import { MarketIndex } from "@/pages/market/Index";
import { CollaborationsPage } from "@/pages/market/Collaborations";
import { CampaignsPage } from "@/pages/market/Campaigns";
import { CampaignNewPage } from "@/pages/market/CampaignNew";
import { CampaignDetailPage } from "@/pages/market/CampaignDetail";
import { CreatorsPage } from "@/pages/market/Creators";
import { CreatorDetailPage } from "@/pages/market/CreatorDetail";
import { ProposalsPage } from "@/pages/market/Proposals";
import { ProposalDetailPage } from "@/pages/market/ProposalDetail";

// New pages - Settings
import { SettingsIndex } from "@/pages/settings/Index";
import { ProfileSettings } from "@/pages/settings/ProfileSettings";

// Legacy redirects
import { CreatorRedirect, BusinessRedirect } from "@/components/LegacyRedirects";

function ProGuard({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const { data: usage, isLoading } = useQuery<{ tier: string }>({
    queryKey: ["/api/usage"],
    enabled: isAuthenticated,
  });
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (isLoading) return <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (usage?.tier === "free" || !usage?.tier) return <Navigate to="/pricing" />;
  return <Component />;
}

/** Role-based route guard — redirects if user role doesn't match */
function RoleGuard({ role, children, fallback }: { role: "creator" | "business"; children: React.ReactNode; fallback?: string }) {
  const currentRole = (localStorage.getItem("olli_user_role") as string) || "creator";
  if (currentRole !== role) {
    return <Navigate to={fallback || (role === "business" ? "/studio" : "/studio")} replace />;
  }
  return <>{children}</>;
}

const router = createBrowserRouter([
  // ============================================
  // Core / Auth
  // ============================================
  { path: "/", element: <LandingPage /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/login/business", element: <BusinessLogin /> },
  { path: "/signup", element: <Signup /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/payments", element: <Payments /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },

  // ============================================
  // Studio (새 구조)
  // ============================================
  { path: "/studio", element: <StudioProjects /> },
  { path: "/studio/new", element: <StudioNew /> },
  { path: "/studio/editor/:projectId", element: <StudioEditor /> },

  // ============================================
  // Assets (새 구조 — StudioLayout 통합)
  // ============================================
  { path: "/assets", element: <AssetsIndex /> },
  { path: "/assets/characters", element: <CharactersPage /> },
  { path: "/assets/characters/new", element: <CharacterNewPage /> },
  { path: "/assets/characters/:id", element: <CharacterDetailPage /> },
  { path: "/assets/brand", element: <RoleGuard role="business" fallback="/assets"><BrandAssetsPage /></RoleGuard> },
  { path: "/assets/brand/mascot/new", element: <RoleGuard role="business" fallback="/assets"><MascotCreatorPage /></RoleGuard> },
  { path: "/assets/brand/logo/new", element: <RoleGuard role="business" fallback="/assets"><LogoCreatorPage /></RoleGuard> },
  { path: "/assets/brand/color/new", element: <RoleGuard role="business" fallback="/assets"><ColorCreatorPage /></RoleGuard> },
  { path: "/assets/brand/document/new", element: <RoleGuard role="business" fallback="/assets"><DocumentCreatorPage /></RoleGuard> },

  // ============================================
  // Gallery (새 구조 — StudioLayout 통합)
  // ============================================
  { path: "/gallery", element: <GalleryIndex /> },
  { path: "/gallery/mine", element: <MyGalleryPage /> },
  { path: "/gallery/feed", element: <NewFeedPage /> },

  // ============================================
  // Market (새 구조 — StudioLayout 통합)
  // ============================================
  { path: "/market", element: <MarketIndex /> },
  { path: "/market/campaigns", element: <CampaignsPage /> },
  { path: "/market/campaigns/new", element: <CampaignNewPage /> },
  { path: "/market/campaigns/:id", element: <CampaignDetailPage /> },
  { path: "/market/creators", element: <RoleGuard role="business" fallback="/market"><CreatorsPage /></RoleGuard> },
  { path: "/market/creators/:id", element: <RoleGuard role="business" fallback="/market"><CreatorDetailPage /></RoleGuard> },
  { path: "/market/proposals", element: <ProposalsPage /> },
  { path: "/market/proposals/:id", element: <ProposalDetailPage /> },
  { path: "/market/collaborations", element: <CollaborationsPage /> },

  // ============================================
  // Dashboard (새 구조 — StudioLayout 통합)
  // ============================================
  { path: "/dashboard", element: <DashboardIndex /> },
  { path: "/dashboard/analytics", element: <AnalyticsPage /> },
  { path: "/dashboard/revenue", element: <RoleGuard role="creator" fallback="/dashboard"><RevenuePage /></RoleGuard> },
  { path: "/dashboard/reports", element: <RoleGuard role="business" fallback="/dashboard"><ReportsPage /></RoleGuard> },
  { path: "/dashboard/media-kit", element: <RoleGuard role="creator" fallback="/dashboard"><NewMediaKitPage /></RoleGuard> },

  // ============================================
  // Settings (새 구조)
  // ============================================
  { path: "/settings", element: <SettingsIndex /> },
  { path: "/settings/profile", element: <ProfileSettings /> },

  // ============================================
  // Legal
  // ============================================
  { path: "/legal/terms", element: <TermsPage /> },
  { path: "/legal/privacy", element: <PrivacyPage /> },
  { path: "/legal/refund", element: <RefundPolicyPage /> },

  // ============================================
  // Legacy functional pages (preserved)
  // ============================================
  { path: "/story", element: <ProGuard component={StoryPage} /> },
  { path: "/bubble", element: <ProGuard component={BubblePage} /> },
  { path: "/create", element: <CreatePage /> },
  { path: "/create-instatoon", element: <CreateInstatoonPage /> },
  { path: "/pose", element: <PosePage /> },
  { path: "/background-gen", element: <BackgroundPage /> },
  { path: "/chat", element: <ProGuard component={ChatPage} /> },
  { path: "/effects", element: <ProGuard component={EffectsPage} /> },
  { path: "/ad-match", element: <ProGuard component={AdMatchPage} /> },
  { path: "/media-kit", element: <ProGuard component={MediaKitPage} /> },
  { path: "/feed", element: <FeedPage /> },
  { path: "/edits", element: <ProGuard component={EditsPage} /> },
  { path: "/auto-webtoon", element: <AutoWebtoonPage /> },

  // ============================================
  // Legacy redirects
  // ============================================
  { path: "/terms", element: <Navigate to="/legal/terms" replace /> },
  { path: "/privacy", element: <Navigate to="/legal/privacy" replace /> },
  { path: "/refund-policy", element: <Navigate to="/legal/refund" replace /> },

  // Creator legacy routes → unified redirects
  { path: "/creator", element: <CreatorRedirect /> },
  { path: "/creator/dashboard", element: <CreatorRedirect /> },
  { path: "/creator/character/new", element: <CreatorRedirect /> },
  { path: "/creator/character/result", element: <CreatorRedirect /> },
  { path: "/creator/character", element: <CreatorRedirect /> },
  { path: "/creator/character/:id", element: <CreatorRedirect /> },
  { path: "/creator/pose-expression", element: <CreatorRedirect /> },
  { path: "/creator/background", element: <CreatorRedirect /> },
  { path: "/creator/story", element: <CreatorRedirect /> },
  { path: "/creator/story/preview", element: <CreatorRedirect /> },
  { path: "/creator/publish", element: <CreatorRedirect /> },
  { path: "/creator/contents", element: <CreatorRedirect /> },
  { path: "/creator/revenue", element: <CreatorRedirect /> },
  { path: "/creator/settings", element: <CreatorRedirect /> },
  { path: "/creator/feed", element: <CreatorRedirect /> },
  { path: "/creator/chat-maker", element: <CreatorRedirect /> },
  { path: "/creator/speech-bubble", element: <CreatorRedirect /> },
  { path: "/creator/blur-effects", element: <CreatorRedirect /> },
  { path: "/creator/profile", element: <CreatorRedirect /> },
  { path: "/creator/projects", element: <CreatorRedirect /> },
  { path: "/creator/campaigns", element: <CreatorRedirect /> },
  { path: "/creator/campaigns/:id", element: <CreatorRedirect /> },
  { path: "/creator/proposals", element: <CreatorRedirect /> },
  { path: "/creator/proposals/:id", element: <CreatorRedirect /> },
  { path: "/creator/collaborations", element: <CreatorRedirect /> },
  { path: "/creator/media-kit", element: <CreatorRedirect /> },

  // Business legacy routes → unified redirects
  { path: "/business", element: <BusinessRedirect /> },
  { path: "/business/dashboard", element: <BusinessRedirect /> },
  { path: "/business/mascot", element: <BusinessRedirect /> },
  { path: "/business/mascot/result", element: <BusinessRedirect /> },
  { path: "/business/mascots", element: <BusinessRedirect /> },
  { path: "/business/content", element: <BusinessRedirect /> },
  { path: "/business/content/editor", element: <BusinessRedirect /> },
  { path: "/business/collaboration/new", element: <BusinessRedirect /> },
  { path: "/business/collaboration/matching", element: <BusinessRedirect /> },
  { path: "/business/campaigns", element: <BusinessRedirect /> },
  { path: "/business/campaigns/new", element: <BusinessRedirect /> },
  { path: "/business/campaigns/:id", element: <BusinessRedirect /> },
  { path: "/business/proposals/new", element: <BusinessRedirect /> },
  { path: "/business/creators", element: <BusinessRedirect /> },
  { path: "/business/creators/:id", element: <BusinessRedirect /> },
  { path: "/business/proposals", element: <BusinessRedirect /> },
  { path: "/business/reports", element: <BusinessRedirect /> },
  { path: "/business/brand-assets", element: <BusinessRedirect /> },
  { path: "/business/settings", element: <BusinessRedirect /> },

  // Catch-all
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReactLenis>
  );
}

export default App;

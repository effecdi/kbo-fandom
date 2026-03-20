import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { ReactLenis } from "lenis/react";
import { useAuth } from "@/hooks/use-auth";

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

const router = createBrowserRouter([
  // Landing & Auth
  { path: "/", element: <LandingPage /> },
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/login/business", element: <BusinessLogin /> },
  { path: "/signup", element: <Signup /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/payments", element: <Payments /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },

  // Creator design pages
  { path: "/creator", element: <CreatorPage /> },
  { path: "/creator/dashboard", element: <CreatorDashboard /> },
  { path: "/creator/character/new", element: <CharacterNew /> },
  { path: "/creator/character/result", element: <CharacterResult /> },
  { path: "/creator/character", element: <CharacterList /> },
  { path: "/creator/character/:id", element: <CharacterDetail /> },
  { path: "/creator/pose-expression", element: <PoseExpression /> },
  { path: "/creator/background", element: <Background /> },
  { path: "/creator/story", element: <StoryEditor /> },
  { path: "/creator/story/preview", element: <StoryPreview /> },
  { path: "/creator/publish", element: <Publish /> },
  { path: "/creator/contents", element: <Contents /> },
  { path: "/creator/revenue", element: <Revenue /> },
  { path: "/creator/settings", element: <CreatorSettings /> },
  { path: "/creator/feed", element: <Feed /> },
  { path: "/creator/chat-maker", element: <ChatMaker /> },
  { path: "/creator/speech-bubble", element: <SpeechBubble /> },
  { path: "/creator/blur-effects", element: <BlurEffects /> },
  { path: "/creator/profile", element: <Profile /> },
  { path: "/creator/projects", element: <Projects /> },
  { path: "/creator/campaigns", element: <CreatorCampaigns /> },
  { path: "/creator/campaigns/:id", element: <CreatorCampaignDetail /> },
  { path: "/creator/proposals", element: <CreatorProposals /> },
  { path: "/creator/proposals/:id", element: <ProposalDetail /> },
  { path: "/creator/collaborations", element: <Collaborations /> },
  { path: "/creator/media-kit", element: <MediaKit /> },

  // Business design pages
  { path: "/business", element: <BusinessPage /> },
  { path: "/business/dashboard", element: <BusinessDashboard /> },
  { path: "/business/mascot", element: <MascotNew /> },
  { path: "/business/mascot/result", element: <MascotResult /> },
  { path: "/business/mascots", element: <Mascots /> },
  { path: "/business/content", element: <ContentCreate /> },
  { path: "/business/content/editor", element: <ContentEditor /> },
  { path: "/business/collaboration/new", element: <CollaborationNew /> },
  { path: "/business/collaboration/matching", element: <CollaborationMatching /> },
  { path: "/business/campaigns", element: <Campaigns /> },
  { path: "/business/campaigns/new", element: <CampaignNew /> },
  { path: "/business/campaigns/:id", element: <CampaignDetail /> },
  { path: "/business/proposals/new", element: <ProposalNew /> },
  { path: "/business/creators", element: <CreatorSearch /> },
  { path: "/business/creators/:id", element: <CreatorDetail /> },
  { path: "/business/proposals", element: <BusinessProposals /> },
  { path: "/business/reports", element: <Reports /> },
  { path: "/business/brand-assets", element: <BrandAssets /> },
  { path: "/business/settings", element: <BusinessSettings /> },

  // Existing functional pages (preserved)
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
  { path: "/dashboard", element: <DashboardPage /> },
  { path: "/gallery", element: <GalleryPage /> },
  { path: "/edits", element: <ProGuard component={EditsPage} /> },
  { path: "/auto-webtoon", element: <AutoWebtoonPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/refund-policy", element: <RefundPolicyPage /> },
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

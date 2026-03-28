import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactLenis } from "lenis/react";
import { seedIfEmpty, getFandomProfile } from "@/lib/local-store";
import { FandomProvider } from "@/contexts/fandom-context";

// Seed localStorage with demo data on first load
seedIfEmpty();

// Design pages
import { LandingPage } from "@/pages/LandingPage";

// Common pages
import { Login } from "@/pages/common/Login";
import { Signup } from "@/pages/common/Signup";
import { Pricing } from "@/pages/common/Pricing";
import { NotFound } from "@/pages/common/NotFound";
import { Payments } from "@/pages/common/Payments";

// Existing functional pages (preserved)
import CreatePage from "@/pages/create";
import CreateInstatoonPage from "@/pages/create-instatoon";
import PosePage from "@/pages/pose";
import BackgroundPage from "@/pages/background";
import AuthCallbackPage from "@/pages/auth-callback";
import FeedPage from "@/pages/feed";
import GalleryPage from "@/pages/gallery";
import AutoWebtoonPage from "@/pages/auto-webtoon";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";
import RefundPolicyPage from "@/pages/refund-policy";

// Studio
import { StudioProjects } from "@/pages/studio/Projects";
import { StudioNew } from "@/pages/studio/New";
import { StudioEditor } from "@/pages/studio/Editor";

// Gallery
import { GalleryIndex } from "@/pages/gallery/Index";
import { MyGalleryPage } from "@/pages/gallery/Mine";
import { FeedPage as NewFeedPage } from "@/pages/gallery/Feed";

// Assets (characters only)
import { AssetsIndex } from "@/pages/assets/Index";
import { CharactersPage } from "@/pages/assets/Characters";
import { CharacterNewPage } from "@/pages/assets/CharacterNew";
import { CharacterDetailPage } from "@/pages/assets/CharacterDetail";

// Dashboard (analytics only)
import { DashboardIndex } from "@/pages/dashboard/Index";
import { AnalyticsPage } from "@/pages/dashboard/Analytics";

// Settings
import { SettingsIndex } from "@/pages/settings/Index";
import { ProfileSettings } from "@/pages/settings/ProfileSettings";

// Fandom
import { FandomIndex } from "@/pages/fandom/Index";
import { FandomGroups } from "@/pages/fandom/Groups";
import { FandomGroupDetail } from "@/pages/fandom/GroupDetail";
import { FandomFeed } from "@/pages/fandom/Feed";
import { FandomCreateFanart } from "@/pages/fandom/CreateFanart";
import { FandomEvents } from "@/pages/fandom/Events";
import { FandomEventDetail } from "@/pages/fandom/EventDetail";
import { FandomOnboarding } from "@/pages/fandom/Onboarding";
import { FanTalk } from "@/pages/fandom/FanTalk";
import { FanProfile } from "@/pages/fandom/FanProfile";
import { FanMessages } from "@/pages/fandom/FanMessages";
import { FanCreators } from "@/pages/fandom/FanCreators";
import { FandomSchedule } from "@/pages/fandom/Schedule";

import { FandomStadiumGuide } from "@/pages/fandom/StadiumGuide";
import { FandomStandings } from "@/pages/fandom/Standings";
import { FandomPhotocards } from "@/pages/fandom/Photocards";
import { FandomGoodsTrades } from "@/pages/fandom/GoodsTrades";

/** Fandom guard — redirects to onboarding if no verified fandom profile */
function FandomGuard({ children }: { children: React.ReactNode }) {
  const profile = getFandomProfile();
  if (!profile?.verified) {
    return <Navigate to="/fandom/onboarding" replace />;
  }
  return <>{children}</>;
}

const router = createBrowserRouter([
  // ── Core / Auth ──
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/pricing", element: <Pricing /> },
  { path: "/payments", element: <Payments /> },
  { path: "/auth/callback", element: <AuthCallbackPage /> },

  // ── Fandom (hub) ──
  { path: "/fandom/onboarding", element: <FandomOnboarding /> },
  { path: "/fandom", element: <FandomGuard><FandomIndex /></FandomGuard> },
  { path: "/fandom/groups", element: <FandomGuard><FandomGroups /></FandomGuard> },
  { path: "/fandom/groups/:id", element: <FandomGuard><FandomGroupDetail /></FandomGuard> },
  { path: "/fandom/feed", element: <FandomGuard><FandomFeed /></FandomGuard> },
  { path: "/fandom/create", element: <FandomGuard><FandomCreateFanart /></FandomGuard> },
  { path: "/fandom/events", element: <FandomGuard><FandomEvents /></FandomGuard> },
  { path: "/fandom/events/:id", element: <FandomGuard><FandomEventDetail /></FandomGuard> },
  { path: "/fandom/talk", element: <FandomGuard><FanTalk /></FandomGuard> },
  { path: "/fandom/fans", element: <FandomGuard><FanCreators /></FandomGuard> },
  { path: "/fandom/fans/:id", element: <FandomGuard><FanProfile /></FandomGuard> },
  { path: "/fandom/messages", element: <FandomGuard><FanMessages /></FandomGuard> },
  { path: "/fandom/schedule", element: <FandomGuard><FandomSchedule /></FandomGuard> },

  { path: "/fandom/stadium-guide", element: <FandomGuard><FandomStadiumGuide /></FandomGuard> },
  { path: "/fandom/standings", element: <FandomGuard><FandomStandings /></FandomGuard> },
  { path: "/fandom/photocards", element: <FandomGuard><FandomPhotocards /></FandomGuard> },
  { path: "/fandom/goods", element: <FandomGuard><FandomGoodsTrades /></FandomGuard> },

  // ── Editor ──
  { path: "/editor/new", element: <StudioEditor /> },
  { path: "/editor/:projectId", element: <StudioEditor /> },

  // ── Studio (legacy, keep working) ──
  { path: "/studio", element: <StudioProjects /> },
  { path: "/studio/new", element: <StudioNew /> },
  { path: "/studio/editor/:projectId", element: <StudioEditor /> },

  // ── Gallery ──
  { path: "/gallery", element: <GalleryIndex /> },
  { path: "/gallery/mine", element: <MyGalleryPage /> },
  { path: "/gallery/feed", element: <NewFeedPage /> },

  // ── Assets (characters) ──
  { path: "/assets", element: <AssetsIndex /> },
  { path: "/assets/characters", element: <CharactersPage /> },
  { path: "/assets/characters/new", element: <CharacterNewPage /> },
  { path: "/assets/characters/:id", element: <CharacterDetailPage /> },

  // ── Dashboard ──
  { path: "/dashboard", element: <DashboardIndex /> },
  { path: "/dashboard/analytics", element: <AnalyticsPage /> },

  // ── Settings ──
  { path: "/settings", element: <SettingsIndex /> },
  { path: "/settings/profile", element: <ProfileSettings /> },

  // ── Create (preserved) ──
  { path: "/create", element: <CreatePage /> },
  { path: "/create-instatoon", element: <CreateInstatoonPage /> },
  { path: "/pose", element: <PosePage /> },
  { path: "/background-gen", element: <BackgroundPage /> },
  { path: "/feed", element: <FeedPage /> },
  { path: "/auto-webtoon", element: <AutoWebtoonPage /> },

  // ── Legal ──
  { path: "/legal/terms", element: <TermsPage /> },
  { path: "/legal/privacy", element: <PrivacyPage /> },
  { path: "/legal/refund", element: <RefundPolicyPage /> },

  // ── Legacy redirects ──
  { path: "/onboarding", element: <Navigate to="/fandom/onboarding" replace /> },
  { path: "/terms", element: <Navigate to="/legal/terms" replace /> },
  { path: "/privacy", element: <Navigate to="/legal/privacy" replace /> },
  { path: "/refund-policy", element: <Navigate to="/legal/refund" replace /> },

  // Tool pages → editor redirects
  { path: "/story", element: <Navigate to="/editor/new?module=story" replace /> },
  { path: "/bubble", element: <Navigate to="/editor/new?module=bubble" replace /> },
  { path: "/effects", element: <Navigate to="/editor/new?module=effects" replace /> },
  { path: "/chat", element: <Navigate to="/editor/new?module=chat" replace /> },
  { path: "/edits", element: <Navigate to="/gallery/mine" replace /> },

  // B2B → fandom redirects
  { path: "/business/*", element: <Navigate to="/fandom" replace /> },
  { path: "/market/*", element: <Navigate to="/fandom" replace /> },
  { path: "/ad-match", element: <Navigate to="/fandom" replace /> },
  { path: "/media-kit", element: <Navigate to="/fandom" replace /> },
  { path: "/creator/*", element: <Navigate to="/fandom" replace /> },
  { path: "/dashboard/revenue", element: <Navigate to="/fandom" replace /> },
  { path: "/dashboard/reports", element: <Navigate to="/fandom" replace /> },
  { path: "/dashboard/media-kit", element: <Navigate to="/fandom" replace /> },
  { path: "/assets/brand/*", element: <Navigate to="/fandom" replace /> },

  // Catch-all
  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FandomProvider>
            <TooltipProvider>
              <RouterProvider router={router} />
            </TooltipProvider>
          </FandomProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReactLenis>
  );
}

export default App;

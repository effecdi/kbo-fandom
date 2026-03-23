import { Navigate, useLocation } from "react-router";

const creatorRedirectMap: Record<string, string> = {
  "/creator": "/dashboard",
  "/creator/dashboard": "/dashboard",
  "/creator/character/new": "/assets/characters/new",
  "/creator/character/result": "/assets/characters/new",
  "/creator/character": "/assets/characters",
  "/creator/pose-expression": "/studio/new?tool=pose",
  "/creator/background": "/studio/new?tool=background",
  "/creator/story": "/studio/editor/new",
  "/creator/story/preview": "/studio/editor/new",
  "/creator/publish": "/studio",
  "/creator/contents": "/studio",
  "/creator/revenue": "/dashboard/revenue",
  "/creator/settings": "/settings",
  "/creator/feed": "/gallery/feed",
  "/creator/chat-maker": "/studio/new?tool=chat",
  "/creator/speech-bubble": "/studio/new?tool=bubble",
  "/creator/blur-effects": "/studio/new?tool=effects",
  "/creator/profile": "/settings/profile",
  "/creator/projects": "/studio",
  "/creator/campaigns": "/market/campaigns",
  "/creator/proposals": "/market/proposals",
  "/creator/collaborations": "/market/collaborations",
  "/creator/media-kit": "/dashboard/media-kit",
};

const businessRedirectMap: Record<string, string> = {
  "/business": "/dashboard",
  "/business/dashboard": "/dashboard",
  "/business/mascot": "/assets/characters/new?type=mascot",
  "/business/mascot/result": "/assets/characters/new?type=mascot",
  "/business/mascots": "/assets/characters",
  "/business/content": "/studio/new",
  "/business/content/editor": "/studio/editor/new",
  "/business/collaboration/new": "/market/collaborations",
  "/business/collaboration/matching": "/market/creators",
  "/business/campaigns": "/market/campaigns",
  "/business/campaigns/new": "/market/campaigns/new",
  "/business/proposals/new": "/market/proposals",
  "/business/creators": "/market/creators",
  "/business/proposals": "/market/proposals",
  "/business/reports": "/dashboard/reports",
  "/business/brand-assets": "/assets/brand",
  "/business/settings": "/settings",
};

export function CreatorRedirect() {
  const location = useLocation();
  const fullPath = location.pathname;
  const target = creatorRedirectMap[fullPath] || "/dashboard";
  return <Navigate to={target} replace />;
}

export function BusinessRedirect() {
  const location = useLocation();
  const fullPath = location.pathname;
  const target = businessRedirectMap[fullPath] || "/dashboard";
  return <Navigate to={target} replace />;
}

import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Link } from "react-router";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  ArrowRight,
  Mail,
  Tag,
} from "lucide-react";
import { STORE_KEYS, type UserProfile, seedIfEmpty } from "@/lib/local-store";

const settingSections = [
  {
    icon: User,
    title: "프로필",
    description: "이름, 소개, 프로필 이미지를 수정합니다",
    path: "/settings/profile",
  },
  {
    icon: Bell,
    title: "알림",
    description: "알림 설정을 관리합니다",
    path: "/settings",
  },
  {
    icon: Shield,
    title: "보안",
    description: "비밀번호와 로그인 설정을 관리합니다",
    path: "/settings",
  },
  {
    icon: CreditCard,
    title: "결제",
    description: "결제 수단과 구독을 관리합니다",
    path: "/payments",
  },
  {
    icon: Palette,
    title: "테마",
    description: "다크모드, 언어 등을 설정합니다",
    path: "/settings",
  },
  {
    icon: Globe,
    title: "계정",
    description: "계정 정보와 데이터를 관리합니다",
    path: "/settings",
  },
];

export function SettingsIndex() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    seedIfEmpty();
    try {
      const raw = localStorage.getItem(STORE_KEYS.PROFILE);
      if (raw) {
        setProfile(JSON.parse(raw));
      }
    } catch {
      // ignore parse error
    }
  }, []);

  return (
    <StudioLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">설정</h1>
          <p className="text-muted-foreground mt-1">계정과 앱 설정을 관리하세요</p>
        </div>

        {/* Account Overview Card */}
        {profile && (
          <Link
            to="/settings/profile"
            className="block rounded-2xl border border-border bg-card p-6 mb-6 hover:shadow-lg hover:border-[#00e5cc]/30 transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00e5cc] to-[#00b3a6] flex items-center justify-center shrink-0">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground group-hover:text-[#00e5cc] transition-colors">
                    {profile.name}
                  </h2>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{profile.email}</span>
                </div>
                {profile.bio && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{profile.bio}</p>
                )}
                {profile.genres && profile.genres.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    {profile.genres.slice(0, 4).map((genre) => (
                      <span
                        key={genre}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#00e5cc]/10 text-[#00e5cc] font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                    {profile.genres.length > 4 && (
                      <span className="text-xs text-muted-foreground">
                        +{profile.genres.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        )}

        {/* Settings Sections */}
        <div className="space-y-3">
          {settingSections.map((section) => (
            <Link
              key={section.title}
              to={section.path}
              className="flex items-center justify-between p-5 rounded-2xl border bg-card border-border hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-[#00e5cc]/10 transition-colors">
                  <section.icon className="w-5 h-5 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{section.title}</p>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#00e5cc] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </StudioLayout>
  );
}

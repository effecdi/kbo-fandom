import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  getFandomProfile,
  setFandomProfile as saveProfile,
  clearFandomProfile as removeProfile,
  listItems,
  STORE_KEYS,
  type FandomUserProfile,
  type IdolGroup,
  type IdolMember,
} from "@/lib/local-store";

interface FandomContextValue {
  profile: FandomUserProfile | null;
  group: IdolGroup | null;
  members: IdolMember[];
  isVerified: boolean;
  themeColor: string;
  setProfile: (p: FandomUserProfile) => void;
  clearProfile: () => void;
  refreshProfile: () => void;
}

const FandomContext = createContext<FandomContextValue | null>(null);

export function FandomProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<FandomUserProfile | null>(null);
  const [group, setGroup] = useState<IdolGroup | null>(null);
  const [members, setMembers] = useState<IdolMember[]>([]);

  const loadProfile = () => {
    const p = getFandomProfile();
    setProfileState(p);
    if (p) {
      const groups = listItems<IdolGroup>(STORE_KEYS.IDOL_GROUPS);
      const g = groups.find((gr) => gr.id === p.groupId) || null;
      setGroup(g);
      setMembers(
        listItems<IdolMember>(STORE_KEYS.IDOL_MEMBERS).filter(
          (m) => m.groupId === p.groupId
        )
      );
    } else {
      setGroup(null);
      setMembers([]);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const themeColor = group?.coverColor || "#7B2FF7";

  // Inject CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--fandom-primary", themeColor);
  }, [themeColor]);

  const setProfile = (p: FandomUserProfile) => {
    saveProfile(p);
    loadProfile();
  };

  const clearProfile = () => {
    removeProfile();
    setProfileState(null);
    setGroup(null);
    setMembers([]);
  };

  return (
    <FandomContext.Provider
      value={{
        profile,
        group,
        members,
        isVerified: !!profile?.verified,
        themeColor,
        setProfile,
        clearProfile,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </FandomContext.Provider>
  );
}

export function useFandom() {
  const ctx = useContext(FandomContext);
  if (!ctx) throw new Error("useFandom must be used within FandomProvider");
  return ctx;
}

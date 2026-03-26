import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import React from "react";

export type UserRole = "creator" | null;

interface OnboardingData {
  purpose?: string;
  experience?: string;
  brandSize?: string;
}

interface UserRoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  clearRole: () => void;
  onboardingData: OnboardingData;
  setOnboardingData: (data: OnboardingData) => void;
}

const ROLE_KEY = "olli_user_role";
const ONBOARDING_KEY = "olli_onboarding_data";

const UserRoleContext = createContext<UserRoleContextType | null>(null);

export function UserRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem(ROLE_KEY);
    return (stored as UserRole) || null;
  });

  const [onboardingData, setOnboardingDataState] = useState<OnboardingData>(() => {
    try {
      const stored = localStorage.getItem(ONBOARDING_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem(ROLE_KEY, newRole);
    } else {
      localStorage.removeItem(ROLE_KEY);
    }
  };

  const clearRole = () => {
    setRoleState(null);
    setOnboardingDataState({});
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(ONBOARDING_KEY);
  };

  const setOnboardingData = (data: OnboardingData) => {
    setOnboardingDataState(data);
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
  };

  return React.createElement(
    UserRoleContext.Provider,
    { value: { role, setRole, clearRole, onboardingData, setOnboardingData } },
    children
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    throw new Error("useUserRole must be used within a UserRoleProvider");
  }
  return context;
}

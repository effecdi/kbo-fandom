import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef } from "react";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

const AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === "true";

const DEV_USER: AuthUser = {
  id: "dev-bypass-user-0001",
  email: "dev@olli.local",
  firstName: "Dev",
  lastName: "User",
  profileImageUrl: null,
};

function sessionToUser(user: any): AuthUser {
  return {
    id: user.id,
    email: user.email || null,
    firstName: user.user_metadata?.full_name?.split(" ")[0] || user.user_metadata?.name || null,
    lastName: user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || null,
    profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  };
}

async function fetchUser(): Promise<AuthUser | null> {
  if (AUTH_BYPASS) return DEV_USER;

  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session?.user) return null;
  return sessionToUser(session.user);
}

export function getAccessToken(): Promise<string | null> {
  if (AUTH_BYPASS) return Promise.resolve("dev-bypass-token");
  return supabase.auth.getSession().then(({ data }) => data.session?.access_token || null);
}

export function useAuth() {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["auth-user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: AUTH_BYPASS ? Infinity : 0,
    placeholderData: undefined,
  });

  useEffect(() => {
    if (AUTH_BYPASS) return;

    if (!initialized.current) {
      initialized.current = true;
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        queryClient.setQueryData(["auth-user"], sessionToUser(session.user));
      } else {
        queryClient.setQueryData(["auth-user"], null);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (AUTH_BYPASS) return;
      await supabase.auth.signOut();
    },
    onSuccess: () => {
      if (AUTH_BYPASS) return;
      queryClient.setQueryData(["auth-user"], null);
      queryClient.clear();
    },
  });

  return {
    user: AUTH_BYPASS ? DEV_USER : user,
    isLoading: AUTH_BYPASS ? false : isLoading,
    isAuthenticated: AUTH_BYPASS ? true : !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

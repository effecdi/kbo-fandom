import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

export function useLoginGuard() {
  const { isAuthenticated } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  const guard = useCallback(
    (action: () => void) => {
      if (!isAuthenticated) {
        setShowLoginDialog(true);
        return;
      }
      action();
    },
    [isAuthenticated],
  );

  return { showLoginDialog, setShowLoginDialog, guard };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Unlink, RefreshCw, Loader2 } from "lucide-react";

interface InstagramStatus {
  connected: boolean;
  igUsername?: string;
  igUserId?: string;
  tokenExpiresAt?: string;
  tokenWarning?: boolean;
  connectedAt?: string;
}

export function InstagramConnect() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery<InstagramStatus>({
    queryKey: ["/api/instagram/status"],
    staleTime: 60_000,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/instagram/connect");
      return res.json();
    },
    onSuccess: (data: { url: string }) => {
      window.location.href = data.url;
    },
    onError: (err: Error) => {
      toast({ title: "연결 실패", description: err.message, variant: "destructive" });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/instagram/disconnect"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/status"] });
      toast({ title: "연결 해제", description: "Instagram 계정 연결이 해제되었습니다." });
    },
    onError: (err: Error) => {
      toast({ title: "해제 실패", description: err.message, variant: "destructive" });
    },
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/instagram/refresh-token"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/instagram/status"] });
      toast({ title: "토큰 갱신 완료", description: "Instagram 토큰이 갱신되었습니다." });
    },
    onError: (err: Error) => {
      toast({ title: "갱신 실패", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Instagram 상태 확인 중...</span>
        </div>
      </Card>
    );
  }

  const daysUntilExpiry = status?.tokenExpiresAt
    ? Math.floor((new Date(status.tokenExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
          <Instagram className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Instagram 연동</h3>
          <p className="text-xs text-muted-foreground">
            {status?.connected ? "계정이 연결되어 있습니다" : "비즈니스/크리에이터 계정 연결"}
          </p>
        </div>
        {status?.connected && (
          <Badge variant="default" className="text-[13px] shrink-0">연결됨</Badge>
        )}
      </div>

      {status?.connected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">계정:</span>
            <span className="font-medium">@{status.igUsername}</span>
          </div>

          {daysUntilExpiry !== null && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">토큰 만료:</span>
              {daysUntilExpiry <= 7 ? (
                <Badge variant="destructive" className="text-[13px]">
                  {daysUntilExpiry}일 후 만료
                </Badge>
              ) : (
                <span>{daysUntilExpiry}일 남음</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {status.tokenWarning && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs h-7"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
              >
                {refreshMutation.isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                토큰 갱신
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-xs h-7 text-destructive hover:text-destructive"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Unlink className="h-3 w-3" />
              )}
              연결 해제
            </Button>
          </div>
        </div>
      ) : (
        <Button
          className="w-full gap-2"
          onClick={() => connectMutation.mutate()}
          disabled={connectMutation.isPending}
        >
          {connectMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Instagram className="h-4 w-4" />
          )}
          Instagram 계정 연결
        </Button>
      )}
    </Card>
  );
}

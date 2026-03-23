import { useState, useEffect } from "react";
import { StudioLayout } from "@/components/StudioLayout";
import { Clock, CheckCircle2, Users, FileText, AlertCircle } from "lucide-react";
import {
  listItems,
  seedIfEmpty,
  STORE_KEYS,
  type Collaboration,
} from "@/lib/local-store";

const statusMap: Record<string, { label: string; color: string }> = {
  in_progress: { label: "진행중", color: "text-green-500 bg-green-500/10" },
  completed: { label: "완료", color: "text-blue-500 bg-blue-500/10" },
  pending: { label: "대기중", color: "text-yellow-500 bg-yellow-500/10" },
};

export function CollaborationsPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadCollaborations = () => {
    seedIfEmpty();
    setCollaborations(listItems<Collaboration>(STORE_KEYS.COLLABORATIONS));
  };

  useEffect(() => {
    loadCollaborations();
  }, []);

  const filteredCollaborations = collaborations.filter((collab) => {
    return statusFilter === "all" || collab.status === statusFilter;
  });

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">협업 관리</h1>
          <p className="text-muted-foreground mt-1">진행 중인 협업을 관리하세요</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setStatusFilter(statusFilter === "in_progress" ? "all" : "in_progress")}
            className={`rounded-xl p-4 border bg-card border-border text-left transition-all ${statusFilter === "in_progress" ? "ring-2 ring-[#00e5cc]" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {collaborations.filter((c) => c.status === "in_progress").length}
                </p>
                <p className="text-xs text-muted-foreground">진행중</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
            className={`rounded-xl p-4 border bg-card border-border text-left transition-all ${statusFilter === "completed" ? "ring-2 ring-[#00e5cc]" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {collaborations.filter((c) => c.status === "completed").length}
                </p>
                <p className="text-xs text-muted-foreground">완료</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "pending" ? "all" : "pending")}
            className={`rounded-xl p-4 border bg-card border-border text-left transition-all ${statusFilter === "pending" ? "ring-2 ring-[#00e5cc]" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <FileText className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xl font-black text-foreground">
                  {collaborations.filter((c) => c.status === "pending").length}
                </p>
                <p className="text-xs text-muted-foreground">대기중</p>
              </div>
            </div>
          </button>
        </div>

        {/* Filter indicator */}
        {statusFilter !== "all" && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">
              필터: <span className="text-foreground font-medium">{statusMap[statusFilter]?.label}</span>
            </span>
            <button
              onClick={() => setStatusFilter("all")}
              className="text-xs text-[#00e5cc] hover:underline"
            >
              초기화
            </button>
          </div>
        )}

        {/* Collaboration List */}
        <div className="space-y-4">
          {filteredCollaborations.map((collab) => {
            const status = statusMap[collab.status];
            return (
              <div key={collab.id} className="rounded-2xl border bg-card border-border p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{collab.projectName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {collab.brand} / {collab.creator}
                      </span>
                    </div>
                    {collab.campaignName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        캠페인: {collab.campaignName}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span>단계: {collab.stage}/{collab.totalStages}</span>
                  <span>마감: {collab.deadline}</span>
                  <span>최근 업데이트: {collab.lastUpdate}</span>
                </div>

                {/* Progress */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-[#00e5cc] h-2 rounded-full transition-all"
                    style={{ width: `${collab.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{collab.progress}% 완료</p>
              </div>
            );
          })}

          {filteredCollaborations.length === 0 && (
            <div className="rounded-2xl border bg-card border-border p-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold text-foreground mb-1">협업이 없습니다</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter !== "all" ? "다른 필터를 선택해 보세요" : "아직 진행중인 협업이 없습니다"}
              </p>
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}

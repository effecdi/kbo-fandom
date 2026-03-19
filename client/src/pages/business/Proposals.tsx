import { DashboardLayout } from "@/components/DashboardLayout";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye,
  User,
  Calendar,
  DollarSign,
  Filter,
  Search,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router";

export function BusinessProposals() {
  const navigate = useNavigate();

  const proposals = [
    {
      id: 1,
      projectTitle: "2024 봄 축제 홍보 인스타툰 제작",
      creatorName: "작가 김민지",
      creatorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      status: "accepted",
      sentDate: "2024-03-05",
      responseDate: "2024-03-06",
      budget: "300-500만원",
      deadline: "1개월",
      message: "정책 홍보 전문 작가로서 관공서 프로젝트 경험이 풍부합니다. 함께 진행하고 싶습니다.",
    },
    {
      id: 2,
      projectTitle: "에너지 절약 캠페인 콘텐츠",
      creatorName: "작가 이서준",
      creatorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      status: "pending",
      sentDate: "2024-03-08",
      responseDate: null,
      budget: "200-400만원",
      deadline: "2주",
      message: null,
    },
    {
      id: 3,
      projectTitle: "청년 창업 지원 안내툰",
      creatorName: "작가 박지현",
      creatorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      status: "pending",
      sentDate: "2024-03-08",
      responseDate: null,
      budget: "500-800만원",
      deadline: "2개월",
      message: null,
    },
    {
      id: 4,
      projectTitle: "시민 안전수칙 카드뉴스",
      creatorName: "작가 최유진",
      creatorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
      status: "rejected",
      sentDate: "2024-03-01",
      responseDate: "2024-03-02",
      budget: "150-300만원",
      deadline: "2주",
      message: "현재 다른 프로젝트로 일정이 꽉 차 있어 진행이 어려울 것 같습니다. 다음 기회에 함께하고 싶습니다.",
    },
    {
      id: 5,
      projectTitle: "지역 문화재 홍보 인스타툰",
      creatorName: "작가 정민수",
      creatorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      status: "in_progress",
      sentDate: "2024-02-20",
      responseDate: "2024-02-21",
      budget: "400-600만원",
      deadline: "1.5개월",
      message: "문화재 홍보는 제 전문 분야입니다. 멋진 결과물로 보답하겠습니다!",
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: "응답 대기", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
      accepted: { label: "수락됨", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle },
      rejected: { label: "거절됨", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
      in_progress: { label: "진행중", color: "bg-blue-100 text-blue-700 border-blue-300", icon: FileText },
    };
    return configs[status] || configs.pending;
  };

  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === "pending").length,
    accepted: proposals.filter(p => p.status === "accepted").length,
    inProgress: proposals.filter(p => p.status === "in_progress").length,
  };

  return (
    <DashboardLayout userType="business">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              제안 관리
            </h1>
            <p className="text-gray-600">
              작가에게 보낸 협업 제안의 상태를 확인하세요
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
            onClick={() => navigate("/business/creators")}
          >
            <Send className="w-5 h-5 mr-2" />
            새 제안 보내기
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-2xl font-black text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">전체 제안</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-2xl font-black text-gray-900">{stats.pending}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">응답 대기</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-2xl font-black text-gray-900">{stats.accepted}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">수락됨</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-2xl font-black text-gray-900">{stats.inProgress}</span>
            </div>
            <p className="text-sm font-semibold text-gray-600">진행중</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="프로젝트 또는 작가 검색..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              필터
            </Button>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const statusConfig = getStatusConfig(proposal.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={proposal.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Creator Image */}
                    <img
                      src={proposal.creatorImage}
                      alt={proposal.creatorName}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />

                    {/* Proposal Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-black text-gray-900">
                              {proposal.projectTitle}
                            </h3>
                            <Badge className={`${statusConfig.color} border`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="inline-flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {proposal.creatorName}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              제안일: {proposal.sentDate}
                            </span>
                            {proposal.responseDate && (
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                응답일: {proposal.responseDate}
                              </span>
                            )}
                          </div>

                          {/* Project Details */}
                          <div className="flex items-center gap-6 mb-4">
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">예산:</span>
                              <span className="font-semibold text-gray-900">
                                {proposal.budget}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">기한:</span>
                              <span className="font-semibold text-gray-900">
                                {proposal.deadline}
                              </span>
                            </div>
                          </div>

                          {/* Response Message */}
                          {proposal.message && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-blue-900 mb-1">
                                    작가의 응답
                                  </p>
                                  <p className="text-sm text-blue-800">
                                    {proposal.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/business/creators/${proposal.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          작가 프로필
                        </Button>
                        {proposal.status === "pending" && (
                          <Button variant="ghost" size="sm" className="text-red-600">
                            제안 취소
                          </Button>
                        )}
                        {proposal.status === "accepted" && (
                          <Button
                            size="sm"
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            협업 시작
                          </Button>
                        )}
                        {proposal.status === "in_progress" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                          >
                            진행 상황 보기
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State (hidden when there are proposals) */}
        {proposals.length === 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                제안 내역이 없습니다
              </h3>
              <p className="text-gray-600 mb-6">
                작가를 탐색하고 제안을 보내보세요
              </p>
              <Button onClick={() => navigate("/business/creators")}>
                작가 탐색하기
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
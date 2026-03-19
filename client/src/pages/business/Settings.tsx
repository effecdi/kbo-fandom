import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Settings as SettingsIcon,
  Building2,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Users,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BusinessSettings() {
  const [notifications, setNotifications] = useState({
    newApplication: true,
    campaignUpdate: true,
    payment: true,
    marketing: false,
  });

  return (
    <DashboardLayout userType="business">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">설정</h1>
          <p className="text-gray-600">계정 및 기관 정보를 관리하세요</p>
        </div>

        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="organization">기관 정보</TabsTrigger>
            <TabsTrigger value="members">멤버 관리</TabsTrigger>
            <TabsTrigger value="notifications">알림</TabsTrigger>
            <TabsTrigger value="billing">결제</TabsTrigger>
            <TabsTrigger value="account">계정</TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization">
            <div className="space-y-6">
              {/* Logo */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">기관 로고</h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop"
                      alt="Logo"
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-3">
                      JPG, PNG 파일 (최대 5MB)
                    </p>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm">
                        로고 변경
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">기본 정보</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="org-name">기관명 *</Label>
                      <Input
                        id="org-name"
                        defaultValue="서울시청"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-type">기관 유형 *</Label>
                      <Input
                        id="org-type"
                        defaultValue="지방자치단체"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">기관 소개</Label>
                    <textarea
                      id="description"
                      rows={4}
                      defaultValue="시민 중심의 따뜻한 서울을 만들어갑니다. 지역 발전과 시민 복지를 위한 다양한 정책과 사업을 추진하고 있습니다."
                      className="w-full mt-2 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">대표 이메일 *</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          defaultValue="contact@seoul.go.kr"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">대표 전화번호</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          defaultValue="02-1234-5678"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">주소</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="address"
                        defaultValue="서울특별시 중구 세종대로 110"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="website">웹사이트</Label>
                    <div className="relative mt-2">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="website"
                        defaultValue="https://www.seoul.go.kr"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">취소</Button>
                  <Button className="bg-indigo-600 text-white">
                    변경사항 저장
                  </Button>
                </div>
              </div>

              {/* Business Registration */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">사업자 정보</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="business-number">사업자등록번호 *</Label>
                    <Input
                      id="business-number"
                      defaultValue="000-00-00000"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ceo-name">대표자명 *</Label>
                    <Input
                      id="ceo-name"
                      defaultValue="홍길동"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">취소</Button>
                  <Button className="bg-indigo-600 text-white">
                    변경사항 저장
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900">멤버 관리</h3>
                  <Button className="bg-indigo-600 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    멤버 초대
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "김담당",
                      email: "kim@seoul.go.kr",
                      role: "관리자",
                      status: "active",
                    },
                    {
                      name: "이팀장",
                      email: "lee@seoul.go.kr",
                      role: "멤버",
                      status: "active",
                    },
                    {
                      name: "박주임",
                      email: "park@seoul.go.kr",
                      role: "멤버",
                      status: "pending",
                    },
                  ].map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {member.name}
                          </h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-sm font-semibold px-3 py-1 rounded-full ${
                            member.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {member.status === "active" ? "활성" : "대기"}
                        </span>
                        <span className="text-sm text-gray-600">
                          {member.role}
                        </span>
                        <Button variant="ghost" size="sm">
                          수정
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                <h3 className="font-bold text-gray-900 mb-2">💡 멤버 권한 안내</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>관리자:</strong> 모든 기능 사용 및 멤버 관리 가능</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>멤버:</strong> 캠페인 생성 및 관리, 작가 검색 가능</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>뷰어:</strong> 열람만 가능 (수정 불가)</span>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">알림 설정</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      새로운 지원자
                    </h4>
                    <p className="text-sm text-gray-600">
                      캠페인에 작가가 지원할 때 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newApplication}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newApplication: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      캠페인 업데이트
                    </h4>
                    <p className="text-sm text-gray-600">
                      진행 중인 캠페인에 업데이트가 있을 때 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={notifications.campaignUpdate}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, campaignUpdate: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      결제 알림
                    </h4>
                    <p className="text-sm text-gray-600">
                      결제가 완료되거나 승인이 필요할 때 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={notifications.payment}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, payment: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      마케팅 알림
                    </h4>
                    <p className="text-sm text-gray-600">
                      새로운 기능, 이벤트 등의 소식을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, marketing: checked })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button className="bg-indigo-600 text-white">
                  설정 저장
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">결제 수단</h3>
                <div className="space-y-4">
                  <div className="p-4 border-2 border-indigo-600 rounded-xl bg-indigo-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            기업 카드
                          </p>
                          <p className="text-sm text-gray-600">
                            **** **** **** 1234
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-indigo-600 px-2 py-1 bg-indigo-100 rounded-full">
                        기본
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        삭제
                      </Button>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    새 결제 수단 추가
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">청구서 정보</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="billing-email">청구서 이메일 *</Label>
                    <Input
                      id="billing-email"
                      type="email"
                      defaultValue="billing@seoul.go.kr"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax-id">사업자등록번호 *</Label>
                    <Input
                      id="tax-id"
                      defaultValue="000-00-00000"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">취소</Button>
                  <Button className="bg-indigo-600 text-white">
                    변경사항 저장
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">청구 내역</h3>
                <div className="space-y-3">
                  {[
                    { date: "2024-03-01", amount: "8,000,000원", status: "완료" },
                    { date: "2024-02-01", amount: "6,500,000원", status: "완료" },
                    { date: "2024-01-01", amount: "5,200,000원", status: "완료" },
                  ].map((bill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{bill.date}</p>
                        <p className="text-sm text-gray-600">{bill.amount}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-green-600">
                          {bill.status}
                        </span>
                        <Button variant="ghost" size="sm">
                          <FileText className="w-4 h-4 mr-2" />
                          영수증
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">비밀번호 변경</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">현재 비밀번호 *</Label>
                    <Input
                      id="current-password"
                      type="password"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-password">새 비밀번호 *</Label>
                    <Input
                      id="new-password"
                      type="password"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">새 비밀번호 확인 *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">취소</Button>
                  <Button className="bg-indigo-600 text-white">
                    비밀번호 변경
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">계정 관리</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">
                          개인정보 처리방침
                        </p>
                        <p className="text-sm text-gray-600">
                          OLLI의 개인정보 처리방침 보기
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-gray-600" />
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">
                          고객 지원
                        </p>
                        <p className="text-sm text-gray-600">
                          도움이 필요하신가요?
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-red-600" />
                      <div className="text-left">
                        <p className="font-semibold text-red-600">
                          로그아웃
                        </p>
                        <p className="text-sm text-red-500">
                          계정에서 로그아웃합니다
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>

              <div className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                <h3 className="font-bold text-red-900 mb-2">위험 구역</h3>
                <p className="text-sm text-red-700 mb-4">
                  기관 계정을 삭제하면 모든 캠페인과 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
                <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                  계정 삭제
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

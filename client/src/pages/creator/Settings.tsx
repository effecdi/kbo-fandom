import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Settings as SettingsIcon,
  User,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CreatorSettings() {
  const [notifications, setNotifications] = useState({
    newProposal: true,
    projectUpdate: true,
    payment: true,
    marketing: false,
  });

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground mb-2">설정</h1>
          <p className="text-muted-foreground">계정 및 프로필 정보를 관리하세요</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="notifications">알림</TabsTrigger>
            <TabsTrigger value="payment">정산</TabsTrigger>
            <TabsTrigger value="account">계정</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Profile Photo */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-4">프로필 사진</h3>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-3">
                      JPG, PNG 또는 GIF 파일 (최대 5MB)
                    </p>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm">
                        사진 변경
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-4">기본 정보</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">이름 *</Label>
                      <Input
                        id="name"
                        defaultValue="김민지"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">작가명 *</Label>
                      <Input
                        id="username"
                        defaultValue="@minji_creator"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">자기소개</Label>
                    <textarea
                      id="bio"
                      rows={4}
                      defaultValue="일상 속 작은 행복을 담는 인스타툰 작가입니다. 공감과 위로를 주는 따뜻한 이야기를 그립니다."
                      className="w-full mt-2 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">이메일 *</Label>
                      <div className="relative mt-2">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          defaultValue="minji@email.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">전화번호</Label>
                      <div className="relative mt-2">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          defaultValue="010-1234-5678"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location">지역</Label>
                    <div className="relative mt-2">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="location"
                        defaultValue="서울, 대한민국"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">취소</Button>
                  <Button className="bg-purple-600 text-white">
                    변경사항 저장
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-4">소셜 미디어</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative mt-2">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="instagram"
                        placeholder="https://instagram.com/username"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="youtube">YouTube</Label>
                    <div className="relative mt-2">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="youtube"
                        placeholder="https://youtube.com/@username"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <div className="relative mt-2">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="twitter"
                        placeholder="https://twitter.com/username"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">취소</Button>
                  <Button className="bg-purple-600 text-white">
                    변경사항 저장
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-bold text-foreground mb-4">알림 설정</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      새로운 제안
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      기업으로부터 새로운 협업 제안이 올 때 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={notifications.newProposal}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, newProposal: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      프로젝트 업데이트
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      진행 중인 프로젝트에 업데이트가 있을 때 알림을 받습니다
                    </p>
                  </div>
                  <Switch
                    checked={notifications.projectUpdate}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, projectUpdate: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-b border-border">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">
                      정산 알림
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      정산이 완료되면 알림을 받습니다
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
                    <h4 className="font-semibold text-foreground mb-1">
                      마케팅 알림
                    </h4>
                    <p className="text-sm text-muted-foreground">
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
                <Button className="bg-purple-600 text-white">
                  설정 저장
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment">
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-4">정산 계좌 정보</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bank">은행 *</Label>
                    <Input
                      id="bank"
                      defaultValue="국민은행"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account">계좌번호 *</Label>
                    <Input
                      id="account"
                      defaultValue="123-45-678901"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="holder">예금주 *</Label>
                    <Input
                      id="holder"
                      defaultValue="김민지"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">취소</Button>
                  <Button className="bg-purple-600 text-white">
                    변경사항 저장
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-4">세금 정보</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="business-number">사업자등록번호</Label>
                    <Input
                      id="business-number"
                      placeholder="000-00-00000"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      사업자인 경우에만 입력해주세요
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="tax-email">세금계산서 이메일</Label>
                    <Input
                      id="tax-email"
                      type="email"
                      placeholder="tax@email.com"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline">취소</Button>
                  <Button className="bg-purple-600 text-white">
                    변경사항 저장
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-4">비밀번호 변경</h3>
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
                  <Button className="bg-purple-600 text-white">
                    비밀번호 변경
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="font-bold text-foreground mb-4">계정 관리</h3>
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-semibold text-foreground">
                          개인정보 처리방침
                        </p>
                        <p className="text-sm text-muted-foreground">
                          OLLI의 개인정보 처리방침 보기
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>

                  <button className="w-full flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-semibold text-foreground">
                          고객 지원
                        </p>
                        <p className="text-sm text-muted-foreground">
                          도움이 필요하신가요?
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
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

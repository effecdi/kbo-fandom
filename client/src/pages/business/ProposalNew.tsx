import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Send, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function ProposalNew() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    creator: "",
    campaign: "",
    message: "",
    budget: "",
    deadline: "",
  });

  return (
    <DashboardLayout userType="business">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">
              협업 제안 작성 ✉️
            </h1>
            <p className="text-muted-foreground">
              작가에게 보낼 협업 제안을 작성하세요
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-black text-foreground mb-6">기본 정보</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">제안 제목 *</Label>
                  <Input
                    id="title"
                    placeholder="예: 봄 신제품 인스타툰 협업 제안"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign">캠페인 연결</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="캠페인 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="campaign1">봄 신제품 런칭 캠페인</SelectItem>
                      <SelectItem value="campaign2">여름 프로모션</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-black text-foreground mb-6">요청 내용</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">메시지 *</Label>
                  <Textarea
                    id="message"
                    placeholder="협업 제안 내용을 자세히 작성해주세요..."
                    rows={8}
                    className="mt-2 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budget">예산</Label>
                    <Input
                      id="budget"
                      placeholder="₩500,000"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">마감일</Label>
                    <Input
                      id="deadline"
                      type="date"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-black text-foreground mb-6">첨부 파일</h2>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">파일을 드래그하거나 클릭하여 업로드</p>
                <p className="text-sm text-muted-foreground">브랜드 가이드, 참고 자료 등</p>
                <Button variant="outline" className="mt-4">
                  파일 선택
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-8">
              <h3 className="font-black text-foreground mb-4">선택한 작가</h3>
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mx-auto mb-3" />
                <p className="font-bold text-center text-foreground">작가 A</p>
                <p className="text-sm text-center text-muted-foreground">팔로워 15K</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">장르</span>
                  <span className="font-semibold text-foreground">일상, 로맨스</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">매칭도</span>
                  <span className="font-semibold text-blue-600">95%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  임시 저장
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  제안 발송
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

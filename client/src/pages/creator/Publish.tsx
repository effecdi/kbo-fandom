import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Save, Share2, CheckCircle2, Tag, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export function Publish() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>(["일상툰", "로맨스"]);
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <DashboardLayout userType="creator">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/creator/story")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-foreground mb-2">
                저장 & 발행 📤
              </h1>
              <p className="text-muted-foreground">
                작품 정보를 입력하고 발행하세요
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                임시 저장
              </Button>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Share2 className="w-4 h-4 mr-2" />
                발행하기
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-black text-foreground mb-6">기본 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">제목 *</Label>
                  <Input
                    id="title"
                    placeholder="작품 제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    placeholder="작품에 대한 간단한 설명을 작성하세요"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-2 resize-none"
                  />
                </div>

                <div>
                  <Label>태그</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="태그 입력 후 엔터"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button onClick={handleAddTag}>
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-black text-foreground mb-6">공개 설정</h2>
              
              <RadioGroup defaultValue="public" className="space-y-3">
                <div className="flex items-start space-x-3 p-4 rounded-xl border border-border hover:border-purple-600 cursor-pointer transition-all">
                  <RadioGroupItem value="public" id="public" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="public" className="cursor-pointer">
                      <div className="font-bold">전체 공개</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        모든 사용자에게 공개됩니다
                      </p>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-xl border border-border hover:border-purple-600 cursor-pointer transition-all">
                  <RadioGroupItem value="followers" id="followers" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="followers" className="cursor-pointer">
                      <div className="font-bold">팔로워만</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        나를 팔로우하는 사람에게만 공개됩니다
                      </p>
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 rounded-xl border border-border hover:border-purple-600 cursor-pointer transition-all">
                  <RadioGroupItem value="private" id="private" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="private" className="cursor-pointer">
                      <div className="font-bold">비공개</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        나만 볼 수 있습니다
                      </p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="font-black text-foreground mb-6">추가 옵션</h2>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 rounded-xl bg-muted">
                  <div className="flex-1">
                    <Label htmlFor="series" className="font-bold">시리즈 작품</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      이 작품을 시리즈로 등록합니다
                    </p>
                  </div>
                  <Switch id="series" />
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl bg-muted">
                  <div className="flex-1">
                    <Label htmlFor="portfolio" className="font-bold">포트폴리오 포함</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      프로필 포트폴리오에 표시됩니다
                    </p>
                  </div>
                  <Switch id="portfolio" defaultChecked />
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl bg-muted">
                  <div className="flex-1">
                    <Label htmlFor="mediakit" className="font-bold">미디어키트 반영</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      미디어키트 대표 작품에 추가됩니다
                    </p>
                  </div>
                  <Switch id="mediakit" defaultChecked />
                </div>

                <div className="flex items-start justify-between p-4 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200">
                  <div className="flex-1">
                    <Label htmlFor="business" className="font-bold flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      기업 노출 허용
                    </Label>
                    <p className="text-sm text-purple-700 mt-1">
                      기업/브랜드가 작품을 검색할 수 있습니다
                    </p>
                  </div>
                  <Switch id="business" defaultChecked />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Preview & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 border border-border sticky top-8">
              <h2 className="font-black text-foreground mb-4">미리보기</h2>
              
              <div className="aspect-[3/4] bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-4 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=600&fit=crop"
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">제목</p>
                  <p className="text-foreground">{title || "제목 없음"}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-muted-foreground">설명</p>
                  <p className="text-sm text-foreground">
                    {description || "설명 없음"}
                  </p>
                </div>

                {tags.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-2">태그</p>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">발행 준비 완료</p>
                    <p className="text-xs text-green-700 mt-1">
                      모든 필수 정보가 입력되었습니다
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

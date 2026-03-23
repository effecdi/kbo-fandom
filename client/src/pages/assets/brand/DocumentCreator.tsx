import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { StudioLayout } from "@/components/StudioLayout";
import { ArrowLeft, FileText, Upload, Check, File } from "lucide-react";
import { addItem, generateId, STORE_KEYS } from "@/lib/local-store";
import type { BrandAsset } from "./shared";
import { today } from "./shared";

const DOC_TYPES = [
  { id: "brand-guide", label: "브랜드 가이드" },
  { id: "style-guide", label: "스타일 가이드" },
  { id: "logo-usage", label: "로고 사용 규정" },
  { id: "tone-manner", label: "톤앤매너 가이드" },
];

export function DocumentCreatorPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [docType, setDocType] = useState("brand-guide");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const mb = file.size / 1024 / 1024;
    setFileSize(mb < 1 ? `${(file.size / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setFileName(file.name);
    const mb = file.size / 1024 / 1024;
    setFileSize(mb < 1 ? `${(file.size / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`);
  };

  const save = () => {
    const n = title.trim() || "새 문서";
    addItem<BrandAsset>(STORE_KEYS.BRAND_ASSETS, {
      id: generateId("ba"),
      name: n,
      type: "document",
      status: "draft",
      version: "1.0",
      downloads: 0,
      updatedAt: today(),
      fileSize: fileSize || "0 KB",
      description,
      tags: [DOC_TYPES.find((d) => d.id === docType)?.label || ""],
    });
    navigate("/assets/brand");
  };

  return (
    <StudioLayout>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link
          to="/assets/brand"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          브랜드 자산
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            브랜드 문서 추가
          </h1>
          <p className="text-sm text-white/40 mt-2">브랜드 가이드라인과 문서를 관리하세요</p>
        </div>

        {/* Doc type selection */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-semibold text-white/70">문서 유형</label>
          <div className="grid grid-cols-2 gap-3">
            {DOC_TYPES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDocType(d.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  docType === d.id
                    ? "border-[#00e5cc]/30 bg-[#00e5cc]/[0.05] text-[#00e5cc]"
                    : "border-white/[0.06] bg-white/[0.02] text-white/50 hover:border-white/[0.12]"
                }`}
              >
                <FileText className={`w-5 h-5 mb-2 ${docType === d.id ? "text-[#00e5cc]" : "text-white/20"}`} />
                <span className="text-sm font-medium">{d.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-semibold text-white/70">문서 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 브랜드 가이드라인 v5"
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00e5cc]/40 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-2 mb-6">
          <label className="text-sm font-semibold text-white/70">설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="문서에 대한 간단한 설명을 입력하세요"
            rows={3}
            className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#00e5cc]/40 transition-colors resize-none"
          />
        </div>

        {/* File upload */}
        <div className="mb-8">
          <label className="text-sm font-semibold text-white/70 mb-3 block">파일 업로드</label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="group rounded-2xl border-2 border-dashed border-white/[0.08] hover:border-[#00e5cc]/30 bg-white/[0.02] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
          >
            {fileName ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <File className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{fileName}</p>
                  <p className="text-xs text-white/30">{fileSize}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center group-hover:bg-[#00e5cc]/10 transition-colors">
                  <Upload className="w-6 h-6 text-white/20 group-hover:text-[#00e5cc] transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white/60">드래그 앤 드롭 또는 클릭</p>
                  <p className="text-xs text-white/30 mt-1">PDF, DOCX, PPT 지원</p>
                </div>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.pptx,.ppt,.doc"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        </div>

        {/* Save CTA */}
        <button
          onClick={save}
          disabled={!title.trim()}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00e5cc] to-[#0ea5e9] text-black font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,229,204,0.3)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          문서 저장
        </button>
      </div>
    </StudioLayout>
  );
}

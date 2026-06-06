import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  FileText,
  X,
  Check,
  Clock,
  MapPin,
  User,
  Star,
  ChevronRight,
} from "lucide-react";
import { getRecommendedHospitals } from "@/utils/mockData";
import type { RecommendedHospital } from "@/types";
import { cn, formatMinutes } from "@/utils/format";

const diseaseTypes = ["冠心病", "高血压", "糖尿病", "脑梗塞", "骨折", "肺炎", "慢性胃炎", "腰椎间盘突出"];

export function ReferralApply() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    diseaseType: "",
    summary: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedHospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<RecommendedHospital | null>(null);

  useEffect(() => {
    if (formData.diseaseType) {
      setRecommendations(getRecommendedHospitals(formData.diseaseType));
    }
  }, [formData.diseaseType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((f) => f.name);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f !== fileName));
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.patientName && formData.patientId && formData.diseaseType && formData.summary;
    }
    if (step === 2) {
      return uploadedFiles.length > 0;
    }
    if (step === 3) {
      return selectedHospital !== null;
    }
    return true;
  };

  const handleSubmit = () => {
    alert("转诊申请已提交，请等待审批");
    navigate("/referral");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/referral")}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">新建转诊申请</h1>
          <p className="text-gray-500 mt-1">填写患者信息并选择目标医院</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          {["基本信息", "资料上传", "医院选择", "确认提交"].map((s, i) => (
            <div key={i} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all",
                  step > i + 1
                    ? "bg-success-500 text-white"
                    : step === i + 1
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {step > i + 1 ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "ml-3 text-sm font-medium hidden md:block",
                  step >= i + 1 ? "text-gray-800" : "text-gray-400"
                )}
              >
                {s}
              </span>
              {i < 3 && (
                <ChevronRight
                  className={cn(
                    "w-5 h-5 mx-2 hidden md:block",
                    step > i + 1 ? "text-success-400" : "text-gray-300"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">患者姓名 *</label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  placeholder="请输入患者姓名"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">患者ID *</label>
                <input
                  type="text"
                  value={formData.patientId}
                  onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                  placeholder="请输入患者ID"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">疾病类型 *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {diseaseTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, diseaseType: type })}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      formData.diseaseType === type
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-primary-200 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-sm font-medium">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">病情摘要 *</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="请详细描述患者病情、症状、既往病史等信息..."
                rows={5}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">上传检查报告和病历资料</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                    <Upload className="w-8 h-8 text-primary-500" />
                  </div>
                  <p className="font-medium text-gray-800 mb-1">点击或拖拽文件到此处上传</p>
                  <p className="text-sm text-gray-500">支持 PDF、JPG、DICOM 等格式，单个文件不超过 50MB</p>
                </label>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">已上传文件 ({uploadedFiles.length})</p>
                {uploadedFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{file}</p>
                        <p className="text-xs text-gray-500">已上传</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-4">
                根据 <span className="font-medium text-primary-600">{formData.diseaseType}</span> 为您智能推荐以下医院
              </p>

              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div
                    key={rec.hospital.id}
                    onClick={() => setSelectedHospital(rec)}
                    className={cn(
                      "p-5 rounded-2xl border-2 cursor-pointer transition-all",
                      selectedHospital?.hospital.id === rec.hospital.id
                        ? "border-primary-500 bg-primary-50/50 shadow-lg shadow-primary-500/10"
                        : "border-gray-200 hover:border-primary-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-800 text-lg">{rec.hospital.name}</h3>
                            <span className="px-2 py-0.5 bg-primary-100 text-primary-600 rounded text-xs font-medium">
                              {rec.hospital.level === "tertiary" ? "三甲" : "二甲"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {rec.hospital.address}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {rec.doctor}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 mt-3">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-warning-500" />
                              <span className="text-sm text-gray-600">
                                预计等待 <span className="font-medium">{formatMinutes(rec.estimatedWaitTime)}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm text-gray-600">
                                推荐指数 <span className="font-medium">{rec.score}分</span>
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              剩余号源: <span className="font-medium text-success-600">{rec.availableSlots}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1",
                          selectedHospital?.hospital.id === rec.hospital.id
                            ? "border-primary-500 bg-primary-500"
                            : "border-gray-300"
                        )}
                      >
                        {selectedHospital?.hospital.id === rec.hospital.id && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-success-50 border border-success-200 rounded-2xl p-6">
              <h3 className="font-semibold text-success-800 text-lg mb-4">请确认转诊信息</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-success-600">患者姓名：</span>
                  <span className="font-medium text-success-800">{formData.patientName}</span>
                </div>
                <div>
                  <span className="text-success-600">患者ID：</span>
                  <span className="font-medium text-success-800">{formData.patientId}</span>
                </div>
                <div>
                  <span className="text-success-600">疾病类型：</span>
                  <span className="font-medium text-success-800">{formData.diseaseType}</span>
                </div>
                <div>
                  <span className="text-success-600">目标医院：</span>
                  <span className="font-medium text-success-800">{selectedHospital?.hospital.name}</span>
                </div>
                <div>
                  <span className="text-success-600">接诊医生：</span>
                  <span className="font-medium text-success-800">{selectedHospital?.doctor}</span>
                </div>
                <div>
                  <span className="text-success-600">上传资料：</span>
                  <span className="font-medium text-success-800">{uploadedFiles.length} 份</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <p className="text-yellow-800 text-sm">
                <strong>温馨提示：</strong>提交后将进入三级审批流程（基层科室主任 → 上级医院科室主任 → 医务科），
                审批超时24小时将自动升级至上一级。请保持电话畅通以便联系。
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一步
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-8 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
            >
              下一步
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-2.5 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-success-500/30"
            >
              提交申请
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

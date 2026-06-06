import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  User,
  FileText,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { mockReferrals } from "@/utils/mockData";
import { referralStatusLabels } from "@/types";
import { formatDateTime, cn, formatMinutes } from "@/utils/format";

export function ReferralApproval() {
  const navigate = useNavigate();
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const pendingReferrals = mockReferrals.filter((r) => r.status.startsWith("pending"));

  const handleApprove = (id: string) => {
    alert(`已通过转诊申请，意见：${comment || "无"}`);
    setSelectedReferral(null);
    setComment("");
  };

  const handleReject = (id: string) => {
    if (!comment.trim()) {
      alert("请填写拒绝原因");
      return;
    }
    alert(`已拒绝转诊申请，原因：${comment}`);
    setSelectedReferral(null);
    setComment("");
  };

  const getApprovalLevelLabel = (level: number) => {
    const labels = ["", "一级审批（基层科室主任）", "二级审批（上级医院科室主任）", "三级审批（医务科）"];
    return labels[level] || "";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/referral")}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">转诊审批</h1>
          <p className="text-gray-500 mt-1">处理待审批的转诊申请</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "待一级审批", value: pendingReferrals.filter((r) => r.currentLevel === 1).length, color: "primary" },
          { label: "待二级审批", value: pendingReferrals.filter((r) => r.currentLevel === 2).length, color: "warning" },
          { label: "待三级审批", value: pendingReferrals.filter((r) => r.currentLevel === 3).length, color: "danger" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">待审批列表</h3>
            <p className="text-sm text-gray-500 mt-1">共 {pendingReferrals.length} 条待处理</p>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {pendingReferrals.map((referral) => (
              <div
                key={referral.id}
                onClick={() => setSelectedReferral(referral.id)}
                className={cn(
                  "p-4 border-b border-gray-50 cursor-pointer transition-all",
                  selectedReferral === referral.id
                    ? "bg-primary-50 border-l-4 border-l-primary-500"
                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{referral.patientName}</p>
                      <span className="px-2 py-0.5 bg-warning-100 text-warning-600 rounded text-xs">
                        {getApprovalLevelLabel(referral.currentLevel)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{referral.diseaseType}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(referral.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-warning-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{formatMinutes(referral.estimatedWaitTime)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          {selectedReferral ? (
            <>
              {(() => {
                const referral = pendingReferrals.find((r) => r.id === selectedReferral);
                if (!referral) return null;
                return (
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">转诊申请详情</h3>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-sm font-medium",
                          referral.currentLevel === 1 && "bg-blue-100 text-blue-600",
                          referral.currentLevel === 2 && "bg-purple-100 text-purple-600",
                          referral.currentLevel === 3 && "bg-orange-100 text-orange-600"
                        )}
                      >
                        {getApprovalLevelLabel(referral.currentLevel)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-primary-500" />
                            患者信息
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">姓名</span>
                              <span className="font-medium text-gray-800">{referral.patientName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">患者ID</span>
                              <span className="font-medium text-gray-800">{referral.patientId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">疾病类型</span>
                              <span className="font-medium text-gray-800">{referral.diseaseType}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary-500" />
                            病情摘要
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{referral.summary}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary-500" />
                            转诊信息
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">转出机构</span>
                              <span className="font-medium text-gray-800">{referral.fromHospital}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">转出科室</span>
                              <span className="font-medium text-gray-800">{referral.fromDepartment}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">申请医生</span>
                              <span className="font-medium text-gray-800">{referral.fromDoctor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">建议医院</span>
                              <span className="font-medium text-primary-600">{referral.recommendedHospital}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">预计等待</span>
                              <span className="font-medium text-warning-600">{formatMinutes(referral.estimatedWaitTime)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="font-medium text-gray-800 mb-3">上传资料</h4>
                          <div className="space-y-2">
                            {referral.reports.map((report, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200"
                              >
                                <FileText className="w-4 h-4 text-primary-500" />
                                <span className="text-sm text-gray-700">{report}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">审批提示</p>
                        <p className="text-xs text-yellow-600 mt-1">
                          请在24小时内完成审批，超时系统将自动升级至上一级。当前级别：{getApprovalLevelLabel(referral.currentLevel)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">审批意见</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="请输入审批意见（拒绝时必填）..."
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleReject(referral.id)}
                        className="flex-1 py-3 border-2 border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <X className="w-5 h-5" />
                        拒绝
                      </button>
                      <button
                        onClick={() => handleApprove(referral.id)}
                        className="flex-1 py-3 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-success-500/30"
                      >
                        <Check className="w-5 h-5" />
                        通过
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ChevronDown className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">请从左侧列表选择待审批的转诊申请</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

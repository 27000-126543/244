import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { mockReferrals } from "@/utils/mockData";
import { referralStatusLabels } from "@/types";
import { formatDateTime, cn, formatMinutes } from "@/utils/format";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  pending_level1: "bg-blue-100 text-blue-600",
  pending_level2: "bg-purple-100 text-purple-600",
  pending_level3: "bg-orange-100 text-orange-600",
  approved: "bg-success-100 text-success-600",
  rejected: "bg-red-100 text-red-600",
  escalated: "bg-warning-100 text-warning-600",
};

export function ReferralList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);

  const filteredReferrals = mockReferrals.filter((r) => {
    const matchesSearch =
      r.patientName.includes(searchTerm) ||
      r.diseaseType.includes(searchTerm) ||
      r.patientId.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">转诊管理</h1>
          <p className="text-gray-500 mt-1">管理患者转诊申请与审批流程</p>
        </div>
        <Link
          to="/referral/apply"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新建转诊
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "全部转诊", value: mockReferrals.length, icon: <ArrowRightLeft className="w-5 h-5" />, color: "primary" },
          { label: "待审批", value: mockReferrals.filter((r) => r.status.startsWith("pending")).length, icon: <Clock className="w-5 h-5" />, color: "warning" },
          { label: "已通过", value: mockReferrals.filter((r) => r.status === "approved").length, icon: <CheckCircle className="w-5 h-5" />, color: "success" },
          { label: "已拒绝", value: mockReferrals.filter((r) => r.status === "rejected").length, icon: <XCircle className="w-5 h-5" />, color: "default" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-lg",
                  stat.color === "primary" && "bg-primary-100 text-primary-600",
                  stat.color === "success" && "bg-success-100 text-success-600",
                  stat.color === "warning" && "bg-warning-100 text-warning-600",
                  stat.color === "default" && "bg-gray-100 text-gray-600"
                )}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索患者姓名、ID或疾病类型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition-all",
                showFilter
                  ? "bg-primary-50 border-primary-200 text-primary-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              )}
            >
              <Filter className="w-4 h-4" />
              筛选
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilter && "rotate-180")} />
            </button>
            <Link
              to="/referral/approval"
              className="flex items-center gap-2 px-4 py-2.5 bg-warning-50 border border-warning-200 text-warning-600 rounded-xl text-sm hover:bg-warning-100 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              待审批
            </Link>
          </div>
        </div>

        {showFilter && (
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-3">
            {["all", "pending_level1", "pending_level2", "pending_level3", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  statusFilter === status
                    ? "bg-primary-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary-200"
                )}
              >
                {status === "all" ? "全部状态" : referralStatusLabels[status as keyof typeof referralStatusLabels]}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">患者信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">疾病类型</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">转出机构</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预计等待</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{referral.patientName}</p>
                      <p className="text-sm text-gray-500">{referral.patientId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{referral.diseaseType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-700">{referral.fromHospital}</p>
                      <p className="text-sm text-gray-500">{referral.fromDoctor}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{formatMinutes(referral.estimatedWaitTime)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        statusColors[referral.status]
                      )}
                    >
                      {referralStatusLabels[referral.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{formatDateTime(referral.createdAt)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReferrals.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">未找到匹配的转诊记录</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Video,
  Search,
  Calendar,
  Clock,
  Users,
  Play,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { mockConsultations } from "@/utils/mockData";
import { consultationStatusLabels } from "@/types";
import { formatDateTime, cn } from "@/utils/format";

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-600",
  in_progress: "bg-green-100 text-green-600",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-600",
};

export function ConsultationList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredConsultations = mockConsultations.filter((c) => {
    const matchesSearch =
      c.title.includes(searchTerm) ||
      c.patientName.includes(searchTerm) ||
      c.initiator.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">远程会诊</h1>
          <p className="text-gray-500 mt-1">多学科专家在线会诊</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5">
          <Plus className="w-5 h-5" />
          发起会诊
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "全部会诊", value: mockConsultations.length, icon: <Video className="w-5 h-5" />, color: "primary" },
          { label: "已预约", value: mockConsultations.filter((c) => c.status === "scheduled").length, icon: <Calendar className="w-5 h-5" />, color: "warning" },
          { label: "进行中", value: mockConsultations.filter((c) => c.status === "in_progress").length, icon: <Play className="w-5 h-5" />, color: "success" },
          { label: "已完成", value: mockConsultations.filter((c) => c.status === "completed").length, icon: <CheckCircle className="w-5 h-5" />, color: "default" },
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
              placeholder="搜索会诊主题、患者姓名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {["all", "scheduled", "in_progress", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  statusFilter === status
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {status === "all" ? "全部" : consultationStatusLabels[status as keyof typeof consultationStatusLabels]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredConsultations.map((consultation) => (
            <div
              key={consultation.id}
              className="bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                    {consultation.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">患者：{consultation.patientName}</p>
                </div>
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium",
                    statusColors[consultation.status]
                  )}
                >
                  {consultationStatusLabels[consultation.status]}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{formatDateTime(consultation.scheduledTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{consultation.experts.length} 位专家</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>{consultation.medicalRecords.length + consultation.images.length} 份资料</span>
                </div>
              </div>

              {consultation.status === "in_progress" && (
                <Link
                  to={`/consultation/room/${consultation.id}`}
                  className="w-full py-2.5 bg-gradient-to-r from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  进入会诊室
                </Link>
              )}
              {consultation.status === "scheduled" && (
                <div className="w-full py-2.5 bg-gray-200 text-gray-600 font-medium rounded-lg text-center text-sm">
                  未开始
                </div>
              )}
              {consultation.status === "completed" && (
                <div className="w-full py-2.5 bg-primary-50 text-primary-600 font-medium rounded-lg text-center text-sm">
                  查看会诊报告
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

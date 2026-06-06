import { useState } from "react";
import {
  Plus,
  Search,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Truck,
  Eye,
  FileText,
} from "lucide-react";
import { mockPrescriptions } from "@/utils/mockData";
import { prescriptionStatusLabels, stockStatusLabels } from "@/types";
import { formatDateTime, cn, formatCurrency } from "@/utils/format";

const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-600",
  dispensed: "bg-green-100 text-green-600",
  shortage: "bg-orange-100 text-orange-600",
  completed: "bg-gray-100 text-gray-600",
};

const stockColorMap: Record<string, string> = {
  sufficient: "text-success-600 bg-success-50",
  low: "text-warning-600 bg-warning-50",
  out_of_stock: "text-red-600 bg-red-50",
};

export function PrescriptionList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAlerts, setShowAlerts] = useState(true);

  const filteredPrescriptions = mockPrescriptions.filter((p) => {
    const matchesSearch =
      p.patientName.includes(searchTerm) ||
      p.doctor.includes(searchTerm) ||
      p.drugs.some((d) => d.name.includes(searchTerm));
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const shortagePrescriptions = mockPrescriptions.filter((p) =>
    p.drugs.some((d) => d.stockStatus === "out_of_stock" || d.stockStatus === "low")
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">处方管理</h1>
          <p className="text-gray-500 mt-1">处方流转与药品调配</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5">
          <Plus className="w-5 h-5" />
          新开处方
        </button>
      </div>

      {showAlerts && shortagePrescriptions.length > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-800">
                  药品库存预警：{shortagePrescriptions.length} 张处方存在缺药情况
                </p>
                <p className="text-sm text-warning-600 mt-1">
                  系统已自动生成采购预警并通知配送中心，请及时处理。
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-warning-500 text-white rounded-lg text-sm font-medium hover:bg-warning-600 transition-colors flex items-center gap-2">
                <Truck className="w-4 h-4" />
                通知配送
              </button>
              <button
                onClick={() => setShowAlerts(false)}
                className="p-2 text-warning-600 hover:bg-warning-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "处方总数", value: mockPrescriptions.length, icon: <FileText className="w-5 h-5" />, color: "primary" },
          { label: "待调配", value: mockPrescriptions.filter((p) => p.status === "pending").length, icon: <Clock className="w-5 h-5" />, color: "warning" },
          { label: "缺药预警", value: shortagePrescriptions.length, icon: <AlertTriangle className="w-5 h-5" />, color: "danger" },
          { label: "已完成", value: mockPrescriptions.filter((p) => p.status === "completed").length, icon: <CheckCircle className="w-5 h-5" />, color: "success" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-lg",
                  stat.color === "primary" && "bg-primary-100 text-primary-600",
                  stat.color === "success" && "bg-success-100 text-success-600",
                  stat.color === "warning" && "bg-warning-100 text-warning-600",
                  stat.color === "danger" && "bg-red-100 text-red-600"
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
              placeholder="搜索患者、医生或药品名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "dispensed", "shortage", "completed"].map((status) => (
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
                {status === "all" ? "全部" : prescriptionStatusLabels[status as keyof typeof prescriptionStatusLabels]}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Pill className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{prescription.patientName}</h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            statusColors[prescription.status]
                          )}
                        >
                          {prescriptionStatusLabels[prescription.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {prescription.hospital} · {prescription.department} · {prescription.doctor}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {prescription.drugs.map((drug, i) => (
                      <div
                        key={i}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm flex items-center gap-2",
                          stockColorMap[drug.stockStatus]
                        )}
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span className="font-medium">{drug.name}</span>
                        <span className="text-xs opacity-75">
                          {stockStatusLabels[drug.stockStatus]}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <span>开方时间：{formatDateTime(prescription.createdAt)}</span>
                    <span>
                      总金额：
                      <span className="font-medium text-gray-800">
                        {formatCurrency(prescription.drugs.reduce((sum, d) => sum + d.price * d.quantity, 0))}
                      </span>
                    </span>
                  </div>
                </div>

                <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import {
  Search,
  Receipt,
  Download,
  FileText,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { mockSettlements } from "@/utils/mockData";
import { formatDateTime, cn, formatCurrency } from "@/utils/format";

export function SettlementList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredSettlements = mockSettlements.filter((s) =>
    s.patientName.includes(searchTerm) ||
    s.fromHospital.includes(searchTerm) ||
    s.toHospital.includes(searchTerm)
  );

  const totalAmount = mockSettlements.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalInsurance = mockSettlements.reduce((sum, s) => sum + s.insuranceCoverage, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">费用结算</h1>
          <p className="text-gray-500 mt-1">医保政策适配与医院分成结算</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5" />
          导出对账单
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "结算单数", value: mockSettlements.length, icon: <Receipt className="w-5 h-5" />, color: "primary" },
          { label: "总金额", value: formatCurrency(totalAmount), icon: <FileText className="w-5 h-5" />, color: "success" },
          { label: "医保覆盖", value: formatCurrency(totalInsurance), icon: <Building className="w-5 h-5" />, color: "warning" },
          { label: "待结算", value: mockSettlements.filter((s) => s.status === "pending").length, icon: <Clock className="w-5 h-5" />, color: "default" },
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
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
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
              placeholder="搜索患者、医院名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredSettlements.map((settlement) => (
            <div key={settlement.id} className="transition-colors">
              <div
                className="p-5 hover:bg-gray-50 cursor-pointer"
                onClick={() => setExpandedId(expandedId === settlement.id ? null : settlement.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{settlement.patientName}</h3>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            settlement.status === "completed"
                              ? "bg-success-100 text-success-600"
                              : "bg-warning-100 text-warning-600"
                          )}
                        >
                          {settlement.status === "completed" ? "已结算" : "待结算"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {settlement.fromHospital} → {settlement.toHospital}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatCurrency(settlement.totalAmount)}</p>
                      <p className="text-xs text-gray-500">
                        医保支付 {formatCurrency(settlement.insuranceCoverage)}
                      </p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-sm text-gray-600">{formatDate(settlement.settlementDate)}</p>
                      <p className="text-xs text-gray-500">结算日期</p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      {expandedId === settlement.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {expandedId === settlement.id && (
                <div className="px-5 pb-5 animate-fade-in">
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-medium text-gray-800 mb-4">分成明细</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-600">总费用</span>
                          <span className="font-bold text-gray-800">{formatCurrency(settlement.totalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-600">医保报销</span>
                          <span className="font-medium text-success-600">{formatCurrency(settlement.insuranceCoverage)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-gray-600">个人支付</span>
                          <span className="font-bold text-warning-600">{formatCurrency(settlement.patientPayment)}</span>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 border border-gray-100">
                        <h5 className="font-medium text-gray-700 mb-3">医院分成</h5>
                        {settlement.hospitalSplit.map((split, i) => (
                          <div key={i} className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">
                              {split.hospital} ({split.percentage}%)
                            </span>
                            <span className="font-medium text-gray-800">{formatCurrency(split.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                        <Eye className="w-4 h-4" />
                        查看详情
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        下载对账单
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("zh-CN");
}

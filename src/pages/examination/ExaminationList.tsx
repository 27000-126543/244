import { useState } from "react";
import {
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  Eye,
  Calendar,
  Building,
} from "lucide-react";
import { mockExaminations } from "@/utils/mockData";
import { formatDateTime, cn } from "@/utils/format";

export function ExaminationList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDuplicates, setShowDuplicates] = useState(false);

  const filteredExams = mockExaminations.filter((e) => {
    const matchesSearch =
      e.patientName.includes(searchTerm) ||
      e.itemName.includes(searchTerm) ||
      e.patientId.includes(searchTerm);
    const matchesDuplicate = !showDuplicates || e.isDuplicate;
    return matchesSearch && matchesDuplicate;
  });

  const duplicateCount = mockExaminations.filter((e) => e.isDuplicate).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">检查检验</h1>
          <p className="text-gray-500 mt-1">医共体内检查检验结果互认</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5" />
          导出报告
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "检查总数", value: mockExaminations.length, icon: <FileText className="w-5 h-5" />, color: "primary" },
          { label: "互认率", value: 87, suffix: "%", icon: <CheckCircle className="w-5 h-5" />, color: "success" },
          { label: "重复检查", value: duplicateCount, icon: <AlertTriangle className="w-5 h-5" />, color: "warning" },
          { label: "本月新增", value: 156, icon: <Calendar className="w-5 h-5" />, color: "default" },
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
                <p className="text-2xl font-bold text-gray-800">
                  {stat.value}
                  {stat.suffix && <span className="text-lg">{stat.suffix}</span>}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {duplicateCount > 0 && (
        <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-warning-800">发现 {duplicateCount} 项重复检查提醒</p>
            <p className="text-sm text-warning-600 mt-1">
              系统检测到部分患者在近期已做过相同检查项目，建议优先查阅历史报告，避免重复检查。
            </p>
          </div>
          <button
            onClick={() => setShowDuplicates(!showDuplicates)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              showDuplicates
                ? "bg-warning-500 text-white"
                : "bg-warning-100 text-warning-700 hover:bg-warning-200"
            )}
          >
            {showDuplicates ? "显示全部" : "只看重复"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索患者姓名、ID或检查项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">患者信息</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查项目</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">检查机构</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">报告时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{exam.patientName}</p>
                      <p className="text-sm text-gray-500">{exam.patientId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-700">{exam.itemName}</p>
                      <p className="text-sm text-gray-500">{exam.type}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{exam.hospital}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{formatDateTime(exam.reportDate)}</span>
                  </td>
                  <td className="px-6 py-4">
                    {exam.isDuplicate ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-600">
                        <AlertTriangle className="w-3 h-3" />
                        重复检查
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success-100 text-success-600">
                        <CheckCircle className="w-3 h-3" />
                        结果互认
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      查看报告
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

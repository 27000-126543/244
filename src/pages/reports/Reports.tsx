import { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Building,
  Filter,
  FileText,
  TrendingUp,
  ArrowRightLeft,
  Video,
  Bed,
  FileCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn, formatCurrency } from "@/utils/format";

const COLORS = ["#0066CC", "#00B578", "#FF6B35", "#8B5CF6", "#EC4899"];

const monthlyData = [
  { month: "1月", 转诊量: 156, 会诊量: 45, 检查量: 890 },
  { month: "2月", 转诊量: 168, 会诊量: 52, 检查量: 920 },
  { month: "3月", 转诊量: 182, 会诊量: 48, 检查量: 1050 },
  { month: "4月", 转诊量: 175, 会诊量: 61, 检查量: 980 },
  { month: "5月", 转诊量: 198, 会诊量: 55, 检查量: 1120 },
  { month: "6月", 转诊量: 210, 会诊量: 68, 检查量: 1250 },
];

const hospitalData = [
  { name: "市中心医院", 转诊: 420, 会诊: 156, 床位: 1200 },
  { name: "市第二医院", 转诊: 280, 会诊: 98, 床位: 800 },
  { name: "市中医院", 转诊: 180, 会诊: 72, 床位: 600 },
];

const departmentData = [
  { name: "心内科", value: 235 },
  { name: "神经内科", value: 189 },
  { name: "骨科", value: 156 },
  { name: "呼吸内科", value: 128 },
  { name: "其他", value: 201 },
];

export function Reports() {
  const [selectedHospital, setSelectedHospital] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [dateRange, setDateRange] = useState("month");

  const handleExport = () => {
    alert("月度运营分析报告已生成，正在下载...");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">数据报表</h1>
          <p className="text-gray-500 mt-1">医共体运营数据分析与报表导出</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
        >
          <Download className="w-5 h-5" />
          导出月度报告
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-gray-400" />
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            >
              <option value="all">全部医院</option>
              <option value="h1">市中心医院</option>
              <option value="h2">市第二人民医院</option>
              <option value="h3">市中医院</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            >
              <option value="all">全部科室</option>
              <option value="cardiology">心内科</option>
              <option value="neurology">神经内科</option>
              <option value="orthopedics">骨科</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
            >
              <option value="week">本周</option>
              <option value="month">本月</option>
              <option value="quarter">本季度</option>
              <option value="year">本年度</option>
            </select>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 text-sm text-success-600">
            <TrendingUp className="w-4 h-4" />
            <span>较上月增长 12.5%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "总转诊量", value: "1,089", icon: <ArrowRightLeft className="w-5 h-5" />, color: "primary" },
          { label: "总会诊量", value: "329", icon: <Video className="w-5 h-5" />, color: "success" },
          { label: "平均床位率", value: "82.3%", icon: <Bed className="w-5 h-5" />, color: "warning" },
          { label: "检查互认率", value: "87.5%", icon: <FileCheck className="w-5 h-5" />, color: "primary" },
          { label: "总结算金额", value: "¥286万", icon: <BarChart3 className="w-5 h-5" />, color: "success" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2.5 rounded-lg",
                  stat.color === "primary" && "bg-primary-100 text-primary-600",
                  stat.color === "success" && "bg-success-100 text-success-600",
                  stat.color === "warning" && "bg-warning-100 text-warning-600"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">月度业务趋势</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="转诊量" stroke="#0066CC" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="会诊量" stroke="#00B578" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="检查量" stroke="#FF6B35" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">各医院业务对比</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
                <Bar dataKey="转诊" fill="#0066CC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="会诊" fill="#00B578" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">转诊科室分布</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">关键指标说明</h3>
          <div className="space-y-4">
            {[
              { label: "转诊效率", value: "92.5%", desc: "24小时内完成审批比例", trend: "+2.3%" },
              { label: "会诊响应时间", value: "1.2小时", desc: "平均响应时长", trend: "-15分钟" },
              { label: "重复检查率", value: "3.2%", desc: "重复检查占比", trend: "-0.8%" },
              { label: "患者满意度", value: "96.8%", desc: "患者满意度评分", trend: "+1.5%" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600">{item.value}</p>
                  <p className="text-xs text-success-600">{item.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

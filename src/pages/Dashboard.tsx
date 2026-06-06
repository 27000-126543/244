import { useEffect } from "react";
import {
  ArrowRightLeft,
  Video,
  Bed,
  FileCheck,
  Package,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "@/components/common/StatCard";
import { useDashboardStore } from "@/store/useDashboardStore";
import { cn } from "@/utils/format";

const COLORS = ["#0066CC", "#00B578", "#FF6B35", "#8B5CF6", "#EC4899"];

export function Dashboard() {
  const { stats, startAutoRefresh } = useDashboardStore();

  useEffect(() => {
    const stopRefresh = startAutoRefresh();
    return () => stopRefresh();
  }, [startAutoRefresh]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">运营数据大屏</h1>
          <p className="text-gray-500 mt-1">医共体综合服务与资源调度平台实时数据</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success-500" />
          </span>
          <span className="text-sm text-success-600 font-medium">实时更新中</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="累计转诊"
          value={stats.totalReferrals}
          icon={<ArrowRightLeft className="w-6 h-6" />}
          color="primary"
          trend="up"
          trendValue={`今日 +${stats.todayReferrals}`}
        />
        <StatCard
          title="远程会诊"
          value={stats.totalConsultations}
          icon={<Video className="w-6 h-6" />}
          color="success"
          trend="up"
          trendValue={`今日 +${stats.todayConsultations}`}
        />
        <StatCard
          title="床位占用率"
          value={stats.bedOccupancyRate}
          suffix="%"
          isPercentage
          icon={<Bed className="w-6 h-6" />}
          color="warning"
        />
        <StatCard
          title="检查互认率"
          value={stats.examinationMutualRecognitionRate}
          suffix="%"
          isPercentage
          icon={<FileCheck className="w-6 h-6" />}
          color="primary"
          trend="up"
          trendValue="较上月 +3.2%"
        />
        <StatCard
          title="药品周转天数"
          value={stats.drugInventoryTurnover}
          suffix="天"
          icon={<Package className="w-6 h-6" />}
          color="success"
          trend="down"
          trendValue="较上月 -1.5天"
        />
        <StatCard
          title="今日活跃"
          value={128}
          icon={<Activity className="w-6 h-6" />}
          color="default"
          trend="up"
          trendValue="+12.5%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">会诊量趋势</h3>
              <p className="text-sm text-gray-500">近7天远程会诊数据</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-success-600">
              <TrendingUp className="w-4 h-4" />
              <span>增长 15.3%</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.consultationsTrend}>
                <defs>
                  <linearGradient id="colorConsult" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066CC" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="会诊量"
                  stroke="#0066CC"
                  strokeWidth={3}
                  dot={{ fill: "#0066CC", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  fill="url(#colorConsult)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">转诊医院分布</h3>
            <p className="text-sm text-gray-500">各医院接收转诊情况</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.referralsByHospital}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.referralsByHospital.map((_, index) => (
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
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {stats.referralsByHospital.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs text-gray-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800">床位使用情况</h3>
            <p className="text-sm text-gray-500">各医院床位占用统计</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bedUsageByHospital} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#9CA3AF"
                  fontSize={11}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="occupied" name="已占用" stackId="a" fill="#0066CC" radius={[0, 4, 4, 0]} />
                <Bar
                  dataKey={(d) => d.total - d.occupied}
                  name="空余"
                  stackId="a"
                  fill="#E6F0FA"
                  radius={[4, 0, 0, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">实时动态</h3>
              <p className="text-sm text-gray-500">系统最新事件记录</p>
            </div>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { type: "referral", title: "新转诊申请", desc: "张三 - 冠心病", time: "2分钟前", color: "primary" },
              { type: "consultation", title: "会诊完成", desc: "李四 - 多学科会诊", time: "15分钟前", color: "success" },
              { type: "approval", title: "审批通过", desc: "王五 - 转诊申请", time: "32分钟前", color: "primary" },
              { type: "warning", title: "库存预警", desc: "阿莫西林胶囊库存不足", time: "1小时前", color: "warning" },
              { type: "report", title: "检查报告", desc: "赵六 - CT报告已出具", time: "2小时前", color: "default" },
            ].map((item, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-gray-50",
                  "animate-slide-up"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    item.color === "primary" && "bg-primary-100 text-primary-600",
                    item.color === "success" && "bg-success-100 text-success-600",
                    item.color === "warning" && "bg-warning-100 text-warning-600",
                    item.color === "default" && "bg-gray-100 text-gray-600"
                  )}
                >
                  {item.type === "referral" && <ArrowRightLeft className="w-5 h-5" />}
                  {item.type === "consultation" && <Video className="w-5 h-5" />}
                  {item.type === "approval" && <FileCheck className="w-5 h-5" />}
                  {item.type === "warning" && <Activity className="w-5 h-5" />}
                  {item.type === "report" && <FileCheck className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <p className="text-sm text-gray-500 truncate">{item.desc}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

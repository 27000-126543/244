import { Bell, Search, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { formatDateTime } from "@/utils/format";

export function Header() {
  const { lastUpdate, isLoading, refreshStats } = useDashboardStore();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索患者、报告、处方..."
            className="w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          数据更新于: <span className="text-gray-700 font-medium">{formatDateTime(lastUpdate)}</span>
        </div>

        <button
          onClick={refreshStats}
          disabled={isLoading}
          className="p-2 rounded-lg text-gray-500 hover:text-primary-500 hover:bg-primary-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-gray-500 hover:text-primary-500 hover:bg-primary-50 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-warning-500 rounded-full animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">通知中心</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {[
                  { id: 1, title: "转诊申请待审批", desc: "张三的转诊申请等待您审批", time: "5分钟前", type: "warning" },
                  { id: 2, title: "会诊即将开始", desc: "冠心病多学科会诊将在30分钟后开始", time: "10分钟前", type: "info" },
                  { id: 3, title: "药品库存预警", desc: "阿莫西林胶囊库存不足，请及时采购", time: "1小时前", type: "error" },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          item.type === "warning"
                            ? "bg-warning-500"
                            : item.type === "error"
                            ? "bg-red-500"
                            : "bg-primary-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import {
  Users,
  Shield,
  Building,
  Settings,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { mockUsers, mockHospitals } from "@/utils/mockData";
import { roleLabels } from "@/types";
import { cn } from "@/utils/format";

export function Admin() {
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "hospitals" | "settings">("users");
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = [
    { key: "users", label: "用户管理", icon: <Users className="w-5 h-5" /> },
    { key: "roles", label: "角色权限", icon: <Shield className="w-5 h-5" /> },
    { key: "hospitals", label: "机构管理", icon: <Building className="w-5 h-5" /> },
    { key: "settings", label: "系统设置", icon: <Settings className="w-5 h-5" /> },
  ];

  const filteredUsers = mockUsers.filter(
    (u) => u.name.includes(searchTerm) || u.hospital.includes(searchTerm)
  );

  const rolePermissions: Record<string, string[]> = {
    grassroots_doctor: ["查看检查报告", "填写转诊申请", "发起会诊", "开具处方"],
    senior_doctor: ["接收转诊患者", "参与会诊", "查看病历", "开具处方"],
    department_director: ["审批转诊", "查看科室数据", "管理科室用户"],
    medical_affairs: ["三级审批", "监督流程", "处理异常升级", "查看结算"],
    admin: ["系统管理", "权限配置", "全局数据查看", "导出报告"],
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">系统管理</h1>
          <p className="text-gray-500 mt-1">用户、角色、机构和系统配置管理</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-white text-primary-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户姓名或机构..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
              <Plus className="w-4 h-4" />
              添加用户
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户信息</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">角色</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">所属机构</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">科室</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-primary-100 text-primary-600 rounded-full text-xs font-medium">
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{user.hospital}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{user.department}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(roleLabels).map(([role, label]) => (
            <div key={role} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{label}</h3>
                <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                  编辑权限
                </button>
              </div>
              <div className="space-y-2">
                {rolePermissions[role]?.map((perm, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-success-500 rounded-full" />
                    {perm}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "hospitals" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-medium text-gray-800">医疗机构列表</h3>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
              <Plus className="w-4 h-4" />
              添加机构
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {mockHospitals.map((hospital) => (
              <div key={hospital.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">{hospital.name}</h4>
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-600 rounded text-xs font-medium">
                          {hospital.level === "tertiary" ? "三甲" : hospital.level === "secondary" ? "二甲" : "社区"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{hospital.address}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>床位: {hospital.occupiedBeds}/{hospital.bedCapacity}</span>
                        <span>科室: {hospital.departments.length}个</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-6">基础设置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">系统名称</label>
                <input
                  type="text"
                  defaultValue="区域医疗联合体综合服务平台"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">转诊审批超时时间（小时）</label>
                <input
                  type="number"
                  defaultValue="24"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">数据刷新间隔（秒）</label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
            </div>
            <button className="mt-6 w-full py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
              保存设置
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-6">医保政策配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">医保报销比例（%）</label>
                <input
                  type="number"
                  defaultValue="65"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">上级医院分成比例（%）</label>
                <input
                  type="number"
                  defaultValue="70"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">基层医院分成比例（%）</label>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
            </div>
            <button className="mt-6 w-full py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
              保存配置
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

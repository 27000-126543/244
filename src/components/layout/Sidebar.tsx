import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Video,
  FileText,
  Pill,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils/format";
import { useAuthStore } from "@/store/useAuthStore";
import { roleLabels } from "@/types";

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    path: "/dashboard",
    label: "首页大屏",
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ["grassroots_doctor", "senior_doctor", "department_director", "medical_affairs", "admin"],
  },
  {
    path: "/referral",
    label: "转诊管理",
    icon: <ArrowRightLeft className="w-5 h-5" />,
    roles: ["grassroots_doctor", "department_director", "medical_affairs", "admin"],
  },
  {
    path: "/consultation",
    label: "远程会诊",
    icon: <Video className="w-5 h-5" />,
    roles: ["grassroots_doctor", "senior_doctor", "department_director", "medical_affairs", "admin"],
  },
  {
    path: "/examination",
    label: "检查检验",
    icon: <FileText className="w-5 h-5" />,
    roles: ["grassroots_doctor", "senior_doctor", "department_director", "medical_affairs", "admin"],
  },
  {
    path: "/prescription",
    label: "处方管理",
    icon: <Pill className="w-5 h-5" />,
    roles: ["grassroots_doctor", "senior_doctor", "department_director", "admin"],
  },
  {
    path: "/settlement",
    label: "费用结算",
    icon: <Receipt className="w-5 h-5" />,
    roles: ["medical_affairs", "admin"],
  },
  {
    path: "/reports",
    label: "数据报表",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["department_director", "medical_affairs", "admin"],
  },
  {
    path: "/admin",
    label: "系统管理",
    icon: <Settings className="w-5 h-5" />,
    roles: ["admin"],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const filteredItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className={cn(
        "h-screen bg-gradient-to-b from-dark-900 to-dark-800 text-white flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center font-bold text-lg">
            医
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg">医共体平台</h1>
              <p className="text-xs text-gray-400">综合服务调度系统</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary-500/20 text-primary-300 border-l-4 border-primary-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5",
                    collapsed && "justify-center"
                  )}
                >
                  {item.icon}
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        {!collapsed && user && (
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-400">{roleLabels[user.role]}</p>
            <p className="text-xs text-gray-500 mt-1">{user.hospital}</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors",
              collapsed && "w-full justify-center"
            )}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm">退出登录</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

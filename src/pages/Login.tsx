import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, Hospital, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import type { UserRole } from "@/types";
import { roleLabels } from "@/types";
import { cn } from "@/utils/format";

const roleOptions: { value: UserRole; label: string; desc: string }[] = [
  { value: "grassroots_doctor", label: "基层医生", desc: "社区卫生服务中心医生" },
  { value: "senior_doctor", label: "上级医生", desc: "上级医院专科医生" },
  { value: "department_director", label: "科室主任", desc: "科室管理与审批" },
  { value: "medical_affairs", label: "医务科", desc: "三级审批与监督" },
  { value: "admin", label: "管委会管理员", desc: "系统全局管理" },
];

export function Login() {
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("grassroots_doctor");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("请输入用户名");
      return;
    }

    const success = login(username, selectedRole);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("登录失败，请重试");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-dark-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success-400/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 p-12 flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Hospital className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">医共体平台</h1>
                <p className="text-primary-100 text-sm">区域医疗联合体综合服务系统</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-4">智慧医疗，协同服务</h2>
            <p className="text-primary-100 leading-relaxed">
              连接多家医院和社区卫生中心，实现智能转诊、远程会诊、检查互认、处方流转、费用结算等一体化服务，优化医疗资源配置，提升诊疗效率。
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: <ShieldCheck className="w-5 h-5" />, text: "三级审批流程，保障医疗安全" },
              { icon: <ShieldCheck className="w-5 h-5" />, text: "检查结果互认，避免重复检查" },
              { icon: <ShieldCheck className="w-5 h-5" />, text: "实时数据监控，智能资源调度" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  {item.icon}
                </div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 p-12">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Hospital className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">医共体平台</h1>
              <p className="text-gray-500 text-sm">综合服务调度系统</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎登录</h2>
          <p className="text-gray-500 mb-8">请选择角色并输入用户名登录系统</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">选择角色</label>
              <div className="grid gap-2">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all duration-200",
                      selectedRole === role.value
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-primary-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                          selectedRole === role.value ? "border-primary-500" : "border-gray-300"
                        )}
                      >
                        {selectedRole === role.value && (
                          <div className="w-2.5 h-2.5 bg-primary-500 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{role.label}</p>
                        <p className="text-xs text-gray-500">{role.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入您的姓名"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value="********"
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">演示模式</span>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
            >
              <LogIn className="w-5 h-5" />
              登录系统
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            当前角色: <span className="text-primary-600 font-medium">{roleLabels[selectedRole]}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

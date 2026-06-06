import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, Hospital, ShieldCheck, Info } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/utils/format";

export function Login() {
  const [username, setUsername] = useState("grassroots1");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim()) {
      setError("请输入用户名");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("请输入密码");
      setLoading(false);
      return;
    }

    const success = await login(username.trim(), password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("用户名或密码错误，请重试");
    }
    setLoading(false);
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
          <p className="text-gray-500 mb-6">请输入用户名和密码登录系统</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">测试账号：</p>
                  <p>基层医生: grassroots1 / 123456</p>
                  <p>上级医生: senior1 / 123456</p>
                  <p>科室主任: director1 / 123456</p>
                  <p>医务科: medical1 / 123456</p>
                  <p>管理员: admin / 123456</p>
                </div>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              <LogIn className="w-5 h-5" />
              {loading ? "登录中..." : "登录系统"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Video,
  Mic,
  MessageSquare,
  FileText,
  Image,
  Users,
  Send,
  Clock,
  Save,
} from "lucide-react";
import { mockConsultations } from "@/utils/mockData";
import { formatDateTime, cn } from "@/utils/format";

export function ConsultationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"video" | "records" | "images" | "chat">("video");
  const [message, setMessage] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const consultation = mockConsultations.find((c) => c.id === id);

  if (!consultation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">会诊不存在</p>
      </div>
    );
  }

  const messages = [
    { id: 1, user: "王医生（心内科）", content: "从心电图来看，患者心肌缺血情况较明显", time: "10:02" },
    { id: 2, user: "赵主任（神经内科）", content: "头部CT显示有轻微腔隙性梗塞，需要注意", time: "10:05" },
    { id: 3, user: "您", content: "患者目前血压控制不佳，需要调整用药方案", time: "10:08" },
    { id: 4, user: "刘医生（影像科）", content: "我来上传一下最新的影像资料", time: "10:10" },
  ];

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  const tabs = [
    { key: "video", label: "视频会诊", icon: <Video className="w-4 h-4" /> },
    { key: "records", label: "病历资料", icon: <FileText className="w-4 h-4" /> },
    { key: "images", label: "影像查看", icon: <Image className="w-4 h-4" /> },
    { key: "chat", label: "讨论区", icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/consultation")}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{consultation.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span>患者：{consultation.patientName}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDateTime(consultation.scheduledTime)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {consultation.experts.length} 位专家
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-success-50 text-success-600 rounded-lg text-sm font-medium hover:bg-success-100 transition-colors">
            <Save className="w-4 h-4" />
            保存记录
          </button>
          <button
            onClick={() => navigate("/consultation")}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            结束会诊
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2",
                  activeTab === tab.key
                    ? "text-primary-600 border-primary-500 bg-primary-50/50"
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === "video" && (
              <div className="h-full flex flex-col">
                <div className="flex-1 bg-dark-900 rounded-xl relative overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-12 h-12 text-primary-400" />
                      </div>
                      <p className="text-white font-medium">正在进行多学科会诊</p>
                      <p className="text-gray-400 text-sm mt-1">已连接 {consultation.experts.length} 位专家</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 w-48 h-36 bg-dark-800 rounded-lg border border-white/10 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-white/60 text-sm">
                      您的画面
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={cn(
                      "p-4 rounded-full transition-all",
                      isMuted ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={cn(
                      "p-4 rounded-full transition-all",
                      !isVideoOn ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <Video className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === "records" && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">病历资料</h3>
                {consultation.medicalRecords.map((record, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{record}</p>
                      <p className="text-sm text-gray-500">PDF 文档</p>
                    </div>
                  </div>
                ))}

                <div className="mt-8">
                  <h3 className="font-medium text-gray-800 mb-4">会诊结论</h3>
                  <textarea
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    placeholder="请输入会诊结论和建议..."
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all resize-none"
                    defaultValue={consultation.conclusion}
                  />
                </div>
              </div>
            )}

            {activeTab === "images" && (
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">医学影像</h3>
                <div className="grid grid-cols-2 gap-4">
                  {consultation.images.map((image, i) => (
                    <div
                      key={i}
                      className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      <div className="text-center">
                        <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">{image}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="h-full flex flex-col">
                <div className="flex-1 space-y-4 mb-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[80%]",
                        msg.user === "您" ? "ml-auto" : "mr-auto"
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-3 rounded-2xl",
                          msg.user === "您"
                            ? "bg-primary-500 text-white rounded-br-md"
                            : "bg-gray-100 text-gray-800 rounded-bl-md"
                        )}
                      >
                        <p className="text-xs opacity-75 mb-1">{msg.user}</p>
                        <p>{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 px-2">{msg.time}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="输入消息..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" />
            参与专家
          </h3>
          <div className="space-y-3">
            {consultation.experts.map((expert, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium text-sm">
                  {expert.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm truncate">{expert}</p>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-success-500 rounded-full" />
                    <span className="text-xs text-gray-500">在线</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

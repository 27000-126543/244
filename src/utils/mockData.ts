import type {
  User,
  Hospital,
  ReferralApplication,
  Consultation,
  ExaminationReport,
  Prescription,
  Settlement,
  DashboardStats,
} from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "张医生",
    role: "grassroots_doctor",
    hospital: "朝阳社区卫生服务中心",
    department: "全科",
  },
  {
    id: "2",
    name: "李主任",
    role: "department_director",
    hospital: "朝阳社区卫生服务中心",
    department: "全科",
  },
  {
    id: "3",
    name: "王医生",
    role: "senior_doctor",
    hospital: "市中心医院",
    department: "心内科",
  },
  {
    id: "4",
    name: "赵主任",
    role: "department_director",
    hospital: "市中心医院",
    department: "心内科",
  },
  {
    id: "5",
    name: "刘科长",
    role: "medical_affairs",
    hospital: "医共体管委会",
    department: "医务科",
  },
  {
    id: "6",
    name: "陈管理员",
    role: "admin",
    hospital: "医共体管委会",
    department: "信息中心",
  },
];

export const mockHospitals: Hospital[] = [
  {
    id: "h1",
    name: "市中心医院",
    level: "tertiary",
    address: "人民路123号",
    departments: ["心内科", "神经内科", "骨科", "普外科", "肿瘤科", "影像科", "检验科"],
    bedCapacity: 1200,
    occupiedBeds: 986,
    registrationSlots: 45,
  },
  {
    id: "h2",
    name: "市第二人民医院",
    level: "secondary",
    address: "建设大道456号",
    departments: ["心内科", "神经内科", "骨科", "妇产科", "儿科", "影像科", "检验科"],
    bedCapacity: 800,
    occupiedBeds: 612,
    registrationSlots: 32,
  },
  {
    id: "h3",
    name: "朝阳社区卫生服务中心",
    level: "community",
    address: "朝阳路789号",
    departments: ["全科", "中医科", "预防保健科", "检验科"],
    bedCapacity: 50,
    occupiedBeds: 28,
    registrationSlots: 0,
  },
  {
    id: "h4",
    name: "东风社区卫生服务中心",
    level: "community",
    address: "东风路321号",
    departments: ["全科", "中医科", "康复科", "检验科"],
    bedCapacity: 40,
    occupiedBeds: 22,
    registrationSlots: 0,
  },
  {
    id: "h5",
    name: "市中医院",
    level: "tertiary",
    address: "文化路654号",
    departments: ["中医内科", "针灸科", "骨伤科", "肿瘤科", "影像科", "检验科"],
    bedCapacity: 600,
    occupiedBeds: 478,
    registrationSlots: 28,
  },
];

const diseaseTypes = ["冠心病", "高血压", "糖尿病", "脑梗塞", "骨折", "肺炎", "慢性胃炎", "腰椎间盘突出"];
const patientNames = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十", "郑十一", "王十二"];

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return date;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const mockReferrals: ReferralApplication[] = Array.from({ length: 15 }, (_, i) => {
  const statuses: ReferralApplication["status"][] = [
    "pending_level1",
    "pending_level2",
    "pending_level3",
    "approved",
    "rejected",
  ];
  const status = statuses[i % statuses.length];
  const currentLevel =
    status === "pending_level1" ? 1 : status === "pending_level2" ? 2 : status === "pending_level3" ? 3 : 0;

  return {
    id: generateId(),
    patientName: patientNames[i % patientNames.length],
    patientId: `P${String(i + 1).padStart(6, "0")}`,
    diseaseType: diseaseTypes[i % diseaseTypes.length],
    summary: `患者主诉${diseaseTypes[i % diseaseTypes.length]}相关症状，经初步检查后建议转诊至上级医院进一步诊疗。`,
    reports: ["血常规报告.pdf", "心电图报告.pdf", "CT影像资料"],
    fromHospital: i % 2 === 0 ? "朝阳社区卫生服务中心" : "东风社区卫生服务中心",
    fromDepartment: "全科",
    fromDoctor: "张医生",
    recommendedHospital: i % 3 === 0 ? "市中心医院" : "市第二人民医院",
    recommendedDoctor: i % 2 === 0 ? "王医生" : "李医生",
    estimatedWaitTime: Math.floor(Math.random() * 120) + 30,
    status,
    currentLevel,
    createdAt: randomDate(7),
    lastUpdatedAt: randomDate(2),
    approvalHistory: [
      {
        id: generateId(),
        referralId: generateId(),
        level: 1,
        approver: "李主任",
        role: "科室主任",
        action: status === "rejected" ? "reject" : "approve",
        comment: status === "rejected" ? "资料不完整，请补充检查报告" : "同意转诊",
        createdAt: randomDate(5),
      },
    ],
  };
});

export const mockConsultations: Consultation[] = Array.from({ length: 8 }, (_, i) => {
  const statuses: Consultation["status"][] = ["scheduled", "in_progress", "completed", "scheduled"];
  return {
    id: generateId(),
    title: `${diseaseTypes[i % diseaseTypes.length]}多学科会诊`,
    patientName: patientNames[i % patientNames.length],
    patientId: `P${String(i + 1).padStart(6, "0")}`,
    initiator: "张医生",
    hospital: "朝阳社区卫生服务中心",
    department: "全科",
    experts: ["王医生（心内科）", "赵主任（神经内科）", "刘医生（影像科）"],
    scheduledTime: new Date(Date.now() + (i - 2) * 3600000),
    status: statuses[i % statuses.length],
    medicalRecords: ["病历摘要.pdf", "既往病史.pdf"],
    images: ["头部CT.dcm", "胸部X光.jpg"],
    conclusion: i >= 2 ? "建议保守治疗，定期复查" : undefined,
    createdAt: randomDate(14),
  };
});

const examTypes = ["血液检查", "影像检查", "心电图", "超声检查", "病理检查"];
const examItems = ["血常规", "肝功能", "肾功能", "头颅CT", "胸部X光", "心电图", "腹部B超", "心脏彩超"];

export const mockExaminations: ExaminationReport[] = Array.from({ length: 20 }, (_, i) => ({
  id: generateId(),
  patientId: `P${String((i % 5) + 1).padStart(6, "0")}`,
  patientName: patientNames[i % patientNames.length],
  type: examTypes[i % examTypes.length],
  itemName: examItems[i % examItems.length],
  hospital: i % 3 === 0 ? "朝阳社区卫生服务中心" : i % 3 === 1 ? "市中心医院" : "市第二人民医院",
  department: "检验科",
  doctor: "检验医师",
  result: "各项指标基本正常，建议定期复查。",
  reportDate: randomDate(30),
  isDuplicate: i % 7 === 0,
  originalReportId: i % 7 === 0 ? generateId() : undefined,
}));

const drugNames = ["阿莫西林胶囊", "硝苯地平缓释片", "二甲双胍片", "阿司匹林肠溶片", "辛伐他汀片", "奥美拉唑胶囊"];

export const mockPrescriptions: Prescription[] = Array.from({ length: 12 }, (_, i) => {
  const statuses: Prescription["status"][] = ["pending", "dispensed", "shortage", "completed"];
  return {
    id: generateId(),
    patientName: patientNames[i % patientNames.length],
    patientId: `P${String(i + 1).padStart(6, "0")}`,
    doctor: "张医生",
    hospital: "朝阳社区卫生服务中心",
    department: "全科",
    drugs: [
      {
        id: generateId(),
        name: drugNames[i % drugNames.length],
        specification: "0.25g*24粒",
        dosage: "每日3次，每次2粒",
        quantity: 2,
        price: 25.5,
        stockStatus: i % 4 === 2 ? "out_of_stock" : i % 5 === 0 ? "low" : "sufficient",
      },
      {
        id: generateId(),
        name: drugNames[(i + 1) % drugNames.length],
        specification: "10mg*30片",
        dosage: "每日1次，每次1片",
        quantity: 1,
        price: 45.0,
        stockStatus: "sufficient",
      },
    ],
    status: statuses[i % statuses.length],
    createdAt: randomDate(7),
  };
});

export const mockSettlements: Settlement[] = Array.from({ length: 10 }, (_, i) => ({
  id: generateId(),
  patientId: `P${String(i + 1).padStart(6, "0")}`,
  patientName: patientNames[i % patientNames.length],
  fromHospital: i % 2 === 0 ? "朝阳社区卫生服务中心" : "东风社区卫生服务中心",
  toHospital: i % 2 === 0 ? "市中心医院" : "市第二人民医院",
  totalAmount: Math.floor(Math.random() * 5000) + 1000,
  insuranceCoverage: Math.floor(Math.random() * 3000) + 500,
  patientPayment: Math.floor(Math.random() * 1000) + 200,
  hospitalSplit: [
    {
      hospital: i % 2 === 0 ? "市中心医院" : "市第二人民医院",
      amount: Math.floor(Math.random() * 3000) + 800,
      percentage: 70,
    },
    {
      hospital: i % 2 === 0 ? "朝阳社区卫生服务中心" : "东风社区卫生服务中心",
      amount: Math.floor(Math.random() * 1000) + 200,
      percentage: 30,
    },
  ],
  settlementDate: randomDate(30),
  status: i % 3 === 0 ? "pending" : "completed",
}));

export function generateDashboardStats(): DashboardStats {
  const hospitalNames = mockHospitals.filter((h) => h.level !== "community").map((h) => h.name);
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  });

  return {
    totalReferrals: Math.floor(Math.random() * 500) + 1200,
    todayReferrals: Math.floor(Math.random() * 20) + 5,
    totalConsultations: Math.floor(Math.random() * 200) + 450,
    todayConsultations: Math.floor(Math.random() * 8) + 1,
    bedOccupancyRate: Math.floor(Math.random() * 15) + 75,
    examinationMutualRecognitionRate: Math.floor(Math.random() * 10) + 85,
    drugInventoryTurnover: Math.floor(Math.random() * 5) + 12,
    referralsByHospital: hospitalNames.map((name) => ({
      name,
      value: Math.floor(Math.random() * 200) + 50,
    })),
    consultationsTrend: last7Days.map((date) => ({
      date,
      count: Math.floor(Math.random() * 15) + 3,
    })),
    bedUsageByHospital: mockHospitals
      .filter((h) => h.level !== "community")
      .map((h) => ({
        name: h.name,
        total: h.bedCapacity,
        occupied: h.occupiedBeds,
      })),
  };
}

export function getRecommendedHospitals(diseaseType: string) {
  const diseaseDepartmentMap: Record<string, string> = {
    冠心病: "心内科",
    高血压: "心内科",
    糖尿病: "内分泌科",
    脑梗塞: "神经内科",
    骨折: "骨科",
    肺炎: "呼吸内科",
    慢性胃炎: "消化内科",
    腰椎间盘突出: "骨科",
  };

  const targetDept = diseaseDepartmentMap[diseaseType] || "全科";

  return mockHospitals
    .filter((h) => h.level !== "community")
    .map((h) => {
      const hasDept = h.departments.includes(targetDept);
      const bedAvailability = (h.bedCapacity - h.occupiedBeds) / h.bedCapacity;
      const slotScore = h.registrationSlots / 50;
      const score = (hasDept ? 40 : 10) + bedAvailability * 30 + slotScore * 30;

      return {
        hospital: h,
        doctor: hasDept ? `${targetDept}专家` : "全科医生",
        score: Math.round(score),
        estimatedWaitTime: Math.floor((1 - bedAvailability) * 120) + 30,
        availableSlots: h.registrationSlots,
      };
    })
    .sort((a, b) => b.score - a.score);
}

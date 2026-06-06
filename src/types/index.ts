export type UserRole =
  | "grassroots_doctor"
  | "senior_doctor"
  | "department_director"
  | "medical_affairs"
  | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  hospital: string;
  department: string;
  avatar?: string;
}

export interface Hospital {
  id: string;
  name: string;
  level: "tertiary" | "secondary" | "community";
  address: string;
  departments: string[];
  bedCapacity: number;
  occupiedBeds: number;
  registrationSlots: number;
}

export type ReferralStatus =
  | "draft"
  | "pending_level1"
  | "pending_level2"
  | "pending_level3"
  | "approved"
  | "rejected"
  | "escalated";

export interface ReferralApplication {
  id: string;
  patientName: string;
  patientId: string;
  diseaseType: string;
  summary: string;
  reports: string[];
  fromHospital: string;
  fromDepartment: string;
  fromDoctor: string;
  recommendedHospital?: string;
  recommendedDoctor?: string;
  estimatedWaitTime: number;
  status: ReferralStatus;
  currentLevel: number;
  createdAt: Date;
  lastUpdatedAt: Date;
  approvalHistory: ApprovalRecord[];
}

export interface ApprovalRecord {
  id: string;
  referralId: string;
  level: number;
  approver: string;
  role: string;
  action: "approve" | "reject" | "escalate";
  comment?: string;
  createdAt: Date;
}

export type ConsultationStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Consultation {
  id: string;
  title: string;
  patientName: string;
  patientId: string;
  initiator: string;
  hospital: string;
  department: string;
  experts: string[];
  scheduledTime: Date;
  status: ConsultationStatus;
  medicalRecords: string[];
  images: string[];
  conclusion?: string;
  createdAt: Date;
}

export interface ExaminationReport {
  id: string;
  patientId: string;
  patientName: string;
  type: string;
  itemName: string;
  hospital: string;
  department: string;
  doctor: string;
  result: string;
  reportDate: Date;
  isDuplicate: boolean;
  originalReportId?: string;
}

export type PrescriptionStatus = "pending" | "dispensed" | "shortage" | "completed";

export interface Prescription {
  id: string;
  patientName: string;
  patientId: string;
  doctor: string;
  hospital: string;
  department: string;
  drugs: PrescriptionDrug[];
  status: PrescriptionStatus;
  createdAt: Date;
}

export type StockStatus = "sufficient" | "low" | "out_of_stock";

export interface PrescriptionDrug {
  id: string;
  name: string;
  specification: string;
  dosage: string;
  quantity: number;
  price: number;
  stockStatus: StockStatus;
}

export type SettlementStatus = "pending" | "completed";

export interface Settlement {
  id: string;
  patientId: string;
  patientName: string;
  fromHospital: string;
  toHospital: string;
  totalAmount: number;
  insuranceCoverage: number;
  patientPayment: number;
  hospitalSplit: HospitalSplit[];
  settlementDate: Date;
  status: SettlementStatus;
}

export interface HospitalSplit {
  hospital: string;
  amount: number;
  percentage: number;
}

export interface DashboardStats {
  totalReferrals: number;
  todayReferrals: number;
  totalConsultations: number;
  todayConsultations: number;
  bedOccupancyRate: number;
  examinationMutualRecognitionRate: number;
  drugInventoryTurnover: number;
  referralsByHospital: { name: string; value: number }[];
  consultationsTrend: { date: string; count: number }[];
  bedUsageByHospital: { name: string; total: number; occupied: number }[];
}

export interface RecommendedHospital {
  hospital: Hospital;
  doctor: string;
  score: number;
  estimatedWaitTime: number;
  availableSlots: number;
}

export const roleLabels: Record<UserRole, string> = {
  grassroots_doctor: "基层医生",
  senior_doctor: "上级医生",
  department_director: "科室主任",
  medical_affairs: "医务科",
  admin: "管委会管理员",
};

export const referralStatusLabels: Record<ReferralStatus, string> = {
  draft: "草稿",
  pending_level1: "待一级审批",
  pending_level2: "待二级审批",
  pending_level3: "待三级审批",
  approved: "已通过",
  rejected: "已拒绝",
  escalated: "已升级",
};

export const consultationStatusLabels: Record<ConsultationStatus, string> = {
  scheduled: "已预约",
  in_progress: "进行中",
  completed: "已完成",
  cancelled: "已取消",
};

export const prescriptionStatusLabels: Record<PrescriptionStatus, string> = {
  pending: "待调配",
  dispensed: "已调配",
  shortage: "缺药",
  completed: "已完成",
};

export const stockStatusLabels: Record<StockStatus, string> = {
  sufficient: "库存充足",
  low: "库存紧张",
  out_of_stock: "缺货",
};

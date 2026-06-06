import db from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

console.log('开始初始化数据库...');

db.exec(`
  CREATE TABLE IF NOT EXISTS hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    level TEXT,
    address TEXT,
    phone TEXT,
    total_beds INTEGER DEFAULT 0,
    available_beds INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hospital_id TEXT NOT NULL,
    disease_types TEXT,
    total_registration INTEGER DEFAULT 0,
    available_registration INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    hospital_id TEXT,
    department_id TEXT
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT,
    age INTEGER,
    id_card TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    patient_gender TEXT,
    patient_age INTEGER,
    disease_type TEXT,
    disease_summary TEXT,
    from_hospital_id TEXT,
    from_hospital_name TEXT,
    from_department_id TEXT,
    from_department_name TEXT,
    from_doctor_id TEXT,
    from_doctor_name TEXT,
    to_hospital_id TEXT,
    to_hospital_name TEXT,
    to_department_id TEXT,
    to_department_name TEXT,
    to_doctor_id TEXT,
    to_doctor_name TEXT,
    estimated_wait_time INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    is_escalated INTEGER DEFAULT 0,
    approval_level_1_by TEXT,
    approval_level_1_at DATETIME,
    approval_level_1_comment TEXT,
    approval_level_2_by TEXT,
    approval_level_2_at DATETIME,
    approval_level_2_comment TEXT,
    approval_level_3_by TEXT,
    approval_level_3_at DATETIME,
    approval_level_3_comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS referral_attachments (
    id TEXT PRIMARY KEY,
    referral_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS consultations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    patient_id TEXT,
    patient_name TEXT,
    hospital_id TEXT,
    hospital_name TEXT,
    department_id TEXT,
    department_name TEXT,
    status TEXT DEFAULT 'scheduled',
    scheduled_at DATETIME,
    started_at DATETIME,
    ended_at DATETIME,
    summary TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS consultation_experts (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS consultation_messages (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS examinations (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT,
    hospital_id TEXT,
    hospital_name TEXT,
    department_id TEXT,
    department_name TEXT,
    doctor_id TEXT,
    doctor_name TEXT,
    examination_type TEXT,
    examination_name TEXT,
    examination_date DATE,
    result TEXT,
    is_duplicate INTEGER DEFAULT 0,
    is_mutual_recognition INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS drugs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    generic_name TEXT,
    specification TEXT,
    manufacturer TEXT,
    unit TEXT,
    price REAL DEFAULT 0,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 10
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    patient_name TEXT,
    hospital_id TEXT,
    hospital_name TEXT,
    department_id TEXT,
    department_name TEXT,
    doctor_id TEXT,
    doctor_name TEXT,
    status TEXT DEFAULT 'pending',
    total_amount REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prescription_items (
    id TEXT PRIMARY KEY,
    prescription_id TEXT NOT NULL,
    drug_id TEXT NOT NULL,
    drug_name TEXT,
    specification TEXT,
    quantity INTEGER DEFAULT 1,
    unit_price REAL DEFAULT 0,
    subtotal REAL DEFAULT 0,
    dosage TEXT
  );

  CREATE TABLE IF NOT EXISTS stock_alerts (
    id TEXT PRIMARY KEY,
    drug_id TEXT NOT NULL,
    drug_name TEXT,
    current_stock INTEGER,
    min_stock INTEGER,
    status TEXT DEFAULT 'pending',
    notified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settlements (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    patient_name TEXT,
    referral_id TEXT,
    from_hospital_id TEXT,
    from_hospital_name TEXT,
    to_hospital_id TEXT,
    to_hospital_name TEXT,
    total_amount REAL DEFAULT 0,
    insurance_amount REAL DEFAULT 0,
    patient_pay_amount REAL DEFAULT 0,
    from_hospital_share REAL DEFAULT 0,
    to_hospital_share REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    settlement_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settlement_items (
    id TEXT PRIMARY KEY,
    settlement_id TEXT NOT NULL,
    item_type TEXT,
    item_name TEXT,
    amount REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    related_id TEXT,
    related_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('数据库表创建完成！');

const hospitalCount = db.prepare('SELECT COUNT(*) as count FROM hospitals').get().count;
if (hospitalCount === 0) {
  const hospitals = [
    { id: 'h1', name: '市中心医院', level: '三级甲等', address: '市中心区医疗大道1号', phone: '010-88880001', total_beds: 1200, available_beds: 356 },
    { id: 'h2', name: '市第一人民医院', level: '三级甲等', address: '东城区健康路88号', phone: '010-88880002', total_beds: 1000, available_beds: 243 },
    { id: 'h3', name: '市中医院', level: '三级乙等', address: '西城区中医街15号', phone: '010-88880003', total_beds: 600, available_beds: 187 },
    { id: 'h4', name: '城西社区卫生服务中心', level: '社区', address: '西城区社区路2号', phone: '010-88880004', total_beds: 50, available_beds: 12 },
    { id: 'h5', name: '城东社区卫生服务中心', level: '社区', address: '东城区幸福街10号', phone: '010-88880005', total_beds: 50, available_beds: 18 },
  ];

  const insertHospital = db.prepare('INSERT INTO hospitals (id, name, level, address, phone, total_beds, available_beds) VALUES (?, ?, ?, ?, ?, ?, ?)');
  hospitals.forEach(h => insertHospital.run(h.id, h.name, h.level, h.address, h.phone, h.total_beds, h.available_beds));
  console.log('医院数据初始化完成！');
}

const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get().count;
if (deptCount === 0) {
  const departments = [
    { id: 'd1', name: '心内科', hospital_id: 'h1', disease_types: '冠心病,高血压,心律失常,心力衰竭', total_registration: 50, available_registration: 15 },
    { id: 'd2', name: '神经内科', hospital_id: 'h1', disease_types: '脑卒中,癫痫,帕金森病,头痛', total_registration: 45, available_registration: 12 },
    { id: 'd3', name: '骨科', hospital_id: 'h1', disease_types: '骨折,关节疾病,脊柱疾病,运动损伤', total_registration: 40, available_registration: 8 },
    { id: 'd4', name: '心内科', hospital_id: 'h2', disease_types: '冠心病,高血压,心律失常,心力衰竭', total_registration: 40, available_registration: 10 },
    { id: 'd5', name: '神经内科', hospital_id: 'h2', disease_types: '脑卒中,癫痫,帕金森病,头痛', total_registration: 35, available_registration: 18 },
    { id: 'd6', name: '内分泌科', hospital_id: 'h2', disease_types: '糖尿病,甲状腺疾病,代谢综合征', total_registration: 30, available_registration: 5 },
    { id: 'd7', name: '中医内科', hospital_id: 'h3', disease_types: '糖尿病,高血压,慢性病调理', total_registration: 25, available_registration: 10 },
    { id: 'd8', name: '针灸科', hospital_id: 'h3', disease_types: '颈肩腰腿痛,神经系统疾病', total_registration: 20, available_registration: 8 },
    { id: 'd9', name: '全科', hospital_id: 'h4', disease_types: '常见病,多发病,慢性病管理', total_registration: 30, available_registration: 20 },
    { id: 'd10', name: '全科', hospital_id: 'h5', disease_types: '常见病,多发病,慢性病管理', total_registration: 30, available_registration: 22 },
  ];

  const insertDept = db.prepare('INSERT INTO departments (id, name, hospital_id, disease_types, total_registration, available_registration) VALUES (?, ?, ?, ?, ?, ?)');
  departments.forEach(d => insertDept.run(d.id, d.name, d.hospital_id, d.disease_types, d.total_registration, d.available_registration));
  console.log('科室数据初始化完成！');
}

const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const passwordHash = bcrypt.hashSync('123456', 10);
  const users = [
    { id: 'u1', username: 'grassroots1', password: passwordHash, name: '张医生', role: 'grassroots_doctor', phone: '13800000001', hospital_id: 'h4', department_id: 'd9' },
    { id: 'u2', username: 'grassroots2', password: passwordHash, name: '李医生', role: 'grassroots_doctor', phone: '13800000002', hospital_id: 'h5', department_id: 'd10' },
    { id: 'u3', username: 'senior1', password: passwordHash, name: '王主任', role: 'senior_doctor', phone: '13800000003', hospital_id: 'h1', department_id: 'd1' },
    { id: 'u4', username: 'senior2', password: passwordHash, name: '赵主任', role: 'senior_doctor', phone: '13800000004', hospital_id: 'h2', department_id: 'd4' },
    { id: 'u5', username: 'director1', password: passwordHash, name: '陈主任', role: 'department_director', phone: '13800000005', hospital_id: 'h4', department_id: 'd9' },
    { id: 'u6', username: 'director2', password: passwordHash, name: '刘主任', role: 'department_director', phone: '13800000006', hospital_id: 'h1', department_id: 'd1' },
    { id: 'u7', username: 'medical1', password: passwordHash, name: '医务科周', role: 'medical_affairs', phone: '13800000007', hospital_id: 'h1', department_id: null },
    { id: 'u8', username: 'admin', password: passwordHash, name: '管理员', role: 'admin', phone: '13800000008', hospital_id: null, department_id: null },
  ];

  const insertUser = db.prepare('INSERT INTO users (id, username, password, name, role, phone, hospital_id, department_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  users.forEach(u => insertUser.run(u.id, u.username, u.password, u.name, u.role, u.phone, u.hospital_id, u.department_id));
  console.log('用户数据初始化完成！默认密码: 123456');
}

const patientCount = db.prepare('SELECT COUNT(*) as count FROM patients').get().count;
if (patientCount === 0) {
  const patients = [
    { id: 'p1', name: '张三', gender: '男', age: 65, id_card: '110101196001010001', phone: '13900000001', address: '西城区幸福小区1号楼' },
    { id: 'p2', name: '李四', gender: '女', age: 58, id_card: '110101196701010002', phone: '13900000002', address: '东城区阳光花园2号楼' },
    { id: 'p3', name: '王五', gender: '男', age: 72, id_card: '110101195301010003', phone: '13900000003', address: '市中心区和平街3号楼' },
    { id: 'p4', name: '赵六', gender: '女', age: 45, id_card: '110101198001010004', phone: '13900000004', address: '西城区建设路4号楼' },
    { id: 'p5', name: '孙七', gender: '男', age: 55, id_card: '110101197001010005', phone: '13900000005', address: '东城区人民路5号楼' },
  ];

  const insertPatient = db.prepare('INSERT INTO patients (id, name, gender, age, id_card, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)');
  patients.forEach(p => insertPatient.run(p.id, p.name, p.gender, p.age, p.id_card, p.phone, p.address));
  console.log('患者数据初始化完成！');
}

const referralCount = db.prepare('SELECT COUNT(*) as count FROM referrals').get().count;
if (referralCount === 0) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const yesterday = new Date(Date.now() - 86400000).toISOString().replace('T', ' ').substring(0, 19);
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().replace('T', ' ').substring(0, 19);
  
  const referrals = [
    {
      id: 'r1', patient_id: 'p1', patient_name: '张三', patient_gender: '男', patient_age: 65,
      disease_type: '冠心病', disease_summary: '反复胸闷3天，加重1天，心电图提示心肌缺血',
      from_hospital_id: 'h4', from_hospital_name: '城西社区卫生服务中心', from_department_id: 'd9', from_department_name: '全科',
      from_doctor_id: 'u1', from_doctor_name: '张医生',
      to_hospital_id: 'h1', to_hospital_name: '市中心医院', to_department_id: 'd1', to_department_name: '心内科',
      to_doctor_id: 'u3', to_doctor_name: '王主任',
      estimated_wait_time: 30, current_level: 1, status: 'pending', is_escalated: 0,
      created_at: yesterday
    },
    {
      id: 'r2', patient_id: 'p2', patient_name: '李四', patient_gender: '女', patient_age: 58,
      disease_type: '糖尿病', disease_summary: '血糖控制不佳，伴头晕乏力',
      from_hospital_id: 'h4', from_hospital_name: '城西社区卫生服务中心', from_department_id: 'd9', from_department_name: '全科',
      from_doctor_id: 'u1', from_doctor_name: '张医生',
      to_hospital_id: 'h2', to_hospital_name: '市第一人民医院', to_department_id: 'd6', to_department_name: '内分泌科',
      to_doctor_id: 'u4', to_doctor_name: '赵主任',
      estimated_wait_time: 45, current_level: 2, status: 'approving', is_escalated: 0,
      approval_level_1_by: '陈主任', approval_level_1_at: yesterday, approval_level_1_comment: '同意转诊，建议进一步检查',
      created_at: twoDaysAgo
    },
    {
      id: 'r3', patient_id: 'p3', patient_name: '王五', patient_gender: '男', patient_age: 72,
      disease_type: '脑卒中', disease_summary: '突发左侧肢体无力2小时，CT提示脑梗死',
      from_hospital_id: 'h5', from_hospital_name: '城东社区卫生服务中心', from_department_id: 'd10', from_department_name: '全科',
      from_doctor_id: 'u2', from_doctor_name: '李医生',
      to_hospital_id: 'h1', to_hospital_name: '市中心医院', to_department_id: 'd2', to_department_name: '神经内科',
      to_doctor_id: 'u3', to_doctor_name: '王主任',
      estimated_wait_time: 15, current_level: 3, status: 'approved', is_escalated: 0,
      approval_level_1_by: '陈主任', approval_level_1_at: twoDaysAgo, approval_level_1_comment: '紧急情况，同意转诊',
      approval_level_2_by: '刘主任', approval_level_2_at: twoDaysAgo, approval_level_2_comment: '已安排床位，立即转诊',
      approval_level_3_by: '医务科周', approval_level_3_at: twoDaysAgo, approval_level_3_comment: '已备案，请做好接诊准备',
      created_at: twoDaysAgo
    },
  ];

  const insertReferral = db.prepare(`
    INSERT INTO referrals 
    (id, patient_id, patient_name, patient_gender, patient_age, disease_type, disease_summary,
     from_hospital_id, from_hospital_name, from_department_id, from_department_name,
     from_doctor_id, from_doctor_name, to_hospital_id, to_hospital_name, to_department_id,
     to_department_name, to_doctor_id, to_doctor_name, estimated_wait_time, current_level, status, is_escalated,
     approval_level_1_by, approval_level_1_at, approval_level_1_comment,
     approval_level_2_by, approval_level_2_at, approval_level_2_comment,
     approval_level_3_by, approval_level_3_at, approval_level_3_comment,
     created_at, updated_at)
    VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  referrals.forEach(r => insertReferral.run(
    r.id, r.patient_id, r.patient_name, r.patient_gender, r.patient_age, r.disease_type, r.disease_summary,
    r.from_hospital_id, r.from_hospital_name, r.from_department_id, r.from_department_name,
    r.from_doctor_id, r.from_doctor_name, r.to_hospital_id, r.to_hospital_name, r.to_department_id,
    r.to_department_name, r.to_doctor_id, r.to_doctor_name, r.estimated_wait_time, r.current_level, r.status, r.is_escalated,
    r.approval_level_1_by, r.approval_level_1_at, r.approval_level_1_comment,
    r.approval_level_2_by, r.approval_level_2_at, r.approval_level_2_comment,
    r.approval_level_3_by, r.approval_level_3_at, r.approval_level_3_comment,
    r.created_at, r.created_at
  ));
  console.log('转诊数据初始化完成！');
}

const drugCount = db.prepare('SELECT COUNT(*) as count FROM drugs').get().count;
if (drugCount === 0) {
  const drugs = [
    { id: 'm1', name: '阿司匹林肠溶片', generic_name: '阿司匹林', specification: '100mg*30片', manufacturer: '拜耳医药', unit: '盒', price: 25.8, stock: 150, min_stock: 50 },
    { id: 'm2', name: '硫酸氢氯吡格雷片', generic_name: '氯吡格雷', specification: '75mg*7片', manufacturer: '赛诺菲', unit: '盒', price: 108.5, stock: 45, min_stock: 30 },
    { id: 'm3', name: '硝苯地平控释片', generic_name: '硝苯地平', specification: '30mg*7片', manufacturer: '拜耳医药', unit: '盒', price: 45.2, stock: 80, min_stock: 40 },
    { id: 'm4', name: '二甲双胍缓释片', generic_name: '二甲双胍', specification: '0.5g*30片', manufacturer: '中美上海施贵宝', unit: '盒', price: 32.6, stock: 8, min_stock: 50 },
    { id: 'm5', name: '阿托伐他汀钙片', generic_name: '阿托伐他汀', specification: '20mg*7片', manufacturer: '辉瑞制药', unit: '盒', price: 68.9, stock: 60, min_stock: 30 },
    { id: 'm6', name: '头孢克肟胶囊', generic_name: '头孢克肟', specification: '0.1g*6粒', manufacturer: '白云山制药', unit: '盒', price: 28.5, stock: 5, min_stock: 20 },
    { id: 'm7', name: '布洛芬缓释胶囊', generic_name: '布洛芬', specification: '0.3g*20粒', manufacturer: '中美史克', unit: '盒', price: 18.8, stock: 120, min_stock: 40 },
    { id: 'm8', name: '奥美拉唑肠溶胶囊', generic_name: '奥美拉唑', specification: '20mg*14粒', manufacturer: '阿斯利康', unit: '盒', price: 56.3, stock: 35, min_stock: 20 },
  ];

  const insertDrug = db.prepare('INSERT INTO drugs (id, name, generic_name, specification, manufacturer, unit, price, stock, min_stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  drugs.forEach(d => insertDrug.run(d.id, d.name, d.generic_name, d.specification, d.manufacturer, d.unit, d.price, d.stock, d.min_stock));
  console.log('药品数据初始化完成！');
}

const examCount = db.prepare('SELECT COUNT(*) as count FROM examinations').get().count;
if (examCount === 0) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 604800000).toISOString().split('T')[0];
  const oneMonthAgo = new Date(Date.now() - 2592000000).toISOString().split('T')[0];
  
  const examinations = [
    { id: 'e1', patient_id: 'p1', patient_name: '张三', hospital_id: 'h4', hospital_name: '城西社区卫生服务中心', department_id: 'd9', department_name: '全科', doctor_id: 'u1', doctor_name: '张医生', examination_type: '心电图', examination_name: '常规心电图检查', examination_date: yesterday, result: '窦性心律，ST段压低', is_duplicate: 0, is_mutual_recognition: 1 },
    { id: 'e2', patient_id: 'p1', patient_name: '张三', hospital_id: 'h1', hospital_name: '市中心医院', department_id: 'd1', department_name: '心内科', doctor_id: 'u3', doctor_name: '王主任', examination_type: '心电图', examination_name: '常规心电图检查', examination_date: today, result: '窦性心律，ST段压低', is_duplicate: 1, is_mutual_recognition: 1 },
    { id: 'e3', patient_id: 'p1', patient_name: '张三', hospital_id: 'h1', hospital_name: '市中心医院', department_id: 'd1', department_name: '心内科', doctor_id: 'u3', doctor_name: '王主任', examination_type: '血液检查', examination_name: '心肌酶谱', examination_date: today, result: '肌钙蛋白轻度升高', is_duplicate: 0, is_mutual_recognition: 1 },
    { id: 'e4', patient_id: 'p2', patient_name: '李四', hospital_id: 'h4', hospital_name: '城西社区卫生服务中心', department_id: 'd9', department_name: '全科', doctor_id: 'u1', doctor_name: '张医生', examination_type: '血糖', examination_name: '空腹血糖', examination_date: oneWeekAgo, result: '8.5mmol/L', is_duplicate: 0, is_mutual_recognition: 1 },
    { id: 'e5', patient_id: 'p3', patient_name: '王五', hospital_id: 'h1', hospital_name: '市中心医院', department_id: 'd2', department_name: '神经内科', doctor_id: 'u3', doctor_name: '王主任', examination_type: 'CT', examination_name: '头颅CT平扫', examination_date: twoDaysAgo, result: '右侧基底节区脑梗死', is_duplicate: 0, is_mutual_recognition: 1 },
  ];

  const insertExam = db.prepare('INSERT INTO examinations (id, patient_id, patient_name, hospital_id, hospital_name, department_id, department_name, doctor_id, doctor_name, examination_type, examination_name, examination_date, result, is_duplicate, is_mutual_recognition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  examinations.forEach(e => insertExam.run(e.id, e.patient_id, e.patient_name, e.hospital_id, e.hospital_name, e.department_id, e.department_name, e.doctor_id, e.doctor_name, e.examination_type, e.examination_name, e.examination_date, e.result, e.is_duplicate, e.is_mutual_recognition));
  console.log('检查数据初始化完成！');
}

const consultationCount = db.prepare('SELECT COUNT(*) as count FROM consultations').get().count;
if (consultationCount === 0) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().replace('T', ' ').substring(0, 19);
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().replace('T', ' ').substring(0, 19);
  
  const consultations = [
    {
      id: 'c1', title: '冠心病多学科会诊', patient_id: 'p1', patient_name: '张三',
      hospital_id: 'h1', hospital_name: '市中心医院', department_id: 'd1', department_name: '心内科',
      status: 'scheduled', scheduled_at: tomorrow, created_by: 'u3'
    },
    {
      id: 'c2', title: '脑梗死病例讨论', patient_id: 'p3', patient_name: '王五',
      hospital_id: 'h1', hospital_name: '市中心医院', department_id: 'd2', department_name: '神经内科',
      status: 'completed', scheduled_at: twoDaysAgo, started_at: twoDaysAgo, ended_at: twoDaysAgo,
      summary: '患者诊断明确，建议继续抗凝、改善循环治疗，定期复查',
      created_by: 'u3'
    },
  ];

  const insertConsult = db.prepare('INSERT INTO consultations (id, title, patient_id, patient_name, hospital_id, hospital_name, department_id, department_name, status, scheduled_at, started_at, ended_at, summary, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  consultations.forEach(c => insertConsult.run(c.id, c.title, c.patient_id, c.patient_name, c.hospital_id, c.hospital_name, c.department_id, c.department_name, c.status, c.scheduled_at, c.started_at, c.ended_at, c.summary, c.created_by, c.created_at || now));
  console.log('会诊数据初始化完成！');
}

const prescriptionCount = db.prepare('SELECT COUNT(*) as count FROM prescriptions').get().count;
if (prescriptionCount === 0) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  const prescriptions = [
    { id: 'rx1', patient_id: 'p1', patient_name: '张三', hospital_id: 'h1', hospital_name: '市中心医院', department_id: 'd1', department_name: '心内科', doctor_id: 'u3', doctor_name: '王主任', status: 'completed', total_amount: 168.5 },
    { id: 'rx2', patient_id: 'p2', patient_name: '李四', hospital_id: 'h4', hospital_name: '城西社区卫生服务中心', department_id: 'd9', department_name: '全科', doctor_id: 'u1', doctor_name: '张医生', status: 'pending', total_amount: 58.1 },
  ];

  const insertRx = db.prepare('INSERT INTO prescriptions (id, patient_id, patient_name, hospital_id, hospital_name, department_id, department_name, doctor_id, doctor_name, status, total_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  prescriptions.forEach(r => insertRx.run(r.id, r.patient_id, r.patient_name, r.hospital_id, r.hospital_name, r.department_id, r.department_name, r.doctor_id, r.doctor_name, r.status, r.total_amount, now));

  const prescriptionItems = [
    { id: 'rxi1', prescription_id: 'rx1', drug_id: 'm1', drug_name: '阿司匹林肠溶片', specification: '100mg*30片', quantity: 2, unit_price: 25.8, subtotal: 51.6, dosage: '每日1次，每次1片' },
    { id: 'rxi2', prescription_id: 'rx1', drug_id: 'm2', drug_name: '硫酸氢氯吡格雷片', specification: '75mg*7片', quantity: 1, unit_price: 108.5, subtotal: 108.5, dosage: '每日1次，每次1片' },
    { id: 'rxi3', prescription_id: 'rx1', drug_id: 'm5', drug_name: '阿托伐他汀钙片', specification: '20mg*7片', quantity: 1, unit_price: 68.9, subtotal: 68.9, dosage: '每晚1次，每次1片' },
    { id: 'rxi4', prescription_id: 'rx2', drug_id: 'm4', drug_name: '二甲双胍缓释片', specification: '0.5g*30片', quantity: 1, unit_price: 32.6, subtotal: 32.6, dosage: '每日2次，每次1片' },
    { id: 'rxi5', prescription_id: 'rx2', drug_id: 'm8', drug_name: '奥美拉唑肠溶胶囊', specification: '20mg*14粒', quantity: 1, unit_price: 25.5, subtotal: 25.5, dosage: '每日1次，每次1粒' },
  ];

  const insertRxItem = db.prepare('INSERT INTO prescription_items (id, prescription_id, drug_id, drug_name, specification, quantity, unit_price, subtotal, dosage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  prescriptionItems.forEach(i => insertRxItem.run(i.id, i.prescription_id, i.drug_id, i.drug_name, i.specification, i.quantity, i.unit_price, i.subtotal, i.dosage));
  console.log('处方数据初始化完成！');
  console.log('处方明细数据初始化完成！');
}

const alertCount = db.prepare('SELECT COUNT(*) as count FROM stock_alerts').get().count;
if (alertCount === 0) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const alerts = [
    { id: 'a1', drug_id: 'm4', drug_name: '二甲双胍缓释片', current_stock: 8, min_stock: 50, status: 'pending', notified: 1, created_at: now },
    { id: 'a2', drug_id: 'm6', drug_name: '头孢克肟胶囊', current_stock: 5, min_stock: 20, status: 'pending', notified: 1, created_at: now },
  ];

  const insertAlert = db.prepare('INSERT INTO stock_alerts (id, drug_id, drug_name, current_stock, min_stock, status, notified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  alerts.forEach(a => insertAlert.run(a.id, a.drug_id, a.drug_name, a.current_stock, a.min_stock, a.status, a.notified, a.created_at));
  console.log('库存预警数据初始化完成！');
}

const settlementCount = db.prepare('SELECT COUNT(*) as count FROM settlements').get().count;
if (settlementCount === 0) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const settlements = [
    {
      id: 's1', patient_id: 'p3', patient_name: '王五', referral_id: 'r3',
      from_hospital_id: 'h5', from_hospital_name: '城东社区卫生服务中心',
      to_hospital_id: 'h1', to_hospital_name: '市中心医院',
      total_amount: 5800, insurance_amount: 4060, patient_pay_amount: 1740,
      from_hospital_share: 406, to_hospital_share: 2030,
      status: 'completed', settlement_date: yesterday
    },
    {
      id: 's2', patient_id: 'p1', patient_name: '张三', referral_id: 'r1',
      from_hospital_id: 'h4', from_hospital_name: '城西社区卫生服务中心',
      to_hospital_id: 'h1', to_hospital_name: '市中心医院',
      total_amount: 3200, insurance_amount: 2240, patient_pay_amount: 960,
      from_hospital_share: 224, to_hospital_share: 1120,
      status: 'pending', settlement_date: yesterday
    },
  ];

  const insertSettlement = db.prepare('INSERT INTO settlements (id, patient_id, patient_name, referral_id, from_hospital_id, from_hospital_name, to_hospital_id, to_hospital_name, total_amount, insurance_amount, patient_pay_amount, from_hospital_share, to_hospital_share, status, settlement_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  settlements.forEach(s => insertSettlement.run(s.id, s.patient_id, s.patient_name, s.referral_id, s.from_hospital_id, s.from_hospital_name, s.to_hospital_id, s.to_hospital_name, s.total_amount, s.insurance_amount, s.patient_pay_amount, s.from_hospital_share, s.to_hospital_share, s.status, s.settlement_date, now));
  console.log('结算数据初始化完成！');
}

console.log('\n✅ 数据库初始化完成！\n');
console.log('📋 测试账号：');
console.log('   基层医生: grassroots1 / 123456');
console.log('   上级医生: senior1 / 123456');
console.log('   科室主任: director1 / 123456');
console.log('   医务科:   medical1 / 123456');
console.log('   管理员:   admin / 123456');

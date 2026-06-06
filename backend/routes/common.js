import express from 'express';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

function getHospitalName(hospitalId) {
  const hospital = db.prepare('SELECT * FROM hospitals WHERE id = ?').get(hospitalId);
  return hospital ? hospital.name : '';
}

function getHospitalById(id) {
  return db.prepare('SELECT * FROM hospitals WHERE id = ?').get(id);
}

router.get('/hospitals', authMiddleware, (req, res) => {
  const { level } = req.query;
  
  let hospitals = db.prepare('SELECT * FROM hospitals').all();
  
  if (level) {
    hospitals = hospitals.filter(h => h.level === level);
  }

  hospitals.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ data: hospitals });
});

router.get('/hospitals/:id/departments', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  let departments = db.prepare('SELECT * FROM departments WHERE hospital_id = ?').all(id);
  const hospitalName = getHospitalName(id);
  
  departments = departments.map(d => ({ ...d, hospital_name: hospitalName }));
  departments.sort((a, b) => a.name.localeCompare(b.name));

  res.json({ data: departments });
});

router.get('/departments', authMiddleware, (req, res) => {
  const { hospital_id } = req.query;
  
  let departments = db.prepare('SELECT * FROM departments').all();
  
  if (hospital_id) {
    departments = departments.filter(d => d.hospital_id === hospital_id);
  }

  departments = departments.map(d => ({ ...d, hospital_name: getHospitalName(d.hospital_id) }));
  departments.sort((a, b) => a.name.localeCompare(b.name));

  res.json({ data: departments });
});

function getDepartmentName(deptId) {
  const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(deptId);
  return dept ? dept.name : '';
}

router.get('/doctors', authMiddleware, (req, res) => {
  const { hospital_id, department_id, role } = req.query;
  
  let doctors = db.prepare('SELECT * FROM users').all();
  
  const doctorRoles = ['grassroots_doctor', 'senior_doctor', 'department_director'];
  doctors = doctors.filter(u => doctorRoles.includes(u.role));

  if (hospital_id) {
    doctors = doctors.filter(u => u.hospital_id === hospital_id);
  }

  if (department_id) {
    doctors = doctors.filter(u => u.department_id === department_id);
  }

  if (role) {
    doctors = doctors.filter(u => u.role === role);
  }

  doctors = doctors.map(u => ({
    id: u.id,
    name: u.name,
    role: u.role,
    phone: u.phone,
    hospital_id: u.hospital_id,
    department_id: u.department_id,
    hospital_name: getHospitalName(u.hospital_id),
    department_name: getDepartmentName(u.department_id)
  }));

  doctors.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ data: doctors });
});

router.get('/patients', authMiddleware, (req, res) => {
  const { keyword } = req.query;
  
  let patients = db.prepare('SELECT * FROM patients').all();
  
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    patients = patients.filter(p => 
      (p.name && p.name.toLowerCase().includes(lowerKeyword)) ||
      (p.id_card && p.id_card.toLowerCase().includes(lowerKeyword)) ||
      (p.phone && p.phone.toLowerCase().includes(lowerKeyword))
    );
  }

  patients.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ data: patients });
});

router.get('/notifications', authMiddleware, (req, res) => {
  const { is_read } = req.query;
  const userId = req.user.id;
  
  let notifications = db.prepare('SELECT * FROM notifications').all();
  notifications = notifications.filter(n => n.user_id === userId);

  if (is_read !== undefined) {
    const readVal = is_read === 'true' ? 1 : 0;
    notifications = notifications.filter(n => n.is_read === readVal);
  }

  notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  notifications = notifications.slice(0, 50);

  const allNotifications = db.prepare('SELECT * FROM notifications').all();
  const unreadCount = allNotifications.filter(n => n.user_id === userId && n.is_read === 0).length;

  res.json({ 
    data: notifications,
    unread_count: unreadCount
  });
});

router.post('/notifications/:id/read', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
  
  res.json({ message: '已标记为已读' });
});

router.post('/notifications/read-all', authMiddleware, (req, res) => {
  const userId = req.user.id;
  
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
  
  res.json({ message: '已全部标记为已读' });
});

export default router;

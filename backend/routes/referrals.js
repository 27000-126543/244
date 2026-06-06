import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import db from '../database/db.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();

function checkAndEscalateReferrals() {
  const now = dayjs();
  const pendingReferrals = db.prepare(`
    SELECT * FROM referrals 
    WHERE status IN ('pending', 'approving') 
    AND is_escalated = 0
  `).all();

  const updateEscalate = db.prepare(`
    UPDATE referrals 
    SET is_escalated = 1, updated_at = datetime('now', 'localtime')
    WHERE id = ?
  `);

  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, title, content, type, related_id, related_type)
    VALUES (?, ?, ?, ?, 'warning', ?, 'referral')
  `);

  pendingReferrals.forEach(referral => {
    const createdAt = dayjs(referral.created_at);
    const hoursDiff = now.diff(createdAt, 'hour');

    if (hoursDiff >= 24) {
      updateEscalate.run(referral.id);
      
      const medicalUsers = db.prepare(`
        SELECT id FROM users WHERE role = 'medical_affairs'
      `).all();
      
      medicalUsers.forEach(user => {
        insertNotification.run(
          uuidv4(),
          user.id,
          '转诊审批超时升级',
          `转诊申请（患者：${referral.patient_name}）已超过24小时未处理，已自动升级`,
          referral.id
        );
      });
    }
  });
}

router.get('/', authMiddleware, (req, res) => {
  checkAndEscalateReferrals();
  
  const { status, hospital_id, disease_type, page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;

  let referrals = db.prepare('SELECT * FROM referrals').all();

  if (status) {
    referrals = referrals.filter(r => r.status === status);
  }

  if (hospital_id) {
    referrals = referrals.filter(r => r.from_hospital_id === hospital_id || r.to_hospital_id === hospital_id);
  }

  if (disease_type) {
    const lowerDisease = disease_type.toLowerCase();
    referrals = referrals.filter(r => 
      r.disease_type && r.disease_type.toLowerCase().includes(lowerDisease)
    );
  }

  referrals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const total = referrals.length;
  const paginatedReferrals = referrals.slice(offset, offset + parseInt(pageSize));

  res.json({
    data: paginatedReferrals,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
});

router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const referral = db.prepare('SELECT * FROM referrals WHERE id = ?').get(id);

  if (!referral) {
    return res.status(404).json({ message: '转诊申请不存在' });
  }

  const attachments = db.prepare('SELECT * FROM referral_attachments WHERE referral_id = ?').all(id);

  res.json({ ...referral, attachments });
});

router.post('/', authMiddleware, requireRoles('grassroots_doctor', 'senior_doctor', 'department_director'), (req, res) => {
  const {
    patient_id, patient_name, patient_gender, patient_age,
    disease_type, disease_summary,
    from_hospital_id, from_hospital_name, from_department_id, from_department_name,
    to_hospital_id, to_hospital_name, to_department_id, to_department_name,
    to_doctor_id, to_doctor_name, estimated_wait_time
  } = req.body;

  const id = uuidv4();
  const userId = req.user.id;
  const userName = req.user.name;

  const stmt = db.prepare(`
    INSERT INTO referrals 
    (id, patient_id, patient_name, patient_gender, patient_age, disease_type, disease_summary,
     from_hospital_id, from_hospital_name, from_department_id, from_department_name,
     from_doctor_id, from_doctor_name, to_hospital_id, to_hospital_name, to_department_id,
     to_department_name, to_doctor_id, to_doctor_name, estimated_wait_time, current_level, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')
  `);

  stmt.run(
    id, patient_id, patient_name, patient_gender, patient_age,
    disease_type, disease_summary,
    from_hospital_id, from_hospital_name, from_department_id, from_department_name,
    userId, userName,
    to_hospital_id, to_hospital_name, to_department_id, to_department_name,
    to_doctor_id, to_doctor_name, estimated_wait_time || 0
  );

  if (to_hospital_id) {
    db.prepare(`
      UPDATE hospitals 
      SET available_beds = available_beds - 1 
      WHERE id = ? AND available_beds > 0
    `).run(to_hospital_id);
  }

  const directors = db.prepare(`
    SELECT id FROM users 
    WHERE role = 'department_director' 
    AND hospital_id = ?
  `).all(from_hospital_id);

  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, content, type, related_id, related_type)
    VALUES (?, ?, ?, ?, 'info', ?, 'referral')
  `);

  directors.forEach(dir => {
    insertNotif.run(
      uuidv4(), dir.id,
      '新的转诊申请待审批',
      `患者${patient_name}的转诊申请需要您审批`,
      id
    );
  });

  res.status(201).json({ message: '转诊申请创建成功', id });
});

router.post('/:id/approve', authMiddleware, requireRoles('department_director', 'medical_affairs'), (req, res) => {
  const { id } = req.params;
  const { comment, level } = req.body;
  const userId = req.user.id;
  const userName = req.user.name;
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const referral = db.prepare('SELECT * FROM referrals WHERE id = ?').get(id);

  if (!referral) {
    return res.status(404).json({ message: '转诊申请不存在' });
  }

  if (referral.status === 'approved' || referral.status === 'rejected') {
    return res.status(400).json({ message: '该转诊申请已处理完成' });
  }

  const nextLevel = level + 1;
  let newStatus = 'approving';

  if (nextLevel > 3) {
    newStatus = 'approved';
  }

  const updateFields = [];
  const updateValues = [];

  if (level === 1) {
    updateFields.push('approval_level_1_by = ?', 'approval_level_1_at = ?', 'approval_level_1_comment = ?');
    updateValues.push(userName, now, comment || '');
  } else if (level === 2) {
    updateFields.push('approval_level_2_by = ?', 'approval_level_2_at = ?', 'approval_level_2_comment = ?');
    updateValues.push(userName, now, comment || '');
  } else if (level === 3) {
    updateFields.push('approval_level_3_by = ?', 'approval_level_3_at = ?', 'approval_level_3_comment = ?');
    updateValues.push(userName, now, comment || '');
  }

  updateFields.push('current_level = ?', 'status = ?', 'updated_at = ?');
  updateValues.push(nextLevel, newStatus, now, id);

  const updateQuery = `UPDATE referrals SET ${updateFields.join(', ')} WHERE id = ?`;
  db.prepare(updateQuery).run(...updateValues);

  if (nextLevel <= 3) {
    const nextApprovers = db.prepare(`
      SELECT DISTINCT u.id FROM users u
      WHERE (
        (? = 2 AND u.role = 'department_director' AND u.hospital_id = ?)
        OR
        (? = 3 AND u.role = 'medical_affairs')
      )
    `).all(nextLevel, referral.to_hospital_id, nextLevel);

    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type, related_id, related_type)
      VALUES (?, ?, ?, ?, 'info', ?, 'referral')
    `);

    nextApprovers.forEach(approver => {
      insertNotif.run(
        uuidv4(), approver.id,
        `转诊申请${level === 1 ? '一级' : level === 2 ? '二级' : '三级'}审批通过`,
        `患者${referral.patient_name}的转诊申请已通过${level}级审批，请继续处理`,
        id
      );
    });
  }

  res.json({ message: '审批成功', status: newStatus });
});

router.post('/:id/reject', authMiddleware, requireRoles('department_director', 'medical_affairs'), (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const userName = req.user.name;
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const referral = db.prepare('SELECT * FROM referrals WHERE id = ?').get(id);

  if (!referral) {
    return res.status(404).json({ message: '转诊申请不存在' });
  }

  const level = referral.current_level;

  const updateFields = ['status = ?', 'updated_at = ?'];
  const updateValues = ['rejected', now];

  if (level === 1) {
    updateFields.push('approval_level_1_by = ?', 'approval_level_1_at = ?', 'approval_level_1_comment = ?');
    updateValues.push(userName, now, comment || '');
  } else if (level === 2) {
    updateFields.push('approval_level_2_by = ?', 'approval_level_2_at = ?', 'approval_level_2_comment = ?');
    updateValues.push(userName, now, comment || '');
  } else if (level === 3) {
    updateFields.push('approval_level_3_by = ?', 'approval_level_3_at = ?', 'approval_level_3_comment = ?');
    updateValues.push(userName, now, comment || '');
  }

  updateValues.push(id);

  const updateQuery = `UPDATE referrals SET ${updateFields.join(', ')} WHERE id = ?`;
  db.prepare(updateQuery).run(...updateValues);

  if (referral.to_hospital_id) {
    db.prepare(`
      UPDATE hospitals 
      SET available_beds = available_beds + 1 
      WHERE id = ?
    `).run(referral.to_hospital_id);
  }

  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, content, type, related_id, related_type)
    VALUES (?, ?, ?, ?, 'warning', ?, 'referral')
  `);

  insertNotif.run(
    uuidv4(), referral.from_doctor_id,
    '转诊申请被驳回',
    `患者${referral.patient_name}的转诊申请已被驳回，原因：${comment || '无'}`,
    id
  );

  res.json({ message: '已驳回转诊申请' });
});

router.get('/recommend/hospitals', authMiddleware, (req, res) => {
  const { disease_type } = req.query;

  if (!disease_type) {
    return res.status(400).json({ message: '请提供疾病类型' });
  }

  const allHospitals = db.prepare('SELECT * FROM hospitals').all();
  const allDepartments = db.prepare('SELECT * FROM departments').all();
  const allReferrals = db.prepare('SELECT * FROM referrals').all();

  const upperLevelHospitals = allHospitals.filter(h => 
    h.level === '三级甲等' || h.level === '三级乙等'
  );

  const lowerDisease = disease_type.toLowerCase();
  const matchedDepartments = allDepartments.filter(d => 
    d.disease_types && d.disease_types.toLowerCase().includes(lowerDisease)
  );

  const hospitalDeptPairs = [];
  
  upperLevelHospitals.forEach(hospital => {
    const hospitalDepts = matchedDepartments.filter(d => d.hospital_id === hospital.id);
    
    hospitalDepts.forEach(dept => {
      const pendingReferrals = allReferrals.filter(r => 
        r.to_hospital_id === hospital.id && 
        (r.status === 'pending' || r.status === 'approving')
      ).length;

      const diseaseMatchScore = dept.disease_types.toLowerCase().includes(lowerDisease) ? 100 : 0;
      
      hospitalDeptPairs.push({
        id: hospital.id,
        name: hospital.name,
        level: hospital.level,
        address: hospital.address,
        total_beds: hospital.total_beds,
        available_beds: hospital.available_beds,
        department_id: dept.id,
        department_name: dept.name,
        available_registration: dept.available_registration,
        total_registration: dept.total_registration,
        pending_referrals: pendingReferrals,
        disease_match_score: diseaseMatchScore
      });
    });
  });

  hospitalDeptPairs.sort((a, b) => {
    const scoreA = (a.disease_match_score * 0.4) +
      ((a.available_beds / a.total_beds) * 100 * 0.3) +
      ((a.available_registration / a.total_registration) * 100 * 0.3);
    
    const scoreB = (b.disease_match_score * 0.4) +
      ((b.available_beds / b.total_beds) * 100 * 0.3) +
      ((b.available_registration / b.total_registration) * 100 * 0.3);
    
    return scoreB - scoreA;
  });

  const topHospitals = hospitalDeptPairs.slice(0, 10).map(h => ({
    ...h,
    bed_occupancy_rate: Math.round(((h.total_beds - h.available_beds) / h.total_beds) * 100),
    registration_available_rate: Math.round((h.available_registration / h.total_registration) * 100),
    estimated_wait_time: Math.max(15, h.pending_referrals * 15),
    score: Math.round(
      (h.disease_match_score * 0.4) +
      ((h.available_beds / h.total_beds) * 100 * 0.3) +
      ((h.available_registration / h.total_registration) * 100 * 0.3)
    )
  }));

  res.json({ data: topHospitals });
});

export default router;

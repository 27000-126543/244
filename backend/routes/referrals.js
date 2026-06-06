import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

function checkAndEscalateReferrals() {
  const now = dayjs();
  const pendingReferrals = db.prepare(`
    SELECT * FROM referrals 
    WHERE status IN ('pending', 'approving') 
    AND is_escalated = 0
  `).all();

  pendingReferrals.forEach(referral => {
    const createdAt = dayjs(referral.created_at);
    const hoursDiff = now.diff(createdAt, 'hour');
    
    if (hoursDiff >= 24) {
      db.prepare(`
        UPDATE referrals 
        SET is_escalated = 1, updated_at = ?
        WHERE id = ?
      `).run(now.format('YYYY-MM-DD HH:mm:ss'), referral.id);

      const admins = db.prepare(`
        SELECT id FROM users WHERE role IN ('medical_affairs', 'admin')
      `).all();

      admins.forEach(admin => {
        db.prepare(`
          INSERT INTO notifications (id, user_id, title, content, type, related_id, related_type)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          uuidv4(),
          admin.id,
          '转诊申请超时升级',
          `转诊申请（患者：${referral.patient_name}，疾病：${referral.disease_type}）已超过24小时未处理，已自动升级`,
          'warning',
          referral.id,
          'referral'
        );
      });
    }
  });
}

router.get('/', authMiddleware, (req, res) => {
  checkAndEscalateReferrals();
  
  const { status, hospital_id, disease_type, page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;

  let whereClause = 'WHERE 1=1';
  const params = [];

  if (status) {
    whereClause += ' AND status = ?';
    params.push(status);
  }

  if (hospital_id) {
    whereClause += ' AND (from_hospital_id = ? OR to_hospital_id = ?)';
    params.push(hospital_id, hospital_id);
  }

  if (disease_type) {
    whereClause += ' AND disease_type LIKE ?';
    params.push(`%${disease_type}%`);
  }

  const countQuery = `SELECT COUNT(*) as total FROM referrals ${whereClause}`;
  const { total } = db.prepare(countQuery).get(...params);

  const query = `
    SELECT * FROM referrals 
    ${whereClause}
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  params.push(parseInt(pageSize), parseInt(offset));
  
  const referrals = db.prepare(query).all(...params);

  res.json({
    data: referrals,
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

  const attachments = db.prepare(`
    SELECT * FROM referral_attachments WHERE referral_id = ?
  `).all(id);

  res.json({ data: { ...referral, attachments } });
});

router.post('/', authMiddleware, (req, res) => {
  const {
    patient_id,
    patient_name,
    patient_gender,
    patient_age,
    disease_type,
    disease_summary,
    from_hospital_id,
    from_hospital_name,
    from_department_id,
    from_department_name,
    from_doctor_id,
    from_doctor_name,
    to_hospital_id,
    to_hospital_name,
    to_department_id,
    to_department_name,
    to_doctor_id,
    to_doctor_name,
    estimated_wait_time
  } = req.body;

  const id = uuidv4();
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  db.prepare(`
    INSERT INTO referrals 
    (id, patient_id, patient_name, patient_gender, patient_age, disease_type, disease_summary,
     from_hospital_id, from_hospital_name, from_department_id, from_department_name,
     from_doctor_id, from_doctor_name, to_hospital_id, to_hospital_name, to_department_id,
     to_department_name, to_doctor_id, to_doctor_name, estimated_wait_time,
     current_level, status, is_escalated, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending', 0, ?, ?)
  `).run(
    id, patient_id, patient_name, patient_gender, patient_age, disease_type, disease_summary,
    from_hospital_id, from_hospital_name, from_department_id, from_department_name,
    from_doctor_id, from_doctor_name, to_hospital_id, to_hospital_name, to_department_id,
    to_department_name, to_doctor_id, to_doctor_name, estimated_wait_time || 30,
    now, now
  );

  const directors = db.prepare(`
    SELECT id FROM users 
    WHERE role = 'department_director' 
    AND hospital_id = ?
    AND department_id = ?
  `).all(from_hospital_id, from_department_id);

  directors.forEach(director => {
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, content, type, related_id, related_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      director.id,
      '新转诊申请待审批',
      `患者${patient_name}的转诊申请等待您的审批`,
      'info',
      id,
      'referral'
    );
  });

  res.status(201).json({ data: { id } });
});

router.post('/:id/approve', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const userId = req.user.id;
  const userName = req.user.name;
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const referral = db.prepare('SELECT * FROM referrals WHERE id = ?').get(id);
  if (!referral) {
    return res.status(404).json({ message: '转诊申请不存在' });
  }

  if (referral.status === 'approved' || referral.status === 'rejected') {
    return res.status(400).json({ message: '转诊申请已完成审批，无法重复操作' });
  }

  const currentLevel = referral.current_level;
  let nextLevel = currentLevel + 1;
  let newStatus = 'approving';

  const updateData = {
    [`approval_level_${currentLevel}_by`]: userName,
    [`approval_level_${currentLevel}_at`]: now,
    [`approval_level_${currentLevel}_comment`]: comment || '',
    updated_at: now
  };

  if (currentLevel >= 3) {
    newStatus = 'approved';
  } else {
    updateData.current_level = nextLevel;
  }

  const setClauses = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updateData);
  
  db.prepare(`UPDATE referrals SET ${setClauses}, status = ? WHERE id = ?`)
    .run(...values, newStatus, id);

  res.json({ message: '审批成功', data: { id, status: newStatus, current_level: currentLevel >= 3 ? 3 : nextLevel } });
});

router.post('/:id/reject', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;
  const userName = req.user.name;
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const referral = db.prepare('SELECT * FROM referrals WHERE id = ?').get(id);
  if (!referral) {
    return res.status(404).json({ message: '转诊申请不存在' });
  }

  if (referral.status === 'approved' || referral.status === 'rejected') {
    return res.status(400).json({ message: '转诊申请已完成审批，无法重复操作' });
  }

  const currentLevel = referral.current_level;

  db.prepare(`
    UPDATE referrals 
    SET 
      approval_level_${currentLevel}_by = ?,
      approval_level_${currentLevel}_at = ?,
      approval_level_${currentLevel}_comment = ?,
      status = 'rejected',
      updated_at = ?
    WHERE id = ?
  `).run(userName, now, comment || '', now, id);

  res.json({ message: '已驳回', data: { id, status: 'rejected' } });
});

router.get('/recommend/hospitals', authMiddleware, (req, res) => {
  const { disease_type } = req.query;

  if (!disease_type) {
    return res.status(400).json({ message: '请提供疾病类型' });
  }

  const lowerDisease = disease_type.toLowerCase();

  const hospitals = db.prepare(`
    SELECT 
      h.id,
      h.name,
      h.level,
      h.address,
      h.total_beds,
      h.available_beds,
      d.id as department_id,
      d.name as department_name,
      d.available_registration,
      d.total_registration,
      d.disease_types
    FROM hospitals h
    JOIN departments d ON d.hospital_id = h.id
    WHERE h.level IN ('三级甲等', '三级乙等')
    AND LOWER(d.disease_types) LIKE ?
  `).all(`%${lowerDisease}%`);

  const pendingCounts = db.prepare(`
    SELECT to_hospital_id, COUNT(*) as count 
    FROM referrals 
    WHERE status IN ('pending', 'approving')
    GROUP BY to_hospital_id
  `).all();

  const pendingMap = {};
  pendingCounts.forEach(p => {
    pendingMap[p.to_hospital_id] = p.count;
  });

  const result = hospitals.map(h => {
    const hasDisease = h.disease_types && h.disease_types.toLowerCase().includes(lowerDisease);
    const diseaseMatchScore = hasDisease ? 100 : 0;
    const pendingReferrals = pendingMap[h.id] || 0;
    const bedRate = h.total_beds ? (h.available_beds / h.total_beds) : 0;
    const regRate = h.total_registration ? (h.available_registration / h.total_registration) : 0;
    
    return {
      id: h.id,
      name: h.name,
      level: h.level,
      address: h.address,
      total_beds: h.total_beds,
      available_beds: h.available_beds,
      department_id: h.department_id,
      department_name: h.department_name,
      available_registration: h.available_registration,
      total_registration: h.total_registration,
      pending_referrals: pendingReferrals,
      disease_match_score: diseaseMatchScore,
      bed_occupancy_rate: Math.round(((h.total_beds - h.available_beds) / h.total_beds) * 100),
      registration_available_rate: Math.round(regRate * 100),
      estimated_wait_time: Math.max(15, pendingReferrals * 15),
      score: Math.round(
        (diseaseMatchScore * 0.4) +
        (bedRate * 100 * 0.3) +
        (regRate * 100 * 0.3)
      )
    };
  });

  result.sort((a, b) => b.score - a.score);

  res.json({ data: result.slice(0, 10) });
});

export default router;

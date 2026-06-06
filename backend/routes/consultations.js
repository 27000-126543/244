import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import db from '../database/db.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  const { status, hospital_id, page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;

  let query = 'SELECT * FROM consultations WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM consultations WHERE 1=1';
  const params = [];
  const countParams = [];

  if (status) {
    query += ' AND status = ?';
    countQuery += ' AND status = ?';
    params.push(status);
    countParams.push(status);
  }

  if (hospital_id) {
    query += ' AND hospital_id = ?';
    countQuery += ' AND hospital_id = ?';
    params.push(hospital_id);
    countParams.push(hospital_id);
  }

  query += ' ORDER BY scheduled_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(pageSize), offset);

  const consultations = db.prepare(query).all(...params);
  const { total } = db.prepare(countQuery).get(...countParams);

  const result = consultations.map(c => {
    const experts = db.prepare('SELECT * FROM consultation_experts WHERE consultation_id = ?').all(c.id);
    return { ...c, experts };
  });

  res.json({
    data: result,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize)
  });
});

router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const consultation = db.prepare('SELECT * FROM consultations WHERE id = ?').get(id);

  if (!consultation) {
    return res.status(404).json({ message: '会诊不存在' });
  }

  const experts = db.prepare('SELECT * FROM consultation_experts WHERE consultation_id = ?').all(id);
  const messages = db.prepare('SELECT * FROM consultation_messages WHERE consultation_id = ? ORDER BY created_at ASC').all(id);

  res.json({ ...consultation, experts, messages });
});

router.post('/', authMiddleware, requireRoles('senior_doctor', 'department_director'), (req, res) => {
  const {
    title, patient_id, patient_name, disease_type,
    hospital_id, hospital_name, department_id, department_name,
    scheduled_at, expert_ids
  } = req.body;

  const id = uuidv4();
  const userId = req.user.id;
  const userName = req.user.name;

  db.prepare(`
    INSERT INTO consultations 
    (id, title, patient_id, patient_name, disease_type, status,
     initiator_id, initiator_name, hospital_id, hospital_name,
     department_id, department_name, scheduled_at)
    VALUES (?, ?, ?, ?, ?, 'scheduled', ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, title, patient_id, patient_name, disease_type,
    userId, userName, hospital_id, hospital_name,
    department_id, department_name, scheduled_at
  );

  if (expert_ids && expert_ids.length > 0) {
    const insertExpert = db.prepare(`
      INSERT INTO consultation_experts (id, consultation_id, expert_id, expert_name, expert_hospital, expert_department)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    expert_ids.forEach(expId => {
      const user = db.prepare('SELECT name, hospital_id, department_id FROM users WHERE id = ?').get(expId);
      const hospital = user?.hospital_id ? db.prepare('SELECT name FROM hospitals WHERE id = ?').get(user.hospital_id) : null;
      const dept = user?.department_id ? db.prepare('SELECT name FROM departments WHERE id = ?').get(user.department_id) : null;
      
      insertExpert.run(
        uuidv4(), id, expId,
        user?.name || '未知专家',
        hospital?.name || '',
        dept?.name || ''
      );
    });
  }

  res.status(201).json({ message: '会诊创建成功', id });
});

router.post('/:id/messages', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;
  const userName = req.user.name;

  const consultation = db.prepare('SELECT * FROM consultations WHERE id = ?').get(id);
  if (!consultation) {
    return res.status(404).json({ message: '会诊不存在' });
  }

  const msgId = uuidv4();
  db.prepare(`
    INSERT INTO consultation_messages (id, consultation_id, sender_id, sender_name, content)
    VALUES (?, ?, ?, ?, ?)
  `).run(msgId, id, userId, userName, content);

  res.status(201).json({ message: '消息发送成功', id: msgId });
});

router.post('/:id/start', authMiddleware, (req, res) => {
  const { id } = req.params;
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  db.prepare(`
    UPDATE consultations 
    SET status = 'ongoing', started_at = ?
    WHERE id = ?
  `).run(now, id);

  res.json({ message: '会诊已开始' });
});

router.post('/:id/end', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { summary } = req.body;
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  db.prepare(`
    UPDATE consultations 
    SET status = 'completed', ended_at = ?, summary = ?
    WHERE id = ?
  `).run(now, summary || '', id);

  res.json({ message: '会诊已结束' });
});

export default router;

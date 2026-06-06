import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

function checkDuplicateExamination(patientId, examinationName, examinationDate) {
  const duplicates = db.prepare(`
    SELECT * FROM examinations 
    WHERE patient_id = ? 
    AND examination_name = ? 
    AND DATE(examination_date) >= DATE(?, '-30 day')
    AND is_mutual_recognition = 1
    ORDER BY examination_date DESC
    LIMIT 1
  `).all(patientId, examinationName, examinationDate);

  return duplicates.length > 0 ? duplicates[0] : null;
}

router.get('/', authMiddleware, (req, res) => {
  const { patient_id, hospital_id, is_duplicate, page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;

  let query = 'SELECT * FROM examinations WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM examinations WHERE 1=1';
  const params = [];
  const countParams = [];

  if (patient_id) {
    query += ' AND patient_id = ?';
    countQuery += ' AND patient_id = ?';
    params.push(patient_id);
    countParams.push(patient_id);
  }

  if (hospital_id) {
    query += ' AND hospital_id = ?';
    countQuery += ' AND hospital_id = ?';
    params.push(hospital_id);
    countParams.push(hospital_id);
  }

  if (is_duplicate !== undefined) {
    query += ' AND is_duplicate = ?';
    countQuery += ' AND is_duplicate = ?';
    params.push(is_duplicate === 'true' ? 1 : 0);
    countParams.push(is_duplicate === 'true' ? 1 : 0);
  }

  query += ' ORDER BY examination_date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(pageSize), offset);

  const examinations = db.prepare(query).all(...params);
  const { total } = db.prepare(countQuery).get(...countParams);

  const duplicateCount = db.prepare(`
    SELECT COUNT(*) as count FROM examinations WHERE is_duplicate = 1
  `).get().count;

  const mutualRecognitionRate = examinations.length > 0
    ? Math.round((examinations.filter(e => e.is_mutual_recognition).length / examinations.length) * 100)
    : 100;

  res.json({
    data: examinations,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    stats: {
      duplicate_count: duplicateCount,
      mutual_recognition_rate: mutualRecognitionRate
    }
  });
});

router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const examination = db.prepare('SELECT * FROM examinations WHERE id = ?').get(id);

  if (!examination) {
    return res.status(404).json({ message: '检查报告不存在' });
  }

  res.json(examination);
});

router.post('/', authMiddleware, (req, res) => {
  const {
    patient_id, patient_name, examination_type, examination_name,
    hospital_id, hospital_name, department_id, department_name,
    doctor_id, doctor_name, result, examination_date
  } = req.body;

  const id = uuidv4();
  const examDate = examination_date || dayjs().format('YYYY-MM-DD');

  const duplicate = checkDuplicateExamination(patient_id, examination_name, examDate);

  db.prepare(`
    INSERT INTO examinations 
    (id, patient_id, patient_name, examination_type, examination_name,
     hospital_id, hospital_name, department_id, department_name,
     doctor_id, doctor_name, result, examination_date,
     is_mutual_recognition, is_duplicate, duplicate_of)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).run(
    id, patient_id, patient_name, examination_type, examination_name,
    hospital_id, hospital_name, department_id, department_name,
    doctor_id, doctor_name, result, examDate,
    duplicate ? 1 : 0,
    duplicate ? duplicate.id : null
  );

  res.status(201).json({
    message: '检查报告创建成功',
    id,
    is_duplicate: duplicate ? 1 : 0,
    duplicate_of: duplicate
  });
});

router.get('/patient/:patientId/history', authMiddleware, (req, res) => {
  const { patientId } = req.params;

  const history = db.prepare(`
    SELECT * FROM examinations 
    WHERE patient_id = ? 
    ORDER BY examination_date DESC
  `).all(patientId);

  res.json({ data: history });
});

export default router;

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import db from '../database/db.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();

const INSURANCE_RATE = 0.7;
const FROM_HOSPITAL_SHARE_RATE = 0.1;
const TO_HOSPITAL_SHARE_RATE = 0.5;

function calculateSettlement(totalAmount, hasReferral = true) {
  const insuranceAmount = Math.round(totalAmount * INSURANCE_RATE * 100) / 100;
  const patientPayAmount = Math.round((totalAmount - insuranceAmount) * 100) / 100;
  
  let fromHospitalShare = 0;
  let toHospitalShare = 0;
  
  if (hasReferral) {
    fromHospitalShare = Math.round(insuranceAmount * FROM_HOSPITAL_SHARE_RATE * 100) / 100;
    toHospitalShare = Math.round(insuranceAmount * TO_HOSPITAL_SHARE_RATE * 100) / 100;
  } else {
    fromHospitalShare = insuranceAmount;
  }

  return {
    total_amount: totalAmount,
    insurance_amount: insuranceAmount,
    patient_pay_amount: patientPayAmount,
    from_hospital_share: fromHospitalShare,
    to_hospital_share: toHospitalShare
  };
}

router.get('/', authMiddleware, (req, res) => {
  const { hospital_id, start_date, end_date, status, page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;

  let query = 'SELECT * FROM settlements WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM settlements WHERE 1=1';
  const params = [];
  const countParams = [];

  if (hospital_id) {
    query += ' AND (from_hospital_id = ? OR to_hospital_id = ?)';
    countQuery += ' AND (from_hospital_id = ? OR to_hospital_id = ?)';
    params.push(hospital_id, hospital_id);
    countParams.push(hospital_id, hospital_id);
  }

  if (start_date) {
    query += ' AND settlement_date >= ?';
    countQuery += ' AND settlement_date >= ?';
    params.push(start_date);
    countParams.push(start_date);
  }

  if (end_date) {
    query += ' AND settlement_date <= ?';
    countQuery += ' AND settlement_date <= ?';
    params.push(end_date);
    countParams.push(end_date);
  }

  if (status) {
    query += ' AND status = ?';
    countQuery += ' AND status = ?';
    params.push(status);
    countParams.push(status);
  }

  query += ' ORDER BY settlement_date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(pageSize), offset);

  const settlements = db.prepare(query).all(...params);
  const { total } = db.prepare(countQuery).get(...countParams);

  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total_count,
      SUM(total_amount) as total_amount,
      SUM(insurance_amount) as total_insurance,
      SUM(patient_pay_amount) as total_patient_pay
    FROM settlements
    WHERE 1=1
    ${start_date ? 'AND settlement_date >= ?' : ''}
    ${end_date ? 'AND settlement_date <= ?' : ''}
  `).get(...(start_date ? [start_date] : []), ...(end_date ? [end_date] : []));

  res.json({
    data: settlements,
    total,
    page: parseInt(page),
    pageSize: parseInt(pageSize),
    stats: {
      total_count: stats.total_count || 0,
      total_amount: stats.total_amount || 0,
      total_insurance: stats.total_insurance || 0,
      total_patient_pay: stats.total_patient_pay || 0
    }
  });
});

router.get('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const settlement = db.prepare('SELECT * FROM settlements WHERE id = ?').get(id);

  if (!settlement) {
    return res.status(404).json({ message: '结算记录不存在' });
  }

  const items = db.prepare('SELECT * FROM settlement_items WHERE settlement_id = ?').all(id);

  res.json({ ...settlement, items });
});

router.post('/', authMiddleware, requireRoles('medical_affairs', 'admin'), (req, res) => {
  const {
    referral_id, patient_id, patient_name,
    from_hospital_id, from_hospital_name,
    to_hospital_id, to_hospital_name,
    total_amount, items
  } = req.body;

  const id = uuidv4();
  const settlementDate = dayjs().format('YYYY-MM-DD');
  const hasReferral = !!referral_id && !!to_hospital_id;

  const calculated = calculateSettlement(total_amount, hasReferral);

  db.prepare(`
    INSERT INTO settlements 
    (id, referral_id, patient_id, patient_name,
     from_hospital_id, from_hospital_name,
     to_hospital_id, to_hospital_name,
     total_amount, insurance_amount, patient_pay_amount,
     from_hospital_share, to_hospital_share,
     settlement_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    id, referral_id || null, patient_id, patient_name,
    from_hospital_id, from_hospital_name,
    to_hospital_id || null, to_hospital_name || null,
    calculated.total_amount, calculated.insurance_amount, calculated.patient_pay_amount,
    calculated.from_hospital_share, calculated.to_hospital_share,
    settlementDate
  );

  if (items && items.length > 0) {
    const insertItem = db.prepare(`
      INSERT INTO settlement_items (id, settlement_id, item_type, item_name, amount)
      VALUES (?, ?, ?, ?, ?)
    `);

    items.forEach(item => {
      insertItem.run(uuidv4(), id, item.item_type, item.item_name, item.amount);
    });
  }

  res.status(201).json({
    message: '结算记录创建成功',
    id,
    ...calculated
  });
});

router.post('/:id/complete', authMiddleware, requireRoles('medical_affairs', 'admin'), (req, res) => {
  const { id } = req.params;

  db.prepare(`
    UPDATE settlements 
    SET status = 'completed'
    WHERE id = ?
  `).run(id);

  res.json({ message: '结算已完成' });
});

export default router;

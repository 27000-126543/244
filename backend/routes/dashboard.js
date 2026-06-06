import express from 'express';
import dayjs from 'dayjs';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, (req, res) => {
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM referrals) as total_referrals,
      (SELECT COUNT(*) FROM consultations) as total_consultations,
      (SELECT COUNT(*) FROM examinations) as total_examinations,
      (SELECT COUNT(*) FROM prescriptions) as total_prescriptions,
      (SELECT SUM(total_beds) FROM hospitals) as total_beds,
      (SELECT SUM(available_beds) FROM hospitals) as available_beds,
      (SELECT COUNT(*) FROM referrals WHERE status IN ('pending', 'approving')) as pending_referrals,
      (SELECT COUNT(*) FROM consultations WHERE DATE(scheduled_at) = DATE('now', 'localtime')) as today_consultations,
      (SELECT COUNT(*) FROM drugs WHERE stock <= min_stock) as low_stock_drugs
  `).get();

  const bedOccupancyRate = stats.total_beds 
    ? Math.round(((stats.total_beds - stats.available_beds) / stats.total_beds) * 100) 
    : 0;

  const examStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicate
    FROM examinations
  `).get();

  const mutualRecognitionRate = examStats.total > 0
    ? Math.round(((examStats.total - examStats.duplicate) / examStats.total) * 100)
    : 100;

  const drugStats = db.prepare('SELECT COUNT(*) as total FROM drugs').get();
  const stockTurnoverRate = drugStats.total > 0
    ? Math.round(((drugStats.total - stats.low_stock_drugs) / drugStats.total) * 100)
    : 100;

  res.json({
    data: {
      total_referrals: stats.total_referrals,
      total_consultations: stats.total_consultations,
      total_examinations: examStats.total,
      total_prescriptions: stats.total_prescriptions,
      bed_occupancy_rate: bedOccupancyRate,
      mutual_recognition_rate: mutualRecognitionRate,
      stock_turnover_rate: stockTurnoverRate,
      pending_referrals: stats.pending_referrals,
      today_consultations: stats.today_consultations,
      total_beds: stats.total_beds,
      available_beds: stats.available_beds,
      low_stock_drugs: stats.low_stock_drugs
    }
  });
});

router.get('/referral-trend', authMiddleware, (req, res) => {
  const days = req.query.days || 7;

  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
    const count = db.prepare(`
      SELECT COUNT(*) as count FROM referrals 
      WHERE DATE(created_at) = ?
    `).get(date).count;
    
    trend.push({ date, count });
  }

  res.json({ data: trend });
});

router.get('/hospital-stats', authMiddleware, (req, res) => {
  const hospitals = db.prepare(`
    SELECT 
      h.id,
      h.name,
      h.level,
      h.total_beds,
      h.available_beds,
      (SELECT COUNT(*) FROM referrals r WHERE r.from_hospital_id = h.id) as referral_out_count,
      (SELECT COUNT(*) FROM referrals r WHERE r.to_hospital_id = h.id) as referral_in_count,
      (SELECT COUNT(*) FROM consultations c WHERE c.hospital_id = h.id) as consultation_count
    FROM hospitals h
    ORDER BY h.name
  `).all();

  const result = hospitals.map(h => ({
    ...h,
    bed_occupancy_rate: h.total_beds ? Math.round(((h.total_beds - h.available_beds) / h.total_beds) * 100) : 0
  }));

  res.json({ data: result });
});

router.get('/disease-type-distribution', authMiddleware, (req, res) => {
  const distribution = db.prepare(`
    SELECT 
      disease_type as name,
      COUNT(*) as value
    FROM referrals
    WHERE disease_type IS NOT NULL AND disease_type != ''
    GROUP BY disease_type
    ORDER BY value DESC
    LIMIT 8
  `).all();

  res.json({ data: distribution });
});

router.get('/recent-activities', authMiddleware, (req, res) => {
  const limit = req.query.limit || 10;

  const activities = db.prepare(`
    SELECT id, type, title, status, created_at, hospital
    FROM (
      SELECT 
        id,
        'referral' as type,
        patient_name as title,
        status,
        created_at,
        from_hospital_name as hospital
      FROM referrals
      UNION ALL
      SELECT 
        id,
        'consultation' as type,
        title,
        status,
        created_at,
        hospital_name as hospital
      FROM consultations
    )
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);

  res.json({ data: activities });
});

router.get('/reports', authMiddleware, (req, res) => {
  const { hospital_id, start_date, end_date } = req.query;

  let referralWhere = 'WHERE 1=1';
  let consultWhere = 'WHERE 1=1';
  let examWhere = 'WHERE 1=1';
  let settleWhere = 'WHERE 1=1';
  const params = [];

  if (hospital_id) {
    referralWhere += ' AND (from_hospital_id = ? OR to_hospital_id = ?)';
    params.push(hospital_id, hospital_id);
    consultWhere += ' AND hospital_id = ?';
    params.push(hospital_id);
    examWhere += ' AND hospital_id = ?';
    params.push(hospital_id);
    settleWhere += ' AND (from_hospital_id = ? OR to_hospital_id = ?)';
    params.push(hospital_id, hospital_id);
  }

  if (start_date) {
    referralWhere += ' AND DATE(created_at) >= ?';
    params.push(start_date);
    consultWhere += ' AND DATE(created_at) >= ?';
    params.push(start_date);
    examWhere += ' AND DATE(examination_date) >= ?';
    params.push(start_date);
    settleWhere += ' AND DATE(settlement_date) >= ?';
    params.push(start_date);
  }

  if (end_date) {
    referralWhere += ' AND DATE(created_at) <= ?';
    params.push(start_date ? params[params.length - 1] : undefined);
    params.push(end_date);
    consultWhere += ' AND DATE(created_at) <= ?';
    params.push(end_date);
    examWhere += ' AND DATE(examination_date) <= ?';
    params.push(end_date);
    settleWhere += ' AND DATE(settlement_date) <= ?';
    params.push(end_date);
  }

  const referralStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status IN ('pending', 'approving') THEN 1 ELSE 0 END) as pending
    FROM referrals ${referralWhere}
  `).get(...params.slice(0, 4));

  const consultationStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing,
      SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled
    FROM consultations ${consultWhere}
  `).get(...params.slice(2, 4));

  const examStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicate,
      SUM(CASE WHEN is_mutual_recognition = 1 THEN 1 ELSE 0 END) as mutual_recognition
    FROM examinations ${examWhere}
  `).get(...params.slice(2, 4));

  const settlementStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(total_amount) as total_amount,
      SUM(insurance_amount) as insurance_amount,
      SUM(patient_pay_amount) as patient_pay_amount
    FROM settlements ${settleWhere}
  `).get(...params.slice(0, 4));

  res.json({
    data: {
      referrals: referralStats,
      consultations: consultationStats,
      examinations: examStats,
      settlements: settlementStats
    }
  });
});

export default router;

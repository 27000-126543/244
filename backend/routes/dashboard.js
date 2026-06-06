import express from 'express';
import dayjs from 'dayjs';
import db from '../database/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', authMiddleware, (req, res) => {
  const allReferrals = db.prepare('SELECT * FROM referrals').all();
  const allConsultations = db.prepare('SELECT * FROM consultations').all();
  const allExaminations = db.prepare('SELECT * FROM examinations').all();
  const allPrescriptions = db.prepare('SELECT * FROM prescriptions').all();
  const allHospitals = db.prepare('SELECT * FROM hospitals').all();
  const allDrugs = db.prepare('SELECT * FROM drugs').all();

  const totalBeds = allHospitals.reduce((sum, h) => sum + (h.total_beds || 0), 0);
  const availableBeds = allHospitals.reduce((sum, h) => sum + (h.available_beds || 0), 0);
  const bedOccupancyRate = totalBeds ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0;

  const duplicateExams = allExaminations.filter(e => e.is_duplicate === 1).length;
  const mutualRecognitionRate = allExaminations.length > 0
    ? Math.round(((allExaminations.length - duplicateExams) / allExaminations.length) * 100)
    : 100;

  const lowStockDrugs = allDrugs.filter(d => d.stock <= d.min_stock).length;
  const stockTurnoverRate = allDrugs.length > 0
    ? Math.round(((allDrugs.length - lowStockDrugs) / allDrugs.length) * 100)
    : 100;

  const pendingReferrals = allReferrals.filter(r => r.status === 'pending' || r.status === 'approving').length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayConsultations = allConsultations.filter(c => {
    const scheduledDate = c.scheduled_at ? c.scheduled_at.split(' ')[0] : '';
    return scheduledDate === today;
  }).length;

  res.json({
    data: {
      total_referrals: allReferrals.length,
      total_consultations: allConsultations.length,
      total_examinations: allExaminations.length,
      total_prescriptions: allPrescriptions.length,
      bed_occupancy_rate: bedOccupancyRate,
      mutual_recognition_rate: mutualRecognitionRate,
      stock_turnover_rate: stockTurnoverRate,
      pending_referrals: pendingReferrals,
      today_consultations: todayConsultations,
      total_beds: totalBeds,
      available_beds: availableBeds,
      low_stock_drugs: lowStockDrugs
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
  const allHospitals = db.prepare('SELECT * FROM hospitals').all();
  const allReferrals = db.prepare('SELECT * FROM referrals').all();
  const allConsultations = db.prepare('SELECT * FROM consultations').all();

  const hospitals = allHospitals.map(h => {
    const referral_out_count = allReferrals.filter(r => r.from_hospital_id === h.id).length;
    const referral_in_count = allReferrals.filter(r => r.to_hospital_id === h.id).length;
    const consultation_count = allConsultations.filter(c => c.hospital_id === h.id).length;
    
    return {
      id: h.id,
      name: h.name,
      level: h.level,
      total_beds: h.total_beds,
      available_beds: h.available_beds,
      referral_out_count,
      referral_in_count,
      consultation_count,
      bed_occupancy_rate: h.total_beds ? Math.round(((h.total_beds - h.available_beds) / h.total_beds) * 100) : 0
    };
  });

  hospitals.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ data: hospitals });
});

router.get('/disease-type-distribution', authMiddleware, (req, res) => {
  const allReferrals = db.prepare('SELECT * FROM referrals').all();
  
  const diseaseMap = new Map();
  allReferrals.forEach(r => {
    if (r.disease_type) {
      diseaseMap.set(r.disease_type, (diseaseMap.get(r.disease_type) || 0) + 1);
    }
  });
  
  const distribution = Array.from(diseaseMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  res.json({ data: distribution });
});

router.get('/recent-activities', authMiddleware, (req, res) => {
  const limit = req.query.limit || 10;

  const referrals = db.prepare(`
    SELECT 
      id,
      'referral' as type,
      patient_name as title,
      status,
      created_at,
      from_hospital_name as hospital
    FROM referrals
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);

  const consultations = db.prepare(`
    SELECT 
      id,
      'consultation' as type,
      title,
      status,
      created_at,
      hospital_name as hospital
    FROM consultations
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);

  const all = [...referrals, ...consultations]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);

  res.json({ data: all });
});

router.get('/reports', authMiddleware, (req, res) => {
  const { hospital_id, start_date, end_date } = req.query;

  const referralStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN status IN ('pending', 'approving') THEN 1 ELSE 0 END) as pending
    FROM referrals
    WHERE 1=1
    ${hospital_id ? 'AND (from_hospital_id = ? OR to_hospital_id = ?)' : ''}
    ${start_date ? 'AND DATE(created_at) >= ?' : ''}
    ${end_date ? 'AND DATE(created_at) <= ?' : ''}
  `).get(
    ...(hospital_id ? [hospital_id, hospital_id] : []),
    ...(start_date ? [start_date] : []),
    ...(end_date ? [end_date] : [])
  );

  const consultationStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing,
      SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled
    FROM consultations
    WHERE 1=1
    ${hospital_id ? 'AND hospital_id = ?' : ''}
    ${start_date ? 'AND DATE(created_at) >= ?' : ''}
    ${end_date ? 'AND DATE(created_at) <= ?' : ''}
  `).get(
    ...(hospital_id ? [hospital_id] : []),
    ...(start_date ? [start_date] : []),
    ...(end_date ? [end_date] : [])
  );

  const examStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicate,
      SUM(CASE WHEN is_mutual_recognition = 1 THEN 1 ELSE 0 END) as mutual_recognition
    FROM examinations
    WHERE 1=1
    ${hospital_id ? 'AND hospital_id = ?' : ''}
    ${start_date ? 'AND DATE(examination_date) >= ?' : ''}
    ${end_date ? 'AND DATE(examination_date) <= ?' : ''}
  `).get(
    ...(hospital_id ? [hospital_id] : []),
    ...(start_date ? [start_date] : []),
    ...(end_date ? [end_date] : [])
  );

  const settlementStats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(total_amount) as total_amount,
      SUM(insurance_amount) as insurance_amount,
      SUM(patient_pay_amount) as patient_pay_amount
    FROM settlements
    WHERE 1=1
    ${hospital_id ? 'AND (from_hospital_id = ? OR to_hospital_id = ?)' : ''}
    ${start_date ? 'AND DATE(settlement_date) >= ?' : ''}
    ${end_date ? 'AND DATE(settlement_date) <= ?' : ''}
  `).get(
    ...(hospital_id ? [hospital_id, hospital_id] : []),
    ...(start_date ? [start_date] : []),
    ...(end_date ? [end_date] : [])
  );

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

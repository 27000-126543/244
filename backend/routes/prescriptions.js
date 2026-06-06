import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import db from '../database/db.js';
import { authMiddleware, requireRoles } from '../middleware/auth.js';

const router = express.Router();

function checkStockAndCreateAlert(drugId, quantityNeeded) {
  const drug = db.prepare('SELECT * FROM drugs WHERE id = ?').get(drugId);
  if (!drug) return { status: 'unknown', alert: null };

  const remainingStock = drug.stock - quantityNeeded;
  
  if (remainingStock <= 0) {
    const existingAlert = db.prepare(`
      SELECT * FROM stock_alerts 
      WHERE drug_id = ? AND status = 'pending'
    `).get(drugId);

    if (!existingAlert) {
      const alertId = uuidv4();
      db.prepare(`
        INSERT INTO stock_alerts (id, drug_id, drug_name, current_stock, min_stock, notified_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
      `).run(alertId, drugId, drug.name, drug.stock, drug.min_stock);

      return { status: 'shortage', alert: alertId };
    }
    return { status: 'shortage', alert: existingAlert.id };
  } else if (remainingStock <= drug.min_stock) {
    const existingAlert = db.prepare(`
      SELECT * FROM stock_alerts 
      WHERE drug_id = ? AND status = 'pending'
    `).get(drugId);

    if (!existingAlert) {
      const alertId = uuidv4();
      db.prepare(`
        INSERT INTO stock_alerts (id, drug_id, drug_name, current_stock, min_stock, notified_at)
        VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'))
      `).run(alertId, drugId, drug.name, remainingStock, drug.min_stock);

      return { status: 'low', alert: alertId };
    }
    return { status: 'low', alert: existingAlert.id };
  }

  return { status: 'sufficient', alert: null };
}

router.get('/', authMiddleware, (req, res) => {
  const { status, hospital_id, page = 1, pageSize = 20 } = req.query;
  const offset = (page - 1) * pageSize;

  let query = 'SELECT * FROM prescriptions WHERE 1=1';
  let countQuery = 'SELECT COUNT(*) as total FROM prescriptions WHERE 1=1';
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

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(pageSize), offset);

  const prescriptions = db.prepare(query).all(...params);
  const { total } = db.prepare(countQuery).get(...countParams);

  const result = prescriptions.map(p => {
    const items = db.prepare('SELECT * FROM prescription_items WHERE prescription_id = ?').all(p.id);
    return { ...p, items };
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
  const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);

  if (!prescription) {
    return res.status(404).json({ message: '处方不存在' });
  }

  const items = db.prepare('SELECT * FROM prescription_items WHERE prescription_id = ?').all(id);

  res.json({ ...prescription, items });
});

router.post('/', authMiddleware, requireRoles('grassroots_doctor', 'senior_doctor'), (req, res) => {
  const {
    patient_id, patient_name, hospital_id, hospital_name,
    department_id, department_name, diagnosis, items
  } = req.body;

  const id = uuidv4();
  const userId = req.user.id;
  const userName = req.user.name;

  let totalAmount = 0;
  const prescriptionItems = [];
  const stockAlerts = [];

  if (items && items.length > 0) {
    items.forEach(item => {
      const subtotal = item.quantity * item.unit_price;
      totalAmount += subtotal;

      const stockResult = checkStockAndCreateAlert(item.drug_id, item.quantity);
      if (stockResult.alert) {
        stockAlerts.push(stockResult.alert);
      }

      prescriptionItems.push({
        ...item,
        subtotal,
        stock_status: stockResult.status
      });
    });
  }

  db.prepare(`
    INSERT INTO prescriptions 
    (id, patient_id, patient_name, hospital_id, hospital_name,
     department_id, department_name, doctor_id, doctor_name,
     diagnosis, total_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    id, patient_id, patient_name, hospital_id, hospital_name,
    department_id, department_name, userId, userName,
    diagnosis, totalAmount
  );

  const insertItem = db.prepare(`
    INSERT INTO prescription_items 
    (id, prescription_id, drug_id, drug_name, specification, dosage,
     quantity, unit_price, subtotal, stock_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  prescriptionItems.forEach(item => {
    insertItem.run(
      uuidv4(), id, item.drug_id, item.drug_name, item.specification || '',
      item.dosage || '', item.quantity, item.unit_price, item.subtotal, item.stock_status
    );

    db.prepare(`
      UPDATE drugs 
      SET stock = stock - ? 
      WHERE id = ?
    `).run(item.quantity, item.drug_id);
  });

  res.status(201).json({
    message: '处方创建成功',
    id,
    total_amount: totalAmount,
    stock_alerts: stockAlerts
  });
});

router.post('/:id/transfer', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { pharmacy_name } = req.body;

  const prescription = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id);
  if (!prescription) {
    return res.status(404).json({ message: '处方不存在' });
  }

  db.prepare(`
    UPDATE prescriptions 
    SET is_transferred = 1, transferred_to_pharmacy = ?, status = 'transferred'
    WHERE id = ?
  `).run(pharmacy_name || '医共体中心药房', id);

  res.json({ message: '处方已流转至药房' });
});

router.get('/drugs/stock-alerts', authMiddleware, (req, res) => {
  const { status } = req.query;

  let query = 'SELECT * FROM stock_alerts WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  const alerts = db.prepare(query).all(...params);

  res.json({ data: alerts });
});

router.post('/drugs/stock-alerts/:id/notify', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.prepare(`
    UPDATE stock_alerts 
    SET notified_at = datetime('now', 'localtime')
    WHERE id = ?
  `).run(id);

  res.json({ message: '已通知配送中心' });
});

router.post('/drugs/stock-alerts/:id/handle', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.prepare(`
    UPDATE stock_alerts 
    SET status = 'handled', handled_at = datetime('now', 'localtime'), handled_by = ?
    WHERE id = ?
  `).run(req.user.name, id);

  res.json({ message: '预警已处理' });
});

router.get('/drugs/list', authMiddleware, (req, res) => {
  const { keyword, low_stock } = req.query;

  let query = 'SELECT * FROM drugs WHERE 1=1';
  const params = [];

  if (keyword) {
    query += ' AND name LIKE ?';
    params.push(`%${keyword}%`);
  }

  if (low_stock === 'true') {
    query += ' AND stock <= min_stock';
  }

  query += ' ORDER BY name ASC';

  const drugs = db.prepare(query).all(...params);

  res.json({ data: drugs });
});

export default router;

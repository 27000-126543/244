import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import referralRoutes from './routes/referrals.js';
import consultationRoutes from './routes/consultations.js';
import examinationRoutes from './routes/examinations.js';
import prescriptionRoutes from './routes/prescriptions.js';
import settlementRoutes from './routes/settlements.js';
import dashboardRoutes from './routes/dashboard.js';
import commonRoutes from './routes/common.js';

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/examinations', examinationRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/common', commonRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '医共体平台后端服务运行正常',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    message: '服务器内部错误', 
    error: err.message 
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'API接口不存在' });
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🏥 医共体综合服务与资源调度平台 - 后端服务              ║
  ║                                                           ║
  ║   🚀 服务已启动: http://localhost:3005                    ║
  ║                                                           ║
  ║   📚 API文档:                                             ║
  ║      - 认证:      POST /api/auth/login                    ║
  ║      - 转诊:      GET  /api/referrals                     ║
  ║      - 会诊:      GET  /api/consultations                 ║
  ║      - 检查:      GET  /api/examinations                  ║
  ║      - 处方:      GET  /api/prescriptions                 ║
  ║      - 结算:      GET  /api/settlements                   ║
  ║      - 大屏数据:  GET  /api/dashboard/stats               ║
  ║      - 基础数据:  GET  /api/common/hospitals              ║
  ║                                                           ║
  ║   👤 测试账号:                                             ║
  ║      - 基层医生: grassroots1 / 123456                     ║
  ║      - 上级医生: senior1 / 123456                         ║
  ║      - 科室主任: director1 / 123456                       ║
  ║      - 医务科:   medical1 / 123456                        ║
  ║      - 管理员:   admin / 123456                           ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;

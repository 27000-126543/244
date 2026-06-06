import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const { password: _, ...userWithoutPassword } = user;

  res.json({
    message: '登录成功',
    token,
    user: userWithoutPassword
  });
});

router.post('/logout', (req, res) => {
  res.json({ message: '登出成功' });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未认证' });
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username, name, role, hospital_id, department_id, phone, avatar, created_at FROM users WHERE id = ?').get(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: '认证令牌无效' });
  }
});

export default router;

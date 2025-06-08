const router = require('express').Router();
const authService = require('../services/auth.service');
const rateLimit = require('express-rate-limit');
const AuditLog = require('../models/auditLog.model');

// 增加登录频率限制
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次尝试
  message: '尝试次数过多，请稍后再试'
});

// 用户登录
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { token, user } = await authService.login(
      req.body.username,
      req.body.password
    );
    // 增加审计日志记录
    const audit = new AuditLog({
      user: user?._id,
      action_type: 'login_attempt',
      ip_address: req.ip
    });
    await audit.save();
    res.json({ token, user: { ...user.toObject(), password_hash: undefined } });
  } catch (error) {
    res.status(401).json({ error: '认证失败' });
  }
});

// 获取当前用户信息
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
}); 
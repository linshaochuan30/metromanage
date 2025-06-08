const router = require('express').Router();
const { authenticate, checkPermission } = require('../middlewares/auth');

// 获取用户列表（需要user:read权限）
router.get('/users', 
  authenticate,
  checkPermission('user:read'),
  async (req, res) => {
    const users = await User.find().select('-password_hash');
    res.json(users);
  }
); 
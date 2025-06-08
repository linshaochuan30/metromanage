const router = require('express').Router();
const { checkPermission } = require('../middlewares/auth');

// 获取用户列表
router.get('/', 
  checkPermission('user:read'),
  async (req, res) => {
    const users = await User.find()
      .select('-password_hash')
      .populate('roles', 'name');
    res.json(users);
  }
);

// 创建用户
router.post('/',
  checkPermission('user:write'),
  async (req, res) => {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  }
); 
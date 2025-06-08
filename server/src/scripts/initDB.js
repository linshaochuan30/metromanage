const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const init = async () => {
  // 创建基础权限
  const permissions = await Permission.create([
    { code: 'user:read', description: '查看用户' },
    { code: 'user:write', description: '管理用户' },
    { code: 'role:manage', description: '角色管理' },
    { code: 'dashboard:view', description: '查看仪表盘' }
  ]);

  // 创建管理员角色
  const adminRole = await Role.create({
    name: 'admin',
    description: '系统管理员',
    permissions: permissions.map(p => p._id)
  });

  // 创建初始管理员用户
  await User.create({
    username: 'admin',
    password_hash: '临时密码123', // 首次登录后需修改
    email: 'admin@example.com',
    roles: [adminRole._id]
  });

  console.log('数据库初始化完成');
};

mongoose.connect(process.env.MONGODB_URI)
  .then(() => init())
  .catch(err => console.error('初始化失败:', err))
  .finally(() => process.exit()); 
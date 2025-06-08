const bcrypt = require('bcrypt');

class UserService {
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) throw new Error('用户不存在');
    
    // 验证旧密码
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) throw new Error('当前密码不正确');

    // 更新密码
    user.password_hash = newPassword;
    await user.save();
    
    // 记录密码修改日志
    await AuditLog.create({
      user: userId,
      action_type: 'change_password',
      ip_address: req.ip
    });

    return true;
  }
} 
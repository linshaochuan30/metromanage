const UserService = require('../services/user.service');

router.post('/change-password',
  authenticate,
  checkPermission('user:write'), // 需要修改自身密码的权限
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      await UserService.changePassword(req.user._id, oldPassword, newPassword);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
); 
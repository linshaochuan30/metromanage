const jwt = require('jsonwebtoken');

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user || decoded.iat < Math.floor(user.password_changed_at / 1000)) {
      throw new Error('会话已过期');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: '请重新登录' });
  }
};

exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    const hasPermission = await authService.authorize(req.user, permission);
    if (!hasPermission) {
      return res.status(403).send({ error: '权限不足' });
    }
    next();
  };
}; 
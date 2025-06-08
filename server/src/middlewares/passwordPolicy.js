const zxcvbn = require('zxcvbn');

module.exports = (minStrength = 3) => {
  return (req, res, next) => {
    const { newPassword } = req.body;
    
    // 密码强度检查
    const { score } = zxcvbn(newPassword);
    if (score < minStrength) {
      return res.status(400).json({
        error: '密码强度不足，请使用更复杂的组合'
      });
    }

    // 历史密码检查（需实现密码历史记录功能）
    // ... 

    next();
  };
}; 
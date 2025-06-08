const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const Role = require('../models/Role');

class AuthService {
  async login(username, password) {
    const user = await User.findOne({ username }).populate('roles');
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new Error('Invalid credentials');
    }
    
    const token = jwt.sign(
      { userId: user._id, roles: user.roles.map(r => r.name) },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    user.last_login = new Date();
    await user.save();
    
    return { token, user };
  }

  async authorize(user, requiredPermission) {
    const roleIds = user.roles.map(r => r._id);
    const roles = await Role.find({ _id: { $in: roleIds } }).populate('permissions');
    
    return roles.some(role => 
      role.permissions.some(p => p.code === requiredPermission)
    );
  }
}

module.exports = new AuthService(); 
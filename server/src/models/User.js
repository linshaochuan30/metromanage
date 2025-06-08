const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  email: { type: String, unique: true },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  last_login: Date,
  password_changed_at: Date
}, { timestamps: true });

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (this.isModified('password_hash')) {
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
    this.password_changed_at = Date.now();
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 
import { useState } from 'react';
import client from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (form.newPassword !== form.confirmPassword) {
      setError('新密码与确认密码不一致');
      return false;
    }
    if (form.newPassword.length < 8) {
      setError('密码长度至少8位');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await client.post('/users/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword
      });
      
      // 强制登出
      localStorage.removeItem('authToken');
      // 跳转登录页并携带状态
      navigate('/login', {
        state: { 
          message: '密码已修改，请重新登录',
          username: form.username 
        }
      });
    } catch (err) {
      setError(err.response?.data?.error || '密码修改失败');
    }
  };

  return (
    <div className="password-form">
      {success && <div className="success">密码修改成功！</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="当前密码"
          value={form.oldPassword}
          onChange={e => setForm({...form, oldPassword: e.target.value})}
        />
        <input
          type="password"
          placeholder="新密码（至少8位）"
          value={form.newPassword}
          onChange={e => setForm({...form, newPassword: e.target.value})}
        />
        <input
          type="password"
          placeholder确认新密码"
          value={form.confirmPassword}
          onChange={e => setForm({...form, confirmPassword: e.target.value})}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">提交修改</button>
      </form>
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client';

interface LoginPageProps {
  onLogin?: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [form, setForm] = useState({ 
    username: '', 
    password: '' 
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // 如果有路由状态传递的用户名，设置到表单中
  useEffect(() => {
    if (location.state?.username) {
      setForm(prev => ({ ...prev, username: location.state.username }));
    }
  }, [location.state?.username]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const { data } = await client.post('/auth/login', form);
      localStorage.setItem('authToken', data.token);
      onLogin?.(); // 调用登录成功回调
      navigate('/dashboard');
    } catch (err) {
      setError('登录失败，请检查用户名和密码');
    }
  };

  return (
    <div className="login-container">
      <h1>地铁机电设备调试系统</h1>
      {location.state?.message && (
        <div className="alert alert-info">
          {location.state.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <input
            type="text"
            value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
            placeholder="用户名"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
            placeholder="密码"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="login-btn">登录</button>
      </form>
    </div>
  );
} 
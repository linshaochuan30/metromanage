import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function LoginPage({ onLogin }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));
        onLogin?.(); // 调用登录成功回调
        navigate('/');
      } else {
        throw new Error('API login failed');
      }
    } catch (err) {
      // 本地存储模式
      const savedUsers = localStorage.getItem('adminUsers');
      let users = [];
      
      try {
        users = JSON.parse(savedUsers || '[]');
      } catch (error) {
        console.error('解析用户数据失败:', error);
      }
      
      const user = users.find(u => 
        u.username === form.username && 
        u.password === form.password &&
        u.status === 'active'  // 只允许状态为active的用户登录
      );
      
      if (user) {
        const userInfo = {
          ...user,
          password: undefined  // 不保存密码到userInfo中
        };
        localStorage.setItem('authToken', 'local-storage-token');
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        onLogin?.();
        navigate('/');
      } else {
        setError('登录失败，请检查用户名和密码');
      }
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
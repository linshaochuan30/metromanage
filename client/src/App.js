import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate
} from 'react-router-dom';
import {
  Layout,
  Menu,
  Typography,
  ConfigProvider,
  Button
} from 'antd';
import {
  AppstoreOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import ProblemLibrary from './pages/ProblemLibrary';
import LoginPage from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

// 检查用户是否已登录
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('authToken')
  );

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return { isAuthenticated, setIsAuthenticated, logout };
};

// 获取用户信息
const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || '{}');
  } catch {
    return {};
  }
};

// 导航组件
const Navigation = ({ onLogout }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      key: '/',
      icon: <AppstoreOutlined />,
      label: <Link to="/">仪表盘</Link>,
    },
    {
      key: '/problems',
      icon: <DatabaseOutlined />,
      label: <Link to="/problems">问题库管理</Link>,
    }
  ];

  return (
    <Header>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <Title 
          level={3} 
          style={{ 
            color: 'white', 
            margin: 0,
            fontWeight: 'bold'
          }}
        >
          🚇 地铁机电设备调试系统问题管理
        </Title>
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            flex: 1, 
            minWidth: 0,
              marginRight: 16
          }}
        />
          <Button 
            type="text" 
            icon={<LogoutOutlined />}
            onClick={onLogout}
            style={{ color: 'white' }}
          >
            退出登录
          </Button>
        </div>
      </div>
    </Header>
  );
};

// 受保护的路由组件
const ProtectedLayout = ({ children, onLogout }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navigation onLogout={onLogout} />
      <Content style={{ minHeight: 'calc(100vh - 134px)' }}>
        {children}
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        地铁机电设备调试系统问题管理 ©2024 Created by AI Assistant
      </Footer>
    </Layout>
  );
};

// 根据用户角色决定默认跳转页面
const getDefaultRoute = () => {
  const userInfo = getUserInfo();
  // 如果是管理员，跳转到后台管理
  if (userInfo.role === 'admin') {
    return '/admin';
  }
  // 其他用户跳转到业务仪表盘
  return '/dashboard';
};

function App() {
  const { isAuthenticated, setIsAuthenticated, logout } = useAuth();

  // 监听存储变化，同步登录状态
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('authToken'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setIsAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#E30613',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          borderRadius: 6,
        },
      }}
    >
      <Router>
            <Routes>
          {/* 登录路由 */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to={getDefaultRoute()} replace /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          
          {/* 后台管理路由 - 仅管理员可访问 */}
          <Route 
            path="/admin" 
            element={
              isAuthenticated ? 
                (getUserInfo().role === 'admin' ? 
                  <AdminDashboard /> : 
                  <Navigate to="/dashboard" replace />
                ) :
                <Navigate to="/login" replace />
            } 
          />
          
          {/* 业务系统路由 */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <ProtectedLayout onLogout={logout}>
                  <Dashboard />
                </ProtectedLayout> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/problems" 
            element={
              isAuthenticated ? 
                <ProtectedLayout onLogout={logout}>
                  <ProblemLibrary />
                </ProtectedLayout> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* 根路由重定向 */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to={getDefaultRoute()} replace /> : 
                <Navigate to="/login" replace />
            } 
          />
          
          {/* 默认重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App; 
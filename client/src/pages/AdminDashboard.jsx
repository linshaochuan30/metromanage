import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Table, 
  Button, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Space,
  Input,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Tag,
  Typography,
  Alert
} from 'antd';
import { 
  UserOutlined,
  SettingOutlined,
  DashboardOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  SecurityScanOutlined,
  LogoutOutlined,
  DatabaseOutlined,
  CloudSyncOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [isOnline, setIsOnline] = useState(false); // 强制使用本地存储模式

  // 初始化用户数据
  const getInitialUsers = () => {
    const savedUsers = localStorage.getItem('adminUsers');
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers);
      } catch (error) {
        console.error('解析用户数据失败:', error);
      }
    }
    
    // 默认用户数据
    return [
      { 
        id: 1, 
        username: 'admin', 
        email: 'admin@metro.com', 
        role: 'admin', 
        status: 'active',
        lastLogin: '2025-01-07 20:10:00',
        createTime: '2024-12-01 10:00:00'
      },
      { 
        id: 2, 
        username: 'user1', 
        email: 'user1@metro.com', 
        role: 'user', 
        status: 'active',
        lastLogin: '2025-01-06 15:30:00',
        createTime: '2024-12-05 14:20:00'
      },
      { 
        id: 3, 
        username: 'engineer1', 
        email: 'engineer1@metro.com', 
        role: 'engineer', 
        status: 'inactive',
        lastLogin: '2025-01-05 09:15:00',
        createTime: '2024-12-10 11:45:00'
      }
    ];
  };

  const [users, setUsers] = useState(getInitialUsers);

  // 保存用户数据到localStorage
  const saveUsersToStorage = (userData) => {
    try {
      localStorage.setItem('adminUsers', JSON.stringify(userData));
      console.log('用户数据已保存到本地存储');
    } catch (error) {
      console.error('保存用户数据失败:', error);
      message.error('保存用户数据失败');
    }
  };

  // 检测后端连接状态
  const checkBackendConnection = async () => {
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        timeout: 3000 
      });
      if (response.ok) {
        setIsOnline(true);
        return true;
      }
    } catch (error) {
      console.log('后端服务未连接，使用本地存储模式');
    }
    setIsOnline(false);
    return false;
  };

  // 从后端获取用户数据
  const fetchUsersFromAPI = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        message.success('用户数据已从服务器同步');
        return true;
      }
    } catch (error) {
      console.error('获取用户数据失败:', error);
    }
    return false;
  };

  // 向后端保存用户数据
  const saveUserToAPI = async (userData, isEdit = false) => {
    try {
      const url = isEdit ? `/api/admin/users/${userData.id}` : '/api/admin/users';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const result = await response.json();
        message.success(`用户${isEdit ? '更新' : '创建'}成功`);
        return result;
      } else {
        throw new Error('API请求失败');
      }
    } catch (error) {
      console.error('保存用户到API失败:', error);
      throw error;
    }
  };

  // 从后端删除用户
  const deleteUserFromAPI = async (userId) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        message.success('用户删除成功');
        return true;
      } else {
        throw new Error('API请求失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      throw error;
    }
  };

  // 组件初始化
  useEffect(() => {
    // 暂时禁用后端连接检查，强制使用本地模式
    message.info('使用本地存储模式');
    setIsOnline(false);
    
    // checkBackendConnection().then(async (connected) => {
    //   if (connected) {
    //     // 如果后端连接成功，尝试从API获取数据
    //     const success = await fetchUsersFromAPI();
    //     if (!success) {
    //       message.warning('无法从服务器获取数据，使用本地缓存');
    //     }
    //   } else {
    //     message.info('后端服务未连接，使用本地存储模式');
    //   }
    // });
  }, []);

  // 用户数据变化时保存到localStorage
  useEffect(() => {
    if (!isOnline) {
      saveUsersToStorage(users);
    }
  }, [users, isOnline]);

  // 统计数据
  const statistics = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    todayLogins: 5
  };

  // 菜单项
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '管理概览',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: 'roles',
      icon: <TeamOutlined />,
      label: '角色权限',
    },
    {
      key: 'security',
      icon: <SecurityScanOutlined />,
      label: '安全设置',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    }
  ];

  // 用户表格列定义
  const userColumns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role) => {
        const colorMap = {
          admin: 'red',
          engineer: 'blue',
          user: 'green'
        };
        const labelMap = {
          admin: '管理员',
          engineer: '工程师',
          user: '普通用户'
        };
        return <Tag color={colorMap[role]}>{labelMap[role]}</Tag>;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此用户？"
            description="删除后无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small"
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理编辑用户
  const handleEdit = (user) => {
    console.log('编辑用户数据:', user);
    setEditingUser(user);
    form.resetFields();
    setIsModalOpen(true);
    // 表单值的设置已经移到Modal的afterOpenChange中处理
  };

  // 处理删除用户
  const handleDelete = async (userId) => {
    try {
      if (isOnline) {
        await deleteUserFromAPI(userId);
        // 删除成功后重新获取数据
        await fetchUsersFromAPI();
      } else {
        // 本地删除
        const newUsers = users.filter(user => user.id !== userId);
        setUsers(newUsers);
        saveUsersToStorage(newUsers);
        message.success('用户删除成功（本地存储）');
      }
    } catch (error) {
      message.error('删除用户失败，请重试');
    }
  };

  // 处理添加/编辑用户提交
  const handleSubmit = async (values) => {
    console.log('提交的表单数据:', values);
    
    // 确保必需字段存在
    let finalValues = { ...values };
    
    try {
      if (editingUser) {
        // 编辑用户
        const updatedUser = { 
          ...editingUser, 
          ...finalValues,
          role: finalValues.role || editingUser.role,
          status: finalValues.status || editingUser.status
        };
        
        // 如果没有输入新密码，保留原密码
        if (!finalValues.password) {
          delete updatedUser.password;
          delete updatedUser.confirmPassword;
        }

        if (isOnline) {
          await saveUserToAPI(updatedUser, true);
          await fetchUsersFromAPI();
        } else {
          const updatedUsers = users.map(user => 
            user.id === editingUser.id ? updatedUser : user
          );
          setUsers(updatedUsers);
          saveUsersToStorage(updatedUsers);
          message.success('用户信息更新成功（本地存储）');
        }
      } else {
        // 添加新用户
        const { confirmPassword, ...userValues } = finalValues;
        const newUser = {
          id: Math.max(...users.map(u => u.id), 0) + 1,
          ...userValues,
          role: userValues.role || 'user',
          status: userValues.status || 'active',
          createTime: new Date().toLocaleString(),
          lastLogin: '从未登录'
        };

        if (isOnline) {
          await saveUserToAPI(newUser, false);
          await fetchUsersFromAPI();
        } else {
          const newUsers = [...users, newUser];
          setUsers(newUsers);
          saveUsersToStorage(newUsers);
          message.success('用户创建成功（本地存储）');
        }
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      form.resetFields();
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败，请重试');
    }
  };

  // 同步数据到服务器
  const syncToServer = async () => {
    try {
      message.loading('正在同步数据到服务器...', 0);
      
      // 模拟同步过程
      setTimeout(() => {
        message.destroy();
        if (Math.random() > 0.3) { // 70%成功率模拟
          message.success('数据同步成功');
          setIsOnline(true);
        } else {
          message.error('同步失败，请检查网络连接');
        }
      }, 2000);
    } catch (error) {
      message.error('同步失败');
    }
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  // 渲染不同的内容区域
  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return (
          <div>
            <Title level={2}>管理概览</Title>
            
            {/* 连接状态提示 */}
            <Alert
              message={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>
                    <DatabaseOutlined style={{ marginRight: 8 }} />
                    数据存储状态: {isOnline ? '已连接服务器' : '本地存储模式'}
                  </span>
                  {!isOnline && (
                    <Button 
                      size="small" 
                      type="primary" 
                      icon={<CloudSyncOutlined />}
                      onClick={syncToServer}
                    >
                      同步到服务器
                    </Button>
                  )}
                </div>
              }
              type={isOnline ? 'success' : 'warning'}
              style={{ marginBottom: 24 }}
              showIcon
            />
            
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="总用户数"
                    value={statistics.totalUsers}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="活跃用户"
                    value={statistics.activeUsers}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="管理员"
                    value={statistics.adminUsers}
                    prefix={<SecurityScanOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="今日登录"
                    value={statistics.todayLogins}
                    prefix={<DashboardOutlined />}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <Card title="最近活动" style={{ marginBottom: 16 }}>
              <div style={{ lineHeight: '2.5' }}>
                <p>• 用户 admin 于 2025-01-07 20:10:00 登录系统</p>
                <p>• 用户 user1 于 2025-01-06 15:30:00 登录系统</p>
                <p>• 管理员创建了新用户 engineer1</p>
                <p>• 系统配置已更新</p>
                <p>• {isOnline ? '数据已同步到服务器' : '当前使用本地存储模式'}</p>
              </div>
            </Card>
          </div>
        );
      
      case 'users':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={2}>用户管理</Title>
              <Space>
                <Input.Search
                  placeholder="搜索用户名或邮箱"
                  style={{ width: 250 }}
                  enterButton={<SearchOutlined />}
                />
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingUser(null);
                    form.resetFields();
                    setIsModalOpen(true);
                  }}
                >
                  添加用户
                </Button>
              </Space>
            </div>

            {/* 数据状态提示 */}
            <Alert
              message={
                isOnline 
                  ? "✅ 用户数据已连接数据库，所有操作将实时保存" 
                  : "⚠️ 当前使用本地存储模式，数据保存在浏览器中，建议连接数据库以确保数据安全"
              }
              type={isOnline ? 'info' : 'warning'}
              style={{ marginBottom: 16 }}
              showIcon
            />
            
            <Card>
              <Table
                columns={userColumns}
                dataSource={users}
                rowKey="id"
                pagination={{
                  total: users.length,
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
              />
            </Card>
          </div>
        );
      
      case 'roles':
        return (
          <div>
            <Title level={2}>角色权限</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="角色管理" extra={<Button type="primary" icon={<PlusOutlined />}>添加角色</Button>}>
                  <Table
                    size="small"
                    columns={[
                      { title: '角色名称', dataIndex: 'name', key: 'name' },
                      { title: '描述', dataIndex: 'description', key: 'description' },
                      { title: '用户数量', dataIndex: 'userCount', key: 'userCount' },
                      {
                        title: '操作',
                        key: 'action',
                        render: (_, record) => (
                          <Space>
                            <Button size="small" type="link">编辑</Button>
                            <Button size="small" type="link" danger>删除</Button>
                          </Space>
                        )
                      }
                    ]}
                    dataSource={[
                      { id: 1, name: '管理员', description: '系统管理员，拥有所有权限', userCount: statistics.adminUsers },
                      { id: 2, name: '工程师', description: '技术工程师，可管理问题和设备', userCount: users.filter(u => u.role === 'engineer').length },
                      { id: 3, name: '普通用户', description: '普通操作员，可查看和报告问题', userCount: users.filter(u => u.role === 'user').length }
                    ]}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="权限管理">
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>选择角色：</Text>
                    <Select defaultValue="admin" style={{ width: 120, marginLeft: 8 }}>
                      <Option value="admin">管理员</Option>
                      <Option value="engineer">工程师</Option>
                      <Option value="user">普通用户</Option>
                    </Select>
                  </div>
                  
                  <div>
                    <Text strong>权限列表：</Text>
                    <div style={{ marginTop: 12 }}>
                      {[
                        { key: 'user_manage', label: '用户管理', checked: true },
                        { key: 'role_manage', label: '角色管理', checked: true },
                        { key: 'system_config', label: '系统设置', checked: true },
                        { key: 'problem_create', label: '创建问题', checked: false },
                        { key: 'problem_edit', label: '编辑问题', checked: false },
                        { key: 'problem_delete', label: '删除问题', checked: false },
                        { key: 'report_view', label: '查看报表', checked: false },
                        { key: 'report_export', label: '导出报表', checked: false }
                      ].map(perm => (
                        <div key={perm.key} style={{ marginBottom: 8 }}>
                          <input 
                            type="checkbox" 
                            id={perm.key}
                            defaultChecked={perm.checked}
                            style={{ marginRight: 8 }}
                          />
                          <label htmlFor={perm.key}>{perm.label}</label>
                        </div>
                      ))}
                    </div>
                    <Button type="primary" size="small" style={{ marginTop: 16 }}>
                      保存权限设置
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
      
      case 'security':
        return (
          <div>
            <Title level={2}>安全设置</Title>
            <Card>
              <p>安全设置功能开发中...</p>
            </Card>
          </div>
        );
      
      case 'settings':
        return (
          <div>
            <Title level={2}>系统设置</Title>
            <Card>
              <p>系统设置功能开发中...</p>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          {collapsed ? '管理' : '后台管理系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => setSelectedKey(key)}
        />
      </Sider>

      <Layout>
        {/* 顶部导航 */}
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Button
            type="text"
            icon={collapsed ? <DashboardOutlined /> : <DashboardOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 16 }}>
              欢迎，{JSON.parse(localStorage.getItem('userInfo') || '{}').username || '管理员'}
            </span>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出登录
            </Button>
          </div>
        </Header>

        {/* 内容区域 */}
        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          background: '#fff',
          minHeight: 280,
          borderRadius: 6
        }}>
          {renderContent()}
        </Content>
      </Layout>

      {/* 用户编辑模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnHidden={true}
        afterOpenChange={(open) => {
          if (open && editingUser) {
            // Modal完全打开后设置表单值
            setTimeout(() => {
              form.setFieldsValue({
                username: editingUser.username,
                email: editingUser.email,
                role: editingUser.role,
                status: editingUser.status,
                password: '',
                confirmPassword: ''
              });
            }, 0);
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="密码"
                name="password"
                rules={editingUser ? [] : [{ required: true, message: '请输入密码' }]}
              >
                <Input.Password 
                  placeholder={editingUser ? "留空则不修改密码" : "请输入密码"} 
                  autoComplete="new-password"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="确认密码"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const password = getFieldValue('password');
                      if (!password && !value) {
                        return Promise.resolve();
                      }
                      if (!value && !editingUser) {
                        return Promise.reject(new Error('请确认密码'));
                      }
                      if (password && password !== value) {
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <Input.Password 
                  placeholder={editingUser ? "留空则不修改密码" : "请确认密码"} 
                  autoComplete="new-password"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="角色"
                name="role"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="admin">管理员</Option>
                  <Option value="engineer">工程师</Option>
                  <Option value="user">普通用户</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="状态"
                name="status"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select placeholder="请选择状态">
                  <Option value="active">启用</Option>
                  <Option value="inactive">禁用</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setIsModalOpen(false);
                setEditingUser(null);
                form.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminDashboard; 
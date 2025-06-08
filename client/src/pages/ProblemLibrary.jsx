import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Table, 
  Tag, 
  Button, 
  Space, 
  Input, 
  message,
  Tooltip,
  Modal
} from 'antd';
import { 
  PlusOutlined, 
  FilterOutlined, 
  ExportOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined
} from '@ant-design/icons';
import ProblemForm from '../components/ProblemForm';
import ProblemDetail from '../components/ProblemDetail';
import AdvancedFilter from '../components/AdvancedFilter';

const { Search } = Input;
const { confirm } = Modal;

// API基础URL
const API_BASE_URL = 'http://localhost:5001';

const ProblemLibrary = () => {
  // 状态管理
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 弹窗状态
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  
  // 编辑状态
  const [editingProblem, setEditingProblem] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  
  // 数据源状态
  const [dataSource, setDataSource] = useState('local'); // 'api' 或 'local'

  // 初始化数据
  useEffect(() => {
    fetchProblems();
  }, []);

  // 获取问题列表
  const fetchProblems = async (filters = {}) => {
    setLoading(true);
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      // 尝试从后端API获取数据
      const response = await fetch(`${API_BASE_URL}/api/problems?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setProblems(data);
        setFilteredProblems(data);
        setDataSource('api');
        
        // 同步到本地存储作为备份
        localStorage.setItem('problems', JSON.stringify(data));
        localStorage.setItem('problemsLastUpdated', new Date().toISOString());
        
        message.success('成功从服务器获取数据');
        return;
      }
      
      throw new Error('API请求失败');
    } catch (error) {
      console.error('获取问题列表失败:', error);
      // 如果API请求失败，尝试从本地存储获取数据
      const savedProblems = localStorage.getItem('problems');
      if (savedProblems) {
        try {
          const data = JSON.parse(savedProblems);
          setProblems(data);
          setFilteredProblems(data);
          setDataSource('local');
          message.warning('使用本地缓存数据（服务器连接失败）');
        } catch (e) {
          console.error('解析本地数据失败:', e);
          loadDefaultData();
        }
      } else {
        loadDefaultData();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 加载默认数据
  const loadDefaultData = () => {
    const defaultProblems = [
      {
        id: 1,
        location: "11号线徐家汇站环控机房",
        profession: "机电",
        description: "空调系统制冷效果不佳",
        category: "B类",
        responsible: "设备商",
        deadline: new Date(Date.now() + 24*60*60*1000).toISOString(),
        status: "待处理",
        createTime: new Date().toISOString()
      },
      {
        id: 2,
        location: "2号线人民广场站信号机房",
        profession: "信号",
        description: "信号系统显示异常",
        category: "A类",
        responsible: "设备商",
        deadline: new Date(Date.now() + 48*60*60*1000).toISOString(),
        status: "处理中",
        createTime: new Date(Date.now() - 2*24*60*60*1000).toISOString()
      },
      {
        id: 3,
        location: "10号线新天地站站台",
        profession: "站台门",
        description: "3号站台门关闭不完全",
        category: "A类",
        responsible: "维保单位",
        deadline: new Date(Date.now() + 24*60*60*1000).toISOString(),
        status: "待处理",
        createTime: new Date(Date.now() - 24*60*60*1000).toISOString()
      },
      {
        id: 4,
        location: "7号线静安寺站通信机房",
        profession: "通信",
        description: "广播系统音量过低",
        category: "C类",
        responsible: "运营单位",
        deadline: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
        status: "已解决",
        createTime: new Date(Date.now() - 5*24*60*60*1000).toISOString()
      },
      {
        id: 5,
        location: "11号线老西门站通信机房",
        profession: "通信",
        description: "光纤链路不稳定，数据传输时有中断",
        category: "B类",
        responsible: "施工方",
        deadline: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
        status: "已超期",
        createTime: new Date(Date.now() - 10*24*60*60*1000).toISOString()
      }
    ];
    setProblems(defaultProblems);
    setFilteredProblems(defaultProblems);
    setDataSource('local');
    localStorage.setItem('problems', JSON.stringify(defaultProblems));
    localStorage.setItem('problemsLastUpdated', new Date().toISOString());
    message.info('使用默认数据（服务器连接失败）');
  };

  // 搜索功能
  const handleSearch = (value) => {
    if (!value) {
      setFilteredProblems(problems);
      return;
    }
    
    const filtered = problems.filter(problem => 
      problem.description.toLowerCase().includes(value.toLowerCase()) ||
      problem.location.toLowerCase().includes(value.toLowerCase()) ||
      problem.profession.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProblems(filtered);
  };

  // 筛选功能
  const handleFilter = (filters) => {
    fetchProblems(filters);
    setFilterVisible(false);
  };

  // 重置筛选
  const handleResetFilter = () => {
    fetchProblems();
  };

  // 新建问题
  const handleCreateProblem = () => {
    setEditingProblem(null);
    setFormVisible(true);
  };

  // 编辑问题
  const handleEditProblem = (problem) => {
    setEditingProblem(problem);
    setFormVisible(true);
  };

  // 查看详情
  const handleViewDetail = async (problemId) => {
    try {
      // 先尝试从API获取详情
      if (dataSource === 'api') {
        try {
          const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}`);
          if (response.ok) {
            const data = await response.json();
            setSelectedProblem(data);
            setDetailVisible(true);
            return;
          }
        } catch (error) {
          console.error('从API获取问题详情失败:', error);
        }
      }
      
      // 如果API获取失败或使用本地数据，从本地获取
      const problem = problems.find(p => p.id === problemId);
      if (problem) {
        setSelectedProblem(problem);
        setDetailVisible(true);
      } else {
        message.error('获取问题详情失败');
      }
    } catch (error) {
      message.error('获取问题详情失败');
    }
  };

  // 删除问题
  const handleDeleteProblem = async (problemId) => {
    confirm({
      title: '确定要删除这个问题吗?',
      icon: <ExclamationCircleOutlined />,
      content: '删除后将无法恢复',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          if (dataSource === 'api') {
            // 尝试从API删除
            try {
              const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}`, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                message.success('问题删除成功');
                fetchProblems();
                return;
              }
              throw new Error('API删除失败');
            } catch (error) {
              console.error('API删除失败:', error);
            }
          }
          
          // 如果API删除失败或使用本地数据，从本地删除
          const updatedProblems = problems.filter(p => p.id !== problemId);
          setProblems(updatedProblems);
          setFilteredProblems(updatedProblems);
          localStorage.setItem('problems', JSON.stringify(updatedProblems));
          message.success('问题删除成功（本地存储）');
        } catch (error) {
          message.error('删除问题失败');
        }
      }
    });
  };

  // 提交表单
  const handleSubmitForm = async (formData) => {
    try {
      if (dataSource === 'api') {
        // 尝试通过API提交
        const url = editingProblem 
          ? `${API_BASE_URL}/api/problems/${editingProblem.id}`
          : `${API_BASE_URL}/api/problems`;
        
        const method = editingProblem ? 'PUT' : 'POST';
        
        try {
          const response = await fetch(url, {
            method,
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(formData)
          });
          
          if (response.ok) {
            await fetchProblems();
            setFormVisible(false);
            message.success(editingProblem ? '问题更新成功' : '问题创建成功');
            return;
          }
          throw new Error('API提交失败');
        } catch (error) {
          console.error('API提交失败:', error);
        }
      }
      
      // 如果API提交失败或使用本地数据，保存到本地存储
      const newProblem = {
        id: editingProblem ? editingProblem.id : Math.max(...problems.map(p => p.id), 0) + 1,
        ...formData,
        createTime: editingProblem ? editingProblem.createTime : new Date().toISOString(),
        status: editingProblem ? formData.status : "待处理"
      };
      
      const updatedProblems = editingProblem
        ? problems.map(p => p.id === editingProblem.id ? newProblem : p)
        : [...problems, newProblem];
      
      setProblems(updatedProblems);
      setFilteredProblems(updatedProblems);
      localStorage.setItem('problems', JSON.stringify(updatedProblems));
      localStorage.setItem('problemsLastUpdated', new Date().toISOString());
      setFormVisible(false);
      message.success(`${editingProblem ? '更新' : '创建'}成功（本地存储）`);
      
      // 如果是API模式但API提交失败，尝试同步到服务器
      if (dataSource === 'api') {
        syncLocalToServer();
      }
    } catch (error) {
      message.error('提交表单失败');
    }
  };

  // 添加回复
  const handleAddReply = async (problemId, content) => {
    try {
      if (dataSource === 'api') {
        try {
          const response = await fetch(`${API_BASE_URL}/api/problems/${problemId}/replies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, operator: '当前用户' })
          });
          
          if (response.ok) {
            // 重新获取问题详情
            const detailResponse = await fetch(`${API_BASE_URL}/api/problems/${problemId}`);
            if (detailResponse.ok) {
              const updatedProblem = await detailResponse.json();
              setSelectedProblem(updatedProblem);
              return;
            }
          }
          throw new Error('API添加回复失败');
        } catch (error) {
          console.error('API添加回复失败:', error);
        }
      }
      
      // 如果API失败或使用本地数据，更新本地数据
      const updatedProblems = problems.map(p => {
        if (p.id === problemId) {
          const replies = p.replies || [];
          const newReply = {
            time: new Date().toISOString(),
            content,
            operator: '当前用户'
          };
          return {
            ...p,
            replies: [...replies, newReply]
          };
        }
        return p;
      });
      
      setProblems(updatedProblems);
      setFilteredProblems(updatedProblems);
      localStorage.setItem('problems', JSON.stringify(updatedProblems));
      
      // 更新选中的问题
      const updatedProblem = updatedProblems.find(p => p.id === problemId);
      setSelectedProblem(updatedProblem);
    } catch (error) {
      message.error('添加回复失败');
      throw error;
    }
  };

  // 导出报表
  const handleExport = () => {
    const csvContent = [
      ['序号', '调试地点', '专业', '问题描述', '问题类别', '责任单位', '整改期限', '问题状态'],
      ...filteredProblems.map(p => [
        p.id,
        p.location,
        p.profession,
        p.description,
        p.category,
        p.responsible,
        new Date(p.deadline).toLocaleString(),
        p.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `问题报表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    message.success('报表导出成功');
  };

  // 状态颜色
  const getStatusColor = (status) => {
    const colors = {
      '待处理': 'orange',
      '处理中': 'blue',
      '已解决': 'green',
      '已超期': 'red'
    };
    return colors[status] || 'default';
  };

  // 类别颜色
  const getCategoryColor = (category) => {
    const colors = {
      'A类': 'red',
      'B类': 'orange',
      'C类': 'blue'
    };
    return colors[category] || 'default';
  };

  // 判断是否超期
  const isOverdue = (problem) => {
    return problem.status !== '已解决' && 
      new Date(problem.deadline) < new Date();
  };
  
  // 将本地数据同步到服务器
  const syncLocalToServer = async () => {
    try {
      setLoading(true);
      const localProblems = JSON.parse(localStorage.getItem('problems') || '[]');
      
      // 检查服务器连接
      const testResponse = await fetch(`${API_BASE_URL}/api/problems`);
      if (!testResponse.ok) {
        throw new Error('服务器连接失败');
      }
      
      // 获取服务器上的问题列表
      const serverProblems = await testResponse.json();
      const serverIds = new Set(serverProblems.map(p => p.id));
      
      // 计算需要同步的问题
      const problemsToSync = localProblems.filter(p => !serverIds.has(p.id));
      const problemsToUpdate = localProblems.filter(p => serverIds.has(p.id));
      
      // 同步新问题
      for (const problem of problemsToSync) {
        const { id, ...problemData } = problem;
        await fetch(`${API_BASE_URL}/api/problems`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(problemData)
        });
      }
      
      // 更新已有问题
      for (const problem of problemsToUpdate) {
        await fetch(`${API_BASE_URL}/api/problems/${problem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(problem)
        });
      }
      
      // 重新获取数据
      await fetchProblems();
      setDataSource('api');
      message.success('本地数据已成功同步到服务器');
    } catch (error) {
      console.error('同步到服务器失败:', error);
      message.error('同步到服务器失败，请检查服务器连接');
    } finally {
      setLoading(false);
    }
  };
  
  // 从服务器获取最新数据
  const syncFromServer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/problems`);
      
      if (!response.ok) {
        throw new Error('从服务器获取数据失败');
      }
      
      const serverData = await response.json();
      setProblems(serverData);
      setFilteredProblems(serverData);
      setDataSource('api');
      localStorage.setItem('problems', JSON.stringify(serverData));
      localStorage.setItem('problemsLastUpdated', new Date().toISOString());
      message.success('已从服务器获取最新数据');
    } catch (error) {
      console.error('从服务器同步失败:', error);
      message.error('从服务器同步失败，请检查服务器连接');
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefreshData = () => {
    fetchProblems();
  };

  // 清除本地数据
  const handleClearLocalData = () => {
    confirm({
      title: '确定要清除本地数据吗?',
      icon: <ExclamationCircleOutlined />,
      content: '清除后将尝试从服务器重新获取数据，如果服务器不可用，将使用默认数据',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk() {
        localStorage.removeItem('problems');
        localStorage.removeItem('problemsLastUpdated');
        message.success('本地数据已清除，将重新获取数据');
        fetchProblems();
      }
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      fixed: 'left'
    },
    {
      title: '调试地点',
      dataIndex: 'location',
      key: 'location',
      width: 200,
      ellipsis: true
    },
    {
      title: '专业',
      dataIndex: 'profession',
      key: 'profession',
      width: 100,
      filters: [
        { text: '信号', value: '信号' },
        { text: '车辆', value: '车辆' },
        { text: '机电', value: '机电' },
        { text: '供电', value: '供电' },
        { text: '通信', value: '通信' },
        { text: '站台门', value: '站台门' }
      ],
      onFilter: (value, record) => record.profession === value
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '问题类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => (
        <Tag color={getCategoryColor(category)}>{category}</Tag>
      ),
      filters: [
        { text: 'A类', value: 'A类' },
        { text: 'B类', value: 'B类' },
        { text: 'C类', value: 'C类' }
      ],
      onFilter: (value, record) => record.category === value
    },
    {
      title: '责任单位',
      dataIndex: 'responsible',
      key: 'responsible',
      width: 120
    },
    {
      title: '整改期限',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 150,
      render: (deadline, record) => {
        const isLate = isOverdue(record);
        return (
          <span style={{ color: isLate ? '#E30613' : 'inherit' }}>
            {new Date(deadline).toLocaleString()}
            {isLate && <ExclamationCircleOutlined style={{ marginLeft: 4, color: '#E30613' }} />}
          </span>
        );
      },
      sorter: (a, b) => new Date(a.deadline) - new Date(b.deadline)
    },
    {
      title: '问题状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
      filters: [
        { text: '待处理', value: '待处理' },
        { text: '处理中', value: '处理中' },
        { text: '已解决', value: '已解决' },
        { text: '已超期', value: '已超期' }
      ],
      onFilter: (value, record) => record.status === value
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.id)}
            size="small"
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditProblem(record)}
            size="small"
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteProblem(record.id)}
            size="small"
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="搜索问题描述、地点或专业"
              allowClear
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={16}>
            <Space wrap>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreateProblem}
                style={{ backgroundColor: '#E30613' }}
              >
                新建问题
              </Button>
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setFilterVisible(!filterVisible)}
              >
                高级筛选
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={handleExport}
              >
                导出报表
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleRefreshData}
              >
                刷新数据
              </Button>
              <Button 
                icon={<CloudUploadOutlined />}
                onClick={syncLocalToServer}
                disabled={dataSource === 'api'}
              >
                同步到服务器
              </Button>
              <Button 
                icon={<CloudDownloadOutlined />}
                onClick={syncFromServer}
              >
                从服务器获取
              </Button>
              {localStorage.getItem('problems') && (
                <Button 
                  danger
                  onClick={handleClearLocalData}
                >
                  清除本地数据
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 高级筛选 */}
      {filterVisible && (
        <div style={{ marginBottom: 16 }}>
          <AdvancedFilter 
            onFilter={handleFilter}
            onReset={handleResetFilter}
          />
        </div>
      )}

      {/* 数据源提示 */}
      <div style={{ marginBottom: 16 }}>
        <Tag color={dataSource === 'api' ? 'green' : 'orange'}>
          {dataSource === 'api' ? '使用服务器数据' : '使用本地存储数据'}
        </Tag>
        {localStorage.getItem('problemsLastUpdated') && (
          <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>
            最后更新: {new Date(localStorage.getItem('problemsLastUpdated')).toLocaleString()}
          </span>
        )}
      </div>

      {/* 问题管理表格 */}
      <Card title="问题清单">
        <Table
          columns={columns}
          dataSource={filteredProblems}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            total: filteredProblems.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`
          }}
          size="small"
        />
      </Card>

      {/* 问题表单弹窗 */}
      <ProblemForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmitForm}
        editData={editingProblem}
      />

      {/* 问题详情弹窗 */}
      <ProblemDetail
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        problemData={selectedProblem}
        onAddReply={handleAddReply}
      />
    </div>
  );
};

export default ProblemLibrary; 
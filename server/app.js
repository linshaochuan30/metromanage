require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;

// 启用CORS
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 完善模拟数据
let problems = [
  {
    id: 1,
    location: "11号线徐家汇站环控机房",
    profession: "机电",
    description: "空调系统制冷效果不佳，影响设备正常运行，温度持续超过28度",
    category: "B类",
    classification: "设备问题",
    responsible: "设备商",
    deadline: "2024-01-15T10:00:00Z",
    status: "待处理",
    createTime: "2024-01-12T08:30:00Z",
    solution: "联系设备商检查制冷系统，更换故障压缩机",
    photos: [],
    replies: [],
    processRecords: [
      { time: "2024-01-12T08:30:00Z", action: "问题创建", operator: "张工程师" }
    ]
  },
  {
    id: 2,
    location: "11号线淮海中路站信号机房",
    profession: "信号",
    description: "ATP设备通信异常，列车进站时信号不稳定",
    category: "A类",
    classification: "软件问题",
    responsible: "设计院",
    deadline: "2024-01-13T09:00:00Z",
    status: "已超期",
    createTime: "2024-01-12T09:00:00Z",
    solution: "重新配置ATP参数，升级通信协议版本",
    photos: [],
    replies: [
      { time: "2024-01-12T14:00:00Z", content: "已联系设计院技术人员", operator: "李工程师" }
    ],
    processRecords: [
      { time: "2024-01-12T09:00:00Z", action: "问题创建", operator: "王工程师" },
      { time: "2024-01-12T14:00:00Z", action: "添加回复", operator: "李工程师" }
    ]
  },
  {
    id: 3,
    location: "11号线新天地站站台门",
    profession: "站台门",
    description: "3号站台门开关异常，存在夹人风险",
    category: "A类",
    classification: "施工问题",
    responsible: "施工方",
    deadline: "2024-01-14T16:00:00Z",
    status: "处理中",
    createTime: "2024-01-13T16:00:00Z",
    solution: "调整门体传感器位置，重新校准开关参数",
    photos: [],
    replies: [],
    processRecords: [
      { time: "2024-01-13T16:00:00Z", action: "问题创建", operator: "陈工程师" },
      { time: "2024-01-14T10:00:00Z", action: "开始处理", operator: "施工队长" }
    ]
  },
  {
    id: 4,
    location: "11号线马当路站供电室",
    profession: "供电",
    description: "UPS电源备用时间不足，仅能维持15分钟",
    category: "C类",
    classification: "设备问题",
    responsible: "设备商",
    deadline: "2024-01-20T12:00:00Z",
    status: "已解决",
    createTime: "2024-01-10T12:00:00Z",
    solution: "更换UPS电池组，增加备用电源容量",
    photos: [],
    replies: [],
    processRecords: [
      { time: "2024-01-10T12:00:00Z", action: "问题创建", operator: "赵工程师" },
      { time: "2024-01-11T09:00:00Z", action: "开始处理", operator: "设备商技术员" },
      { time: "2024-01-12T15:00:00Z", action: "问题解决", operator: "设备商技术员" }
    ]
  },
  {
    id: 5,
    location: "11号线老西门站通信机房",
    profession: "通信",
    description: "光纤链路不稳定，数据传输时有中断",
    category: "B类",
    classification: "施工问题",
    responsible: "施工方",
    deadline: "2024-01-16T14:00:00Z",
    status: "待处理",
    createTime: "2024-01-13T14:00:00Z",
    solution: "检查光纤接头，重新熔接松动连接点",
    photos: [],
    replies: [],
    processRecords: [
      { time: "2024-01-13T14:00:00Z", action: "问题创建", operator: "孙工程师" }
    ]
  }
];

// API路由
app.get('/api/problems', (req, res) => {
  const { station, profession, category, status, startDate, endDate } = req.query;
  
  let filteredProblems = [...problems];
  
  // 筛选逻辑
  if (station) {
    filteredProblems = filteredProblems.filter(p => p.location.includes(station));
  }
  if (profession) {
    filteredProblems = filteredProblems.filter(p => p.profession === profession);
  }
  if (category) {
    filteredProblems = filteredProblems.filter(p => p.category === category);
  }
  if (status) {
    filteredProblems = filteredProblems.filter(p => p.status === status);
  }
  if (startDate && endDate) {
    filteredProblems = filteredProblems.filter(p => {
      const createTime = new Date(p.createTime);
      return createTime >= new Date(startDate) && createTime <= new Date(endDate);
    });
  }
  
  res.json(filteredProblems);
});

app.get('/api/problems/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const problem = problems.find(p => p.id === id);
  if (problem) {
    res.json(problem);
  } else {
    res.status(404).json({ error: '问题未找到' });
  }
});

app.post('/api/problems', (req, res) => {
  const newProblem = {
    id: problems.length + 1,
    ...req.body,
    createTime: new Date().toISOString(),
    status: "待处理",
    replies: [],
    processRecords: [
      { time: new Date().toISOString(), action: "问题创建", operator: "系统用户" }
    ]
  };
  problems.push(newProblem);
  res.json(newProblem);
});

app.put('/api/problems/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = problems.findIndex(p => p.id === id);
  if (index !== -1) {
    problems[index] = { 
      ...problems[index], 
      ...req.body,
      processRecords: [
        ...problems[index].processRecords,
        { time: new Date().toISOString(), action: "问题更新", operator: "系统用户" }
      ]
    };
    res.json(problems[index]);
  } else {
    res.status(404).json({ error: '问题未找到' });
  }
});

app.delete('/api/problems/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = problems.findIndex(p => p.id === id);
  if (index !== -1) {
    problems.splice(index, 1);
    res.json({ message: '问题删除成功' });
  } else {
    res.status(404).json({ error: '问题未找到' });
  }
});

// 添加回复
app.post('/api/problems/:id/replies', (req, res) => {
  const id = parseInt(req.params.id);
  const index = problems.findIndex(p => p.id === id);
  if (index !== -1) {
    const newReply = {
      time: new Date().toISOString(),
      content: req.body.content,
      operator: req.body.operator || "系统用户"
    };
    problems[index].replies.push(newReply);
    problems[index].processRecords.push({
      time: new Date().toISOString(),
      action: "添加回复",
      operator: newReply.operator
    });
    res.json(newReply);
  } else {
    res.status(404).json({ error: '问题未找到' });
  }
});

// 统计数据API
app.get('/api/statistics', (req, res) => {
  const total = problems.length;
  const pending = problems.filter(p => p.status === '待处理').length;
  const overdue = problems.filter(p => {
    return p.status !== '已解决' && new Date(p.deadline) < new Date();
  }).length;
  
  // 本周新增（模拟数据）
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const thisWeek = problems.filter(p => new Date(p.createTime) > weekStart).length;
  
  // 专业分布
  const professionStats = {};
  problems.forEach(p => {
    professionStats[p.profession] = (professionStats[p.profession] || 0) + 1;
  });
  
  // 车站分布
  const stationStats = {};
  problems.forEach(p => {
    const station = p.location.split('站')[0] + '站';
    stationStats[station] = (stationStats[station] || 0) + 1;
  });
  
  // 类别分布
  const categoryStats = {};
  problems.forEach(p => {
    categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
  });
  
  res.json({
    overview: { total, pending, overdue, thisWeek },
    professionStats,
    stationStats,
    categoryStats
  });
});

// 模拟数据生成接口
app.post('/api/problems/generate', async (req, res) => {
  try {
    const { count = 15 } = req.body;
    
    // 模拟数据模板
    const professions = ['信号', '车辆', '机电', '供电', '通信', '站台门'];
    const locations = ['1号线人民广场站', '2号线南京东路站', '3号线中山公园站', '4号线上海体育馆站', '10号线虹桥火车站'];
    const categories = ['A类', 'B类', 'C类'];
    const statuses = ['待处理', '处理中', '已解决'];
    const responsibles = ['设备商A', '设备商B', '设备商C', '施工单位D'];
    const classifications = ['设备问题', '软件问题', '施工问题', '人为问题'];
    
    // 生成模拟数据
    const mockProblems = Array.from({ length: count }, (_, i) => {
      const createTime = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString();
      return {
        id: problems.length + i + 1,
        location: locations[Math.floor(Math.random() * locations.length)],
        profession: professions[Math.floor(Math.random() * professions.length)],
        description: `模拟问题描述 ${i + 1}: ${['制冷故障', '通讯中断', '电源异常', '信号干扰', '门体卡顿', '数据丢失'][Math.floor(Math.random() * 6)]}，需要及时处理以确保系统正常运行`,
        category: categories[Math.floor(Math.random() * categories.length)],
        classification: classifications[Math.floor(Math.random() * classifications.length)],
        responsible: responsibles[Math.floor(Math.random() * responsibles.length)],
        deadline: new Date(Date.now() + Math.floor(Math.random() * 7 + 1) * 24 * 60 * 60 * 1000).toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createTime: createTime,
        solution: `针对该问题的解决方案 ${i + 1}`,
        photos: [],
        replies: [],
        processRecords: [
          { time: createTime, action: "问题创建", operator: "系统用户" }
        ]
      };
    });
    
    // 添加到内存数组
    problems.push(...mockProblems);
    
    res.status(201).json({ 
      success: true, 
      count: count,
      message: `成功生成 ${count} 条模拟问题记录`,
      total: problems.length
    });
  } catch (error) {
    console.error('生成模拟数据失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 
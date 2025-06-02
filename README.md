# 地铁机电设备调试系统问题管理

一个基于 React + Node.js 的地铁机电设备调试问题管理系统，提供问题录入、跟踪、统计分析等功能。

## ✨ 功能特性

### 🏠 仪表盘
- 📊 实时统计概览（总问题数、待处理、超期、本周新增）
- 📈 问题类别分布饼图（A/B/C类）
- 📊 车站问题统计柱状图
- 📊 专业问题分布柱状图
- 🔄 实时数据刷新

### 📚 问题库管理
- ➕ 问题录入和编辑
- 🔍 高级搜索和筛选
- 👁️ 问题详情查看
- 📝 回复和处理记录
- 📤 数据导出（CSV格式）
- ⚠️ 超期问题提醒

### 🎯 核心特性
- 📱 响应式设计，支持移动端
- 🎨 现代化UI界面
- 📊 ECharts数据可视化
- 🚨 超期问题自动标识
- 🔄 实时数据同步

## 🛠 技术栈

### 前端
- **React 18** - 现代化前端框架
- **Ant Design** - 企业级UI组件库
- **ECharts** - 数据可视化图表库
- **React Router** - 单页面应用路由

### 后端
- **Node.js** - 运行时环境
- **Express** - Web应用框架
- **SQLite** - 嵌入式数据库
- **CORS** - 跨域资源共享

## 🚀 快速开始

### 环境要求
- Node.js 16+ 
- npm 8+

### 一键启动
```bash
# Windows用户
双击运行 start.bat

# 或手动启动
# 启动后端
cd server
node app.js

# 启动前端（新终端）
cd client
npm start
```

### 访问应用
- 前端地址：http://localhost:3000
- 后端API：http://localhost:5001

## 📁 项目结构

```
metromanage/
├── client/                    # React前端应用
│   ├── public/               # 静态资源
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   │   ├── ProblemForm.jsx      # 问题表单
│   │   │   ├── ProblemDetail.jsx    # 问题详情
│   │   │   └── AdvancedFilter.jsx   # 高级筛选
│   │   ├── pages/            # 页面组件
│   │   │   ├── Dashboard.jsx        # 仪表盘页面
│   │   │   └── ProblemLibrary.jsx   # 问题库管理
│   │   ├── App.js            # 主应用组件
│   │   ├── App.css           # 样式文件
│   │   └── index.js          # 应用入口
│   └── package.json          # 前端依赖
├── server/                   # Node.js后端应用
│   ├── app.js               # 主应用文件
│   ├── package.json         # 后端依赖
│   └── problems.db          # SQLite数据库
├── README.md                # 项目说明
├── 项目总结.md              # 项目总结
└── start.bat                # 一键启动脚本
```

## 🔧 API接口

### 问题管理
- `GET /api/problems` - 获取问题列表
- `POST /api/problems` - 创建新问题
- `GET /api/problems/{id}` - 获取问题详情
- `PUT /api/problems/{id}` - 更新问题
- `DELETE /api/problems/{id}` - 删除问题

### 回复管理
- `POST /api/problems/{id}/replies` - 添加回复

### 统计数据
- `GET /api/statistics` - 获取仪表盘统计数据

## 📊 数据库设计

### problems 表
- 问题基本信息（地点、专业、描述、类别等）
- 责任单位和期限管理
- 状态跟踪

### replies 表
- 问题回复记录
- 关联问题ID

### process_records 表
- 问题处理记录
- 操作日志

## 🎨 界面预览

### 仪表盘
- 统计卡片展示核心指标
- ECharts图表可视化数据分析
- 实时数据刷新功能

### 问题库管理
- 表格列表展示所有问题
- 高级搜索和筛选功能
- 问题详情弹窗展示
- 新建/编辑问题表单

## 🔄 最新更新

### v1.1.0 (2024-01-15)
- ✅ 修复仪表盘饼图显示问题
- ✅ 替换为稳定的ECharts图表库
- ✅ 修复组件导入错误
- ✅ 优化启动脚本
- ✅ 改进用户界面响应性

### v1.0.0 (2024-01-14)
- ✅ 完成核心功能开发
- ✅ 实现问题管理CRUD操作
- ✅ 完成数据可视化仪表盘
- ✅ 实现高级搜索和筛选
- ✅ 完成响应式界面设计

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 技术支持

如有技术问题，请通过以下方式联系：
- 提交 [Issue](../../issues)
- 发送邮件至开发团队

## 🎯 路线图

- [ ] 添加用户权限管理
- [ ] 实现邮件通知功能
- [ ] 添加文件上传功能
- [ ] 集成微信企业版通知
- [ ] 添加移动端APP

---

**地铁机电设备调试系统问题管理** - 让设备调试更高效！ 🚇✨ 
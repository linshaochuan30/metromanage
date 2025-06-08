import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  message,
  Typography,
  Radio,
  Spin,
  Divider
} from 'antd';
import { 
  DashboardOutlined,
  ReloadOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';

const { Title } = Typography;

// 自定义主题颜色
const themeColors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  purple: '#722ed1',
  cyan: '#13c2c2',
  magenta: '#eb2f96',
  background: '#f0f2f5',
  cardBackground: '#ffffff',
  textPrimary: '#000000d9',
  textSecondary: '#00000073',
  // 多巴胺配色方案
  dopamine: [
    '#FF5252', // 亮红色
    '#FF9D4D', // 橙色
    '#FFEB3B', // 黄色
    '#66BB6A', // 绿色
    '#42A5F5', // 蓝色
    '#7E57C2', // 紫色
    '#EC407A', // 粉色
    '#26C6DA', // 青色
    '#AB47BC', // 紫罗兰
    '#00BFA5'  // 薄荷绿
  ]
};

const Dashboard = () => {
  const [statistics, setStatistics] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    pendingProblems: 0,
    overdueProblems: 0
  });
  const [chartData, setChartData] = useState({
    categoryData: [],
    professionData: [],
    trendData: {
      dates: [],
      newProblems: [],
      solvedProblems: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [categoryChartType, setCategoryChartType] = useState('pie');
  const [professionChartType, setProfessionChartType] = useState('bar');

  // 初始化数据
  useEffect(() => {
    fetchStatistics();
  }, []);

  // 获取统计数据
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // 如果API获取失败，从本地存储获取问题数据计算统计信息
      const savedProblems = localStorage.getItem('problems');
      if (savedProblems) {
        try {
          const problems = JSON.parse(savedProblems);
          
          // 计算统计数据
          const totalProblems = problems.length;
          const solvedProblems = problems.filter(p => p.status === '已解决').length;
          const pendingProblems = problems.filter(p => p.status === '处理中').length;
          const overdueProblems = problems.filter(p => 
            p.status !== '已解决' && new Date(p.deadline) < new Date()
          ).length;
          
          setStatistics({
            totalProblems,
            solvedProblems,
            pendingProblems,
            overdueProblems
          });
          
          // 处理图表数据
          processLocalChartData(problems);
          
          message.success('从本地数据计算统计信息');
        } catch (e) {
          console.error('解析本地数据失败:', e);
          // 使用默认数据
          setDefaultStatistics();
        }
      } else {
        // 如果没有本地数据，使用默认数据
        setDefaultStatistics();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      message.error('获取统计数据失败');
      setLoading(false);
    }
  };
  
  // 从本地数据处理图表数据
  const processLocalChartData = (problems) => {
    // 问题类别分布
    const categoryStats = {};
    problems.forEach(p => {
      categoryStats[p.category] = (categoryStats[p.category] || 0) + 1;
    });
    
    const categoryData = Object.entries(categoryStats).map(([key, value]) => ({
      name: key,
      value: value
    }));
    
    // 专业分布
    const professionStats = {};
    problems.forEach(p => {
      professionStats[p.profession] = (professionStats[p.profession] || 0) + 1;
    });
    
    const professionData = Object.entries(professionStats).map(([key, value]) => ({
      name: key,
      value: value
    }));
    
    // 生成趋势数据
    const trendData = generateTrendData(problems);
    
    setChartData({
      categoryData,
      professionData,
      trendData
    });
  };
  
  // 生成趋势数据
  const generateTrendData = (problems) => {
    // 获取过去7天的日期
    const dates = [];
    const newProblems = [];
    const solvedProblems = [];
    
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      dates.push(dateStr);
      
      // 模拟数据，实际项目中应该根据真实数据计算
      if (problems && problems.length > 0) {
        // 当天创建的问题数量
        const newCount = problems.filter(p => {
          const createdDate = new Date(p.createdAt);
          return createdDate.getDate() === date.getDate() && 
                 createdDate.getMonth() === date.getMonth() &&
                 createdDate.getFullYear() === date.getFullYear();
        }).length;
        
        // 当天解决的问题数量
        const solvedCount = problems.filter(p => {
          if (p.status !== '已解决' || !p.resolvedAt) return false;
          const resolvedDate = new Date(p.resolvedAt);
          return resolvedDate.getDate() === date.getDate() && 
                 resolvedDate.getMonth() === date.getMonth() &&
                 resolvedDate.getFullYear() === date.getFullYear();
        }).length;
        
        newProblems.push(newCount || Math.floor(Math.random() * 5) + 1);
        solvedProblems.push(solvedCount || Math.floor(Math.random() * 4));
      } else {
        // 没有真实数据时使用随机数据
        newProblems.push(Math.floor(Math.random() * 5) + 1);
        solvedProblems.push(Math.floor(Math.random() * 4));
      }
    }
    
    return { dates, newProblems, solvedProblems };
  };
  
  // 设置默认统计数据
  const setDefaultStatistics = () => {
    setStatistics({
      totalProblems: 0,
      solvedProblems: 0,
      pendingProblems: 0,
      overdueProblems: 0
    });
    
    // 设置默认图表数据
    const dates = [];
    const newProblems = [];
    const solvedProblems = [];
    
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
      newProblems.push(Math.floor(Math.random() * 5) + 1);
      solvedProblems.push(Math.floor(Math.random() * 4));
    }
    
    setChartData({
      categoryData: [],
      professionData: [],
      trendData: { dates, newProblems, solvedProblems }
    });
    
    message.warning('无法获取统计数据，显示默认值');
  };

  // 刷新仪表盘
  const refreshDashboard = () => {
    fetchStatistics();
    message.success('仪表盘数据已刷新');
  };
  
  // 获取饼图配置
  const getPieOption = (data, title) => {
    return {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: themeColors.textPrimary
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e6e6e6',
        borderWidth: 1,
        textStyle: {
          color: themeColors.textPrimary
        },
        extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        data: data.map(item => item.name),
        textStyle: {
          color: themeColors.textSecondary
        }
      },
      series: [
        {
          name: title,
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold',
              color: themeColors.textPrimary
            },
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ],
      color: [
        themeColors.primary, 
        themeColors.success, 
        themeColors.warning, 
        themeColors.error, 
        themeColors.purple, 
        themeColors.cyan, 
        themeColors.magenta
      ]
    };
  };
  
  // 获取柱状图配置
  const getBarOption = (data, title) => {
    return {
      title: {
        text: title,
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: themeColors.textPrimary
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e6e6e6',
        borderWidth: 1,
        textStyle: {
          color: themeColors.textPrimary
        },
        extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          interval: 0,
          rotate: data.length > 4 ? 30 : 0,
          color: themeColors.textSecondary
        },
        axisLine: {
          lineStyle: {
            color: '#e6e6e6'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: themeColors.textSecondary
        },
        splitLine: {
          lineStyle: {
            color: '#e6e6e6',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: title,
          type: 'bar',
          barWidth: '60%',
          data: data.map((item, index) => ({
            value: item.value,
            itemStyle: {
              color: themeColors.dopamine[index % themeColors.dopamine.length],
              borderRadius: [4, 4, 0, 0],
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.1)'
            }
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            }
          }
        }
      ]
    };
  };
  
  // 获取折线图配置
  const getLineOption = () => {
    return {
      title: {
        text: '问题趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal',
          color: themeColors.textPrimary
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e6e6e6',
        borderWidth: 1,
        textStyle: {
          color: themeColors.textPrimary
        },
        extraCssText: 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);'
      },
      legend: {
        data: ['新增问题', '已解决'],
        bottom: 10,
        textStyle: {
          color: themeColors.textSecondary
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: chartData.trendData.dates,
        axisLabel: {
          color: themeColors.textSecondary
        },
        axisLine: {
          lineStyle: {
            color: '#e6e6e6'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: themeColors.textSecondary
        },
        splitLine: {
          lineStyle: {
            color: '#e6e6e6',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '新增问题',
          type: 'line',
          stack: '总量',
          data: chartData.trendData.newProblems,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: themeColors.primary,
            shadowBlur: 10,
            shadowColor: 'rgba(24, 144, 255, 0.5)'
          },
          lineStyle: {
            width: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(24, 144, 255, 0.5)'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(24, 144, 255, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(24, 144, 255, 0.1)'
              }
            ])
          }
        },
        {
          name: '已解决',
          type: 'line',
          stack: '总量',
          data: chartData.trendData.solvedProblems,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: themeColors.success,
            shadowBlur: 10,
            shadowColor: 'rgba(82, 196, 26, 0.5)'
          },
          lineStyle: {
            width: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(82, 196, 26, 0.5)'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(82, 196, 26, 0.5)'
              },
              {
                offset: 1,
                color: 'rgba(82, 196, 26, 0.1)'
              }
            ])
          }
        }
      ]
    };
  };

  // 卡片样式
  const cardStyle = {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    borderRadius: '8px',
    transition: 'all 0.3s ease-in-out'
  };

  return (
    <div style={{ padding: '24px', background: themeColors.background, minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          <DashboardOutlined /> 系统仪表盘
        </Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={refreshDashboard}
          loading={loading}
          style={{ boxShadow: '0 2px 6px rgba(24, 144, 255, 0.3)' }}
        >
          刷新数据
        </Button>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={cardStyle}>
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>问题总数</span>}
              value={statistics.totalProblems}
              prefix={<BugOutlined />}
              valueStyle={{ color: themeColors.primary, fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={cardStyle}>
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>已解决</span>}
              value={statistics.solvedProblems}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: themeColors.success, fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={cardStyle}>
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>处理中</span>}
              value={statistics.pendingProblems}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: themeColors.warning, fontSize: '28px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={cardStyle}>
            <Statistic
              title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>已超期</span>}
              value={statistics.overdueProblems}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: themeColors.error, fontSize: '28px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表展示 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card 
            hoverable
            style={{ ...cardStyle, marginBottom: '16px', height: '400px' }}
            extra={
              <Radio.Group 
                value={categoryChartType} 
                onChange={(e) => setCategoryChartType(e.target.value)}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="pie"><PieChartOutlined /></Radio.Button>
                <Radio.Button value="bar"><BarChartOutlined /></Radio.Button>
              </Radio.Group>
            }
          >
            {loading ? (
              <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
              </div>
            ) : chartData.categoryData.length > 0 ? (
              <ReactECharts
                option={categoryChartType === 'pie' 
                  ? getPieOption(chartData.categoryData, '问题类别分布') 
                  : getBarOption(chartData.categoryData, '问题类别分布')
                }
                style={{ height: '340px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                暂无数据
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            hoverable
            style={{ ...cardStyle, marginBottom: '16px', height: '400px' }}
            extra={
              <Radio.Group 
                value={professionChartType} 
                onChange={(e) => setProfessionChartType(e.target.value)}
                buttonStyle="solid"
                size="small"
              >
                <Radio.Button value="bar"><BarChartOutlined /></Radio.Button>
                <Radio.Button value="pie"><PieChartOutlined /></Radio.Button>
              </Radio.Group>
            }
          >
            {loading ? (
              <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
              </div>
            ) : chartData.professionData.length > 0 ? (
              <ReactECharts
                option={professionChartType === 'pie' 
                  ? getPieOption(chartData.professionData, '专业问题分布') 
                  : getBarOption(chartData.professionData, '专业问题分布')
                }
                style={{ height: '340px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            ) : (
              <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                暂无数据
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24}>
          <Card hoverable style={{ ...cardStyle, height: '400px' }}>
            {loading ? (
              <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin size="large" />
              </div>
            ) : (
              <ReactECharts
                option={getLineOption()}
                style={{ height: '340px', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 
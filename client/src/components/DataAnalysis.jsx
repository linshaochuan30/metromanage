import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spin } from 'antd';
import { Pie, Column, Line } from '@ant-design/plots';

// 多巴胺配色方案
const dopamineColors = [
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
];

const DataAnalysis = ({ visible, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchStatistics();
    }
  }, [visible]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // 尝试从API获取数据
      try {
        const response = await fetch('/api/statistics', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatistics(data);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('API获取统计数据失败:', error);
      }
      
      // 如果API获取失败，从本地存储获取问题数据计算统计信息
      const savedProblems = localStorage.getItem('problems');
      if (savedProblems) {
        try {
          const problems = JSON.parse(savedProblems);
          
          // 计算统计数据
          const total = problems.length;
          const pending = problems.filter(p => p.status === '待处理').length;
          const overdue = problems.filter(p => 
            p.status !== '已解决' && new Date(p.deadline) < new Date()
          ).length;
          
          // 本周新增
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - 7);
          const thisWeek = problems.filter(p => 
            new Date(p.createTime) > weekStart
          ).length;
          
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
          
          setStatistics({
            overview: { total, pending, overdue, thisWeek },
            professionStats,
            stationStats,
            categoryStats
          });
          
        } catch (e) {
          console.error('解析本地数据失败:', e);
          setStatistics(null);
        }
      } else {
        setStatistics(null);
      }
      
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  // 问题类别分布数据
  const categoryData = statistics?.categoryStats ? 
    Object.entries(statistics.categoryStats).map(([key, value]) => ({
      type: key,
      value: value
    })) : [];

  // 车站问题统计数据
  const stationData = statistics?.stationStats ? 
    Object.entries(statistics.stationStats).map(([key, value]) => ({
      station: key.replace('11号线', '').replace('站', ''),
      count: value
    })) : [];

  // 专业分布数据
  const professionData = statistics?.professionStats ? 
    Object.entries(statistics.professionStats).map(([key, value]) => ({
      profession: key,
      count: value
    })) : [];

  // 饼图配置
  const pieConfig = {
    data: categoryData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
    color: ['#FF5252', '#FF9D4D', '#66BB6A', '#42A5F5', '#7E57C2', '#EC407A']
  };

  // 柱状图配置
  const columnConfig = {
    data: stationData,
    xField: 'station',
    yField: 'count',
    seriesField: 'station', // 添加这个字段以便应用不同颜色
    color: ({ station }) => {
      // 使用站点名称的哈希值来确定颜色索引，确保相同站点始终使用相同颜色
      const index = station.charCodeAt(0) % dopamineColors.length;
      return dopamineColors[index];
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
        fontWeight: 'bold',
      },
    },
    meta: {
      station: { alias: '车站' },
      count: { alias: '问题数量' },
    },
    columnStyle: {
      radius: [8, 8, 0, 0], // 圆角柱状图
    },
  };

  // 专业分布柱状图配置
  const professionConfig = {
    data: professionData,
    xField: 'profession',
    yField: 'count',
    seriesField: 'profession', // 添加这个字段以便应用不同颜色
    color: ({ profession }) => {
      // 使用专业名称的哈希值来确定颜色索引，确保相同专业始终使用相同颜色
      const index = profession.charCodeAt(0) % dopamineColors.length;
      return dopamineColors[index];
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
        fontWeight: 'bold',
      },
    },
    meta: {
      profession: { alias: '专业' },
      count: { alias: '问题数量' },
    },
    columnStyle: {
      radius: [8, 8, 0, 0], // 圆角柱状图
    },
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: 8, 
        padding: 24, 
        width: '90%', 
        maxWidth: 1200, 
        maxHeight: '90%', 
        overflowY: 'auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24 
        }}>
          <h2>数据分析面板</h2>
          <button 
            onClick={onCancel}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: 20, 
              cursor: 'pointer' 
            }}
          >
            ×
          </button>
        </div>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="问题类别分布" size="small">
              <Pie {...pieConfig} height={300} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="车站问题统计" size="small">
              <Column {...columnConfig} height={300} />
            </Card>
          </Col>
          <Col span={24}>
            <Card title="专业问题分布" size="small">
              <Column {...professionConfig} height={250} />
            </Card>
          </Col>
        </Row>

        {/* 效率指标 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#E30613' }}>
                  {statistics?.overview?.total || 0}
                </div>
                <div>总问题数</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>
                  {statistics?.overview?.pending || 0}
                </div>
                <div>待处理</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#E30613' }}>
                  {statistics?.overview?.overdue || 0}
                </div>
                <div>已超期</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {statistics?.overview?.thisWeek || 0}
                </div>
                <div>本周新增</div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DataAnalysis; 
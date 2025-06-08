import React from 'react';
import { Modal, Descriptions, Tag, Timeline, Image, Button, Input, Form, message } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const ProblemDetail = ({ visible, onCancel, problemData, onAddReply }) => {
  const [form] = Form.useForm();

  if (!problemData) return null;

  const getStatusColor = (status) => {
    const colors = {
      '待处理': 'orange',
      '处理中': 'blue',
      '已解决': 'green',
      '已超期': 'red'
    };
    return colors[status] || 'default';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'A类': 'red',
      'B类': 'orange',
      'C类': 'blue'
    };
    return colors[category] || 'default';
  };

  const handleAddReply = async (values) => {
    try {
      await onAddReply(problemData.id, values.content);
      form.resetFields();
      message.success('回复添加成功');
    } catch (error) {
      message.error('添加回复失败');
    }
  };

  const isOverdue = problemData.status !== '已解决' && new Date(problemData.deadline) < new Date();

  return (
    <Modal
      title={`问题详情 - ${problemData.id}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* 基本信息 */}
        <Descriptions title="基本信息" bordered column={2} size="small">
          <Descriptions.Item label="问题编号">{problemData.id}</Descriptions.Item>
          <Descriptions.Item label="调试地点">{problemData.location}</Descriptions.Item>
          <Descriptions.Item label="所属专业">{problemData.profession}</Descriptions.Item>
          <Descriptions.Item label="问题类别">
            <Tag color={getCategoryColor(problemData.category)}>{problemData.category}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="问题分类">{problemData.classification}</Descriptions.Item>
          <Descriptions.Item label="责任单位">{problemData.responsible}</Descriptions.Item>
          <Descriptions.Item label="发现时间">
            {new Date(problemData.createTime).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="整改期限">
            <span style={{ color: isOverdue ? '#E30613' : 'inherit' }}>
              {new Date(problemData.deadline).toLocaleString()}
              {isOverdue && <ExclamationCircleOutlined style={{ marginLeft: 8, color: '#E30613' }} />}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="问题状态" span={2}>
            <Tag color={getStatusColor(problemData.status)}>{problemData.status}</Tag>
          </Descriptions.Item>
        </Descriptions>

        {/* 问题描述 */}
        <div style={{ marginTop: 24 }}>
          <h4>问题描述</h4>
          <div style={{ 
            padding: 12, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 6,
            marginBottom: 16 
          }}>
            {problemData.description}
          </div>
        </div>

        {/* 整改方案 */}
        <div style={{ marginTop: 16 }}>
          <h4>整改方案</h4>
          <div style={{ 
            padding: 12, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 6,
            marginBottom: 16 
          }}>
            {problemData.solution || '暂无整改方案'}
          </div>
        </div>

        {/* 现场照片 */}
        {problemData.photos && problemData.photos.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>现场照片</h4>
            <Image.PreviewGroup>
              {problemData.photos.map((photo, index) => (
                <Image
                  key={index}
                  width={100}
                  height={100}
                  src={photo.url}
                  style={{ marginRight: 8, marginBottom: 8 }}
                />
              ))}
            </Image.PreviewGroup>
          </div>
        )}

        {/* 二次回复 */}
        <div style={{ marginTop: 24 }}>
          <h4>二次回复</h4>
          {problemData.replies && problemData.replies.length > 0 ? (
            problemData.replies.map((reply, index) => (
              <div key={index} style={{ 
                padding: 12, 
                backgroundColor: '#e6f7ff', 
                borderRadius: 6,
                marginBottom: 8,
                borderLeft: '4px solid #1890ff'
              }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                  {reply.operator} · {new Date(reply.time).toLocaleString()}
                </div>
                <div>{reply.content}</div>
              </div>
            ))
          ) : (
            <div style={{ color: '#999', fontStyle: 'italic' }}>暂无回复</div>
          )}
          
          {/* 添加回复表单 */}
          <Form form={form} onFinish={handleAddReply} style={{ marginTop: 16 }}>
            <Form.Item name="content" rules={[{ required: true, message: '请输入回复内容' }]}>
              <TextArea rows={3} placeholder="请输入回复内容..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#E30613' }}>
                添加回复
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* 处理记录时间线 */}
        <div style={{ marginTop: 24 }}>
          <h4>处理记录</h4>
          <Timeline>
            {problemData.processRecords && problemData.processRecords.map((record, index) => (
              <Timeline.Item
                key={index}
                dot={
                  record.action === '问题解决' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                  record.action === '问题创建' ? <ExclamationCircleOutlined style={{ color: '#faad14' }} /> :
                  <ClockCircleOutlined style={{ color: '#1890ff' }} />
                }
              >
                <div>
                  <strong>{record.action}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    {record.operator} · {new Date(record.time).toLocaleString()}
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </div>
      </div>
    </Modal>
  );
};

export default ProblemDetail; 
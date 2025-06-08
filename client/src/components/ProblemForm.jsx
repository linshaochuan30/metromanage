import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const ProblemForm = ({ visible, onCancel, onSubmit, editData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 专业选项
  const professions = ['信号', '车辆', '综合监控', '站台门', '供电', '通信', 'FAS', 'BAS', 'AFC'];
  
  // 问题类别选项
  const categories = [
    { value: 'A类', label: 'A类（影响行车）', deadline: 24 },
    { value: 'B类', label: 'B类（影响调试）', deadline: 72 },
    { value: 'C类', label: 'C类（一般缺陷）', deadline: 168 }
  ];

  useEffect(() => {
    if (editData) {
      form.setFieldsValue(editData);
    } else {
      form.resetFields();
    }
  }, [editData, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // 根据问题类别自动计算整改期限
      const category = categories.find(c => c.value === values.category);
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + category.deadline);
      
      const formData = {
        ...values,
        deadline: deadline.toISOString(),
        photos: values.photos?.fileList || []
      };
      
      await onSubmit(formData);
      message.success(editData ? '问题更新成功' : '问题创建成功');
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editData ? '编辑问题' : '新建问题'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
      >
        <Form.Item
          name="location"
          label="调试地点"
          rules={[{ required: true, message: '请输入调试地点' }]}
        >
          <Input 
            placeholder="例：11号线徐家汇站环控机房"
            style={{ borderColor: '#E30613' }}
          />
        </Form.Item>

        <Form.Item
          name="profession"
          label="所属专业"
          rules={[{ required: true, message: '请选择所属专业' }]}
        >
          <Select placeholder="请选择专业">
            {professions.map(prof => (
              <Option key={prof} value={prof}>{prof}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="问题描述"
          rules={[{ required: true, message: '请输入问题描述' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="请详细描述现象和影响范围"
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="问题类别"
          rules={[{ required: true, message: '请选择问题类别' }]}
        >
          <Select placeholder="请选择问题类别">
            {categories.map(cat => (
              <Option key={cat.value} value={cat.value}>
                {cat.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="classification"
          label="问题分类"
        >
          <Select placeholder="请选择问题分类">
            <Option value="施工问题">施工问题</Option>
            <Option value="设计问题">设计问题</Option>
            <Option value="设备问题">设备问题</Option>
            <Option value="软件问题">软件问题</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="responsible"
          label="责任单位"
        >
          <Select placeholder="请选择责任单位">
            <Option value="施工方">施工方</Option>
            <Option value="设计院">设计院</Option>
            <Option value="设备商">设备商</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="solution"
          label="整改方案"
          rules={[{ required: true, message: '请输入整改方案' }]}
        >
          <TextArea 
            rows={4} 
            placeholder="请写清楚由哪些单位整改以及整改方式"
          />
        </Form.Item>

        <Form.Item
          name="photos"
          label="现场照片"
        >
          <Upload
            listType="picture"
            beforeUpload={() => false}
            multiple
          >
            <Button icon={<UploadOutlined />}>上传照片</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ backgroundColor: '#E30613' }}
            >
              {editData ? '更新' : '创建'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProblemForm; 
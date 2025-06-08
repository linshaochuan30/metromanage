import React from 'react';
import { Card, Form, Select, DatePicker, Button, Space } from 'antd';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdvancedFilter = ({ onFilter, onReset }) => {
  const [form] = Form.useForm();

  // 模拟5个车站数据
  const stations = [
    '11号线徐家汇站',
    '11号线淮海中路站', 
    '11号线新天地站',
    '11号线马当路站',
    '11号线老西门站'
  ];

  const professions = ['信号', '车辆', '综合监控', '站台门', '供电', '通信', 'FAS', 'BAS', 'AFC'];
  const categories = ['A类', 'B类', 'C类'];
  const statuses = ['待处理', '处理中', '已解决', '已超期'];

  const handleFilter = (values) => {
    onFilter(values);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Card title="高级筛选" size="small">
      <Form
        form={form}
        layout="inline"
        onFinish={handleFilter}
      >
        <Form.Item name="station" label="调试地点">
          <Select placeholder="选择车站" style={{ width: 150 }} allowClear>
            {stations.map(station => (
              <Option key={station} value={station}>{station}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="profession" label="专业">
          <Select placeholder="选择专业" style={{ width: 120 }} allowClear>
            {professions.map(prof => (
              <Option key={prof} value={prof}>{prof}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="category" label="问题类别">
          <Select placeholder="选择类别" style={{ width: 100 }} allowClear>
            {categories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="status" label="问题状态">
          <Select placeholder="选择状态" style={{ width: 100 }} allowClear>
            {statuses.map(status => (
              <Option key={status} value={status}>{status}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="dateRange" label="时间范围">
          <RangePicker style={{ width: 240 }} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" style={{ backgroundColor: '#E30613' }}>
              筛选
            </Button>
            <Button onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AdvancedFilter; 
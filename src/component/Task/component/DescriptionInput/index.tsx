import { Form, Input } from 'antd';

const DescriptionInput = () => {
  return (
    <Form.Item
      label="描述"
      name="description"
      rules={[
        {
          max: 200,
          message: '描述不超过 200 个字符',
        },
      ]}
    >
      <Input.TextArea
        rows={6}
        placeholder="请输入描述，200字以内；未输入时，系统会根据对象和工单类型自动生成描述信息"
      />
    </Form.Item>
  );
};

export default DescriptionInput;
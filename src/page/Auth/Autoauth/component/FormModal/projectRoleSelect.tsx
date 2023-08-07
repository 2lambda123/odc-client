import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Select, Space } from 'antd';
import React, { useState } from 'react';
import type { IOption } from './index';

interface IProps {
  projectOptions: IOption[];
  roleOptions: IOption[];
}

const ProjectRoleSelect: React.FC<IProps> = (props) => {
  const { projectOptions, roleOptions } = props;
  const [isRequired, setIsRequired] = useState(true);

  // 有效性校验
  const handleValidator = async (_, values) => {
    let itemRequired = false;
    if (!values?.length) {
      return Promise.resolve();
    }
    const validValues = values?.filter((item) => {
      // 每一项均不是空值
      return Object.values(item)?.every((value) => value);
    });
    const invalidValues = values?.filter((item) => {
      const _values = Object.values(item);
      if (!_values.length) {
        return false;
      }
      // 包含空值 && 不是所有筛选项为空
      return _values?.some((value) => !value) && !_values?.every((value) => !value);
    });

    if (!validValues.length || invalidValues.length) {
      itemRequired = true;
    }
    setIsRequired(itemRequired);
    return itemRequired ? Promise.reject(new Error()) : Promise.resolve();
  };

  return (
    <Form.List
      name="projectRoles"
      rules={[
        {
          validator: handleValidator,
        },
      ]}
    >
      {(fields, { add, remove }) => {
        return (
          <>
            {fields.map(({ key, name }: any) => (
              <Space key={key} align="baseline">
                <Form.Item
                  name={[name, 'projectId']}
                  style={{ width: '210px' }}
                  rules={[
                    {
                      required: isRequired,
                      message: '请选择',
                    },
                  ]}
                >
                  <Select placeholder="请选择项目" options={projectOptions} />
                </Form.Item>
                <Form.Item
                  name={[name, 'roles']}
                  style={{ width: '210px' }}
                  rules={[
                    {
                      required: isRequired,
                      message: '请选择',
                    },
                  ]}
                >
                  <Select placeholder="请选择角色" mode="multiple" options={roleOptions} />
                </Form.Item>
                <DeleteOutlined
                  onClick={() => {
                    remove(name);
                  }}
                />
              </Space>
            ))}

            <Form.Item style={{ marginBottom: 0, width: '428px' }}>
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    projectId: undefined,
                    roles: undefined,
                  })
                }
                block
                icon={<PlusOutlined />}
              >
                添加
              </Button>
            </Form.Item>
          </>
        );
      }}
    </Form.List>
  );
};

export default ProjectRoleSelect;

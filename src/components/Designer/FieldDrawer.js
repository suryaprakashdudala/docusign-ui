import { Drawer, Form, Input, Switch, Space, Button, Tag } from 'antd'

export const useDrawerForm = () => {
  const [form] = Form.useForm()
  return [form]
}

const FieldDrawer = ({
  visible,
  form,
  field,
  onClose,
  onSave,
  onDelete,
  getUserColor,
  getUserName
}) => {
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      await onSave(values)
    } catch(error) {
      console.log(error);
      
    }
  }

  return (
    <Drawer
      title="Configure Field"
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      extra={
        <Space>
          <Button onClick={onDelete} danger>
            Delete
          </Button>
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Field Type">
          <Input value={field?.type || ''} disabled />
        </Form.Item>

        <Form.Item
          name="label"
          label="Label"
          rules={[{ required: true, message: 'Please enter field label' }]}
        >
          <Input placeholder="Enter field label" />
        </Form.Item>

        <Form.Item name="required" valuePropName="checked">
          <Switch checkedChildren="Required" unCheckedChildren="Optional" />
        </Form.Item>

        {field && (
          <>
            <Form.Item label="Assigned To">
              <Tag color={getUserColor(field.userId)}>
                {getUserName(field.userId)}
              </Tag>
            </Form.Item>

            <Form.Item label="Position">
              <div>
                Page: {field.page}, X:{' '}
                {field.x != null ? field.x.toFixed(1) : 0}%, Y:{' '}
                {field.y != null ? field.y.toFixed(1) : 0}%
              </div>
            </Form.Item>
          </>
        )}
      </Form>
    </Drawer>
  )
}

FieldDrawer.useDrawerForm = useDrawerForm

export default FieldDrawer
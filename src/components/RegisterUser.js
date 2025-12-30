import { bindActionCreators } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import { registerUser } from '../actions/users'
import { Card, Form, Input, Button, Select } from 'antd'
import '../styles/registerUser.css'

const { Option } = Select

const RegisterUser = (props) => {
  const { actions } = props
  const [form] = Form.useForm()

  const handleRegister = async (values) => {
    try {
      await actions.registerUser(values)
      form.resetFields()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="register-page">
      <Card title="Register User" className="register-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          autoComplete="off"
        >
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[
              { required: true, message: 'Please enter first name!' },
            ]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              { required: true, message: 'Please enter last name!' },
            ]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>

          <Form.Item
            label="Username"
            name="userName"
            rules={[
              { required: true, message: 'Please enter username!' },
            ]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: 'email',
                message: 'Please enter a valid email address!',
              },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="roles"
            rules={[
              { required: true, message: 'Please select a role!' },
            ]}
          >
            <Select placeholder="Select role" mode='multiple' allowClear>
              <Option value="Admin">Admin</Option>
              <Option value="Manager">Manager</Option>
              <Option value="Auditor">Auditor</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Save
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({ registerUser }, dispatch),
})

export default connect(null, mapDispatchToProps)(RegisterUser)

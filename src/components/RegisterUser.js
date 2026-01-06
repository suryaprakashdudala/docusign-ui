import { bindActionCreators } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import { registerUser, updateUser } from '../actions/users'
import { Card, Form, Input, Button, Select } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import '../styles/registerUser.css'

const { Option } = Select

const RegisterUser = (props) => {
  const { actions, users } = props
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const isEditMode = !!id

  useEffect(() => {
    if (isEditMode && users) {
      const user = users.find((u) => u.id === id)
      if (user) {
        form.setFieldsValue({
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        })
      }
    } else if (!isEditMode) {
      form.resetFields()
    }
  }, [isEditMode, id, users, form])

  const handleFinish = async (values) => {
    try {
      if (isEditMode) {
        await actions.updateUser(id, values)
        navigate('/users/view')
      } else {
        await actions.registerUser(values)
        form.resetFields()
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="register-page">
      <Card title={isEditMode ? "Edit User" : "Register User"} className="register-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="userName"
            rules={[
              { required: true, message: 'Please enter username!' },
            ]}
          >
            <Input placeholder="Enter username" disabled={isEditMode} />
          </Form.Item>

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
            name="role"
            rules={[
              { required: true, message: 'Please select a role!' },
            ]}
          >
            <Select placeholder="Select role" allowClear>
              <Option value="Admin">Admin</Option>
              <Option value="Manager">Manager</Option>
              <Option value="Auditor">Auditor</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              {isEditMode ? "Update" : "Save"}
            </Button>
            {isEditMode && (
              <Button 
                onClick={() => navigate('/users/view')} 
                block 
                style={{ marginTop: '10px' }}
              >
                Cancel
              </Button>
            )}
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

const mapStateToProps = (state) => ({
  users: state.users.list,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators({ registerUser, updateUser }, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(RegisterUser)

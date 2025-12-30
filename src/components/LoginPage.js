import { Card, Input, Button, Form } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Auth.css'
import {validationMessages} from '../constants/constants'
import {useState} from 'react'

const {ENTER_PASSWORD, ENTER_USERNAME} = validationMessages

const LoginPage = (props) => {
  const { actions } = props
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loginBtnLoading, setLoginBtnLoading] =  useState(false)

  const handleLogin = async (values) => {
    setLoginBtnLoading(true)
    form.validateFields()
     try {
      const user = await actions.login(values);
      if (user.firstTimeLogin) {
        navigate('/reset-password', { state: { userName: user.userName, mode: 'update' } });
      } else {
        navigate('/documents/designer');
      }
    } catch (e) {
      console.error("Login failed", e);
    }
    setLoginBtnLoading(false)
  }

  return (
    <div className="login-page">
      <Card title="Login" className="login-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          autoComplete="off"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: ENTER_USERNAME,
              },
            ]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: ENTER_PASSWORD,
              },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <div className="forgot-password-helper">
            <Link to='/forgot-password' className="forgot-password-link">Forgot Password?</Link>
          </div>

          <Button loading={loginBtnLoading} type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage

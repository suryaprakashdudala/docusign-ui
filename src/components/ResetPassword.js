import { useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { bindActionCreators } from '@reduxjs/toolkit';
import { resetPassword, updatePassword } from '../actions/login';
import { connect } from 'react-redux';

const ResetPassword = (props) => {
  const {actions} = props
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const userName = location.state?.userName;
  const mode = location.state?.mode || 'forgot';
  const isUpdateMode = mode === 'update';

  if (!userName) {
    message.error('Invalid request! Username not provided.');
    navigate('/login');
    return null;
  }

  const handleReset = async (values) => {
    try {

      if(mode === 'forgot'){
        await actions.resetPassword(userName,values.password)
        navigate('/login');
      }
      else {
        await actions.updatePassword(userName, values.password)
        navigate('/login');
      }

      message.success(
        isUpdateMode
          ? 'Password updated successfully!'
          : 'Password reset successfully!'
      );
      
    } catch (error) {
      message.error(
        error.response?.data?.message || 'Failed to update password.'
      );
    }
  };

  return (
    <div className="login-page">
      <Card
        title={isUpdateMode ? 'Update Password' : 'Reset Password'}
        className="login-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleReset}
          autoComplete="off"
        >
          <Form.Item label="Username">
            <Input value={userName} disabled />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Passwords do not match!')
                  );
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            {isUpdateMode ? 'Update Password' : 'Reset Password'}
          </Button>
        </Form>
      </Card>
    </div>
  );
};

const mapDispatchToProps = () => (dispatch) => ({
  actions:bindActionCreators ({
    resetPassword,
    updatePassword
  },dispatch)
})

export default connect(null,mapDispatchToProps)(ResetPassword);

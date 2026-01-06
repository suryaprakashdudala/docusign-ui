import { useState } from 'react'
import { Card, Input, Button, Form } from 'antd'
import { connect } from 'react-redux';
import { forgotPassword, verifyOtp } from '../actions/login';
import { bindActionCreators } from '@reduxjs/toolkit';
import OtpModal from './OtpModal'
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css'


const ForgotPassword = (props) => {
    const [verifyOtpMode, setVerifyOtpMode] = useState(false);
    const [userName, setUserName] = useState('');
    const { actions } = props
    const [form] = Form.useForm()
    const navigate = useNavigate()
    const handleForgotPassword = (values) => {
        actions.forgotPassword(values.userName)
        setUserName(values.userName);
        setVerifyOtpMode(true);
    }
    const verifyOtp = async (otp) => {
        await actions.verifyOtp(userName, otp);
        navigate('/reset-password', { state: { userName: userName, mode: 'forgot' } });
    }
    return (
        <div className="login-page">
            <Card title="Forgot Password" className="forgot-password-card">
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={handleForgotPassword}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Username"
                        name="userName"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your username!',
                            },
                        ]}
                    >
                        <Input
                            placeholder="Enter your username"
                            className="auth-input"
                        />
                    </Form.Item>
                    <Button type="primary" htmlType='submit' block>
                        Submit
                    </Button>
                </Form>
                {verifyOtpMode &&
                    <OtpModal
                      open={verifyOtpMode}
                      onCancel={() => setVerifyOtpMode(false)}
                      onVerify={(otp) => {verifyOtp(otp)}}
                    />
                }

            </Card>
        </div>
    )
}


const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({ forgotPassword, verifyOtp }, dispatch),
})

export default connect(null, mapDispatchToProps)(ForgotPassword)
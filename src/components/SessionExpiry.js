import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import './SessionExpiry.css';

const { Title, Text } = Typography;

const SessionExpiry = () => {
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        navigate('/login');
    };

    return (
        <div className="session-expiry-container">
            <div className="session-expiry-card">
                <ClockCircleOutlined className="expiry-icon" />
                
                <Title className="expiry-title">Session Expired</Title>
                
                <Text className="expiry-message">
                    Your session has ended due to inactivity or an unexpected error. 
                    Please log in again to continue your work.
                </Text>

                <div style={{ marginTop: '24px' }}>
                    <Button 
                        type="primary" 
                        className="login-redirect-btn"
                        onClick={handleLoginRedirect}
                    >
                        Return to Login
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SessionExpiry;

import { Link } from 'react-router-dom';
import { Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import './SessionExpiry.css';

const { Title, Text } = Typography;

const SessionExpiry = () => {
    return (
        <div className="session-expiry-container">
            <div className="session-expiry-card">
                <ClockCircleOutlined className="expiry-icon" />
                
                <Title className="expiry-title">Session Expired</Title>
                
                <Text className="expiry-message">
                    Your session has ended due to inactivity or an unexpected error. 
                    Please <Link to="/login" className="login-link">login</Link> again.
                </Text>
            </div>
        </div>
    );
};

export default SessionExpiry;

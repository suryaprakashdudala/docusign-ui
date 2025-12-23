import { Layout, Avatar, Dropdown, Typography } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { connect } from "react-redux";
import { logout } from "../../actions/login";
import { bindActionCreators } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import '../../styles/Layouts.css';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ firstName, lastName, email, username, actions }) => {
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
  const navigate = useNavigate()

  const menuItems = [
    {
      key: "profile-info",
      label: (
        <div className="user-profile-info">
          <Text strong>{firstName} {lastName}</Text>
          <br />
          <Text type="secondary" className="header-user-info">{email}</Text>
          <br />
          <Text type="secondary" className="header-user-info">Username: {username}</Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => {
        actions.logout()
        navigate('/login')
      },
    },
  ];

  return (
    <Header className="app-header">
      <Dropdown
        menu={{ items: menuItems }}
        trigger={["click"]}
        placement="bottomRight"
      >
        <Avatar
          size="large"
          className="user-avatar"
        >
          {initials || <UserOutlined />}
        </Avatar>
      </Dropdown>
    </Header>
  );
};

const mapStateToProps = (state) => ({
  firstName: state.login.user?.firstName || '',
  lastName: state.login.user?.lastName || '',
  email: state.login.user?.email || '',
  username: state.login.user?.userName || '',
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      logout
    },
    dispatch
  ),
})



export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
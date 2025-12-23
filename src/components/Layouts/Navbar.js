import React from "react";
import { Layout, Avatar, Badge } from "antd";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import '../../styles/Layouts.css';

const { Header } = Layout;

export default function Navbar() {
  return (
    <Header className="app-navbar">
      <Badge count={3}>
        <BellOutlined className="header-bell-icon" />
      </Badge>
      <Avatar icon={<UserOutlined />} />
      <span className="navbar-user-name">John Doe ▾</span>
    </Header>
  );
}

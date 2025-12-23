import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Layouts/Sidebar";
import AppHeader from "../components/Layouts/AppHeader";
import '../styles/Layouts.css';

const { Content } = Layout;

const GlobalLayout = () => {
  return (
    <Layout className="global-layout">
      <Sidebar role="admin" />
      <Layout>
        <AppHeader />
        <Content className="global-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default GlobalLayout;

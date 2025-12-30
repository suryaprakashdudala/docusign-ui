import { Layout, Menu } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import '../../styles/Layouts.css';

const { Sider } = Layout;
const { SubMenu } = Menu;

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Sider width={250} className="app-sidebar">
      <div className="sidebar-logo-container">
        Demo Docusign
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['user-management', 'documents']}
      >
        <SubMenu key="documents" icon={<FileTextOutlined />} title="Documents">
          <Menu.Item key="/documents/designer" onClick={() => navigate('/documents/designer')}>
            Designer Documents
          </Menu.Item>
          <Menu.Item key="/documents/completed" onClick={() => navigate('/documents/completed')}>
            Completed Documents
          </Menu.Item>
        </SubMenu>
        <SubMenu key="user-management" icon={<UserOutlined />} title="User Management">
          <Menu.Item key="/users/add" onClick={() => navigate('/users/add')}>
            Add User
          </Menu.Item>
          <Menu.Item key="/users/view" onClick={() => navigate('/users/view')}>
            View Users
          </Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  );
}
export default Sidebar;
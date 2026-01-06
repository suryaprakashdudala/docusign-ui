import { Table, Card, Tag, Button } from "antd";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import '../../styles/UserManagement.css'

const ViewUser = (props) => {
  const { users } = props
  const navigate = useNavigate();

  const handleUserClick = (record) => {
    navigate(`/users/edit/${record.id}`);
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
      render: (text, record) => (
        <a onClick={() => handleUserClick(record)} className="user-name-link">
          {text}
        </a>
      ),
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "geekblue";
        if (role === "Admin") color = "volcano";
        if (role === "Manager") color = "green";
        return (
          <Tag color={color} key={role} className="user-status-tag">
            {role ? role.toUpperCase() : "N/A"}
          </Tag>
        );
      },
    },
  ];

  return (
    <>
      <Card title="User List" variant={"borderless"}>
        <Table
            columns={columns}
            dataSource={users}
            pagination={{ pageSize: 10 }}
        />
      </Card>
    </>
  );
};



const mapStateToProps = (state) => {
  console.log("Redux State:", state)
  return {
    users: state.users.list
  }
}

export default connect(mapStateToProps, null)(ViewUser);

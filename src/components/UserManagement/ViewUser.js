import { Table, Card, Tag, Modal, Button } from "antd";
import { useState } from "react";
import { connect } from "react-redux";
import '../../styles/UserManagement.css'

const ViewUser = (props) => {
  const { users } = props
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserClick = (record) => {
    setSelectedUser(record);
    setIsModalOpen(true);
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
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles) => (
        <>
          {Array.isArray(roles) ? roles.map((role) => {
            let color = "geekblue";
            if (role === "Admin") color = "volcano";
            if (role === "Manager") color = "green";
            return (
              <Tag color={color} key={role} className="user-status-tag">
                {role.toUpperCase()}
              </Tag>
            );
          }) : <Tag>{roles}</Tag>}
        </>
      ),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <Button
    //       type="link"
    //       icon={<EyeOutlined />}
    //       onClick={() => handleUserClick(record)}
    //     >
    //       View
    //     </Button>
    //   ),
    // },
  ];

  return (
    <>
      <Card title="User List" bordered={false}>
        <Table
            columns={columns}
            dataSource={users}
            // loading={loading}
            pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="User Details"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        footer={[
           <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>
        ]}
      >
        {selectedUser && (
          <div>
            <p><strong>Username:</strong> {selectedUser.userName}</p>
            <p><strong>First Name:</strong> {selectedUser.firstName}</p>
            <p><strong>Last Name:</strong> {selectedUser.lastName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Roles:</strong> {Array.isArray(selectedUser.roles) ? selectedUser.roles.join(", ") : selectedUser.roles}</p>
          </div>
        )}
      </Modal>
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

import { Table, Card, Tag, Button, Space, Dropdown, Menu, Modal, Select, message } from "antd";
import { useState, useEffect } from "react";
import { FileOutlined, PlusOutlined, EyeOutlined, EllipsisOutlined, DeleteOutlined, CloudUploadOutlined, ExclamationCircleOutlined, EditOutlined, AuditOutlined, SendOutlined } from "@ant-design/icons";
import { getAllDesigners, deleteDesigner, publishDesigner, bulkPublishDesigner } from "../../actions/designer";
import { getAllUsers } from "../../actions/users";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import DocumentPreview from "../DocumentCompletion/DocumentPreview";
import moment from 'moment';
import { bindActionCreators } from "@reduxjs/toolkit";
import '../../styles/Designer.css'

const { confirm } = Modal;
const { Option } = Select;

const DesignerDocuments = (props) => {
    const { actions, users } = props
    const navigate = useNavigate();
    const [designers, setDesigners] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Preview State
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedDesigner, setSelectedDesigner] = useState(null);

    // Bulk Send State
    const [bulkModalVisible, setBulkModalVisible] = useState(false);
    const [selectedBulkUsers, setSelectedBulkUsers] = useState([]);
    const [isBulkSending, setIsBulkSending] = useState(false);

    useEffect(() => {
        fetchDesigners();
        actions.getAllUsers();
    }, []);

    const fetchDesigners = async () => {
        setLoading(true);
        try {
            const data = await actions.getAllDesigners();
            if (data && Array.isArray(data)) {
                const filtered = data.filter(d => d.status !== 'completed');
                setDesigners(filtered.map(d => ({ ...d, key: d.id })));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = (record) => {
        setSelectedDesigner(record);
        setPreviewVisible(true);
    };

    const handleDelete = (record) => {
        confirm({
            title: 'Are you sure you want to delete this document?',
            icon: <ExclamationCircleOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                const success = await actions.deleteDesigner(record.id);
                if (success) {
                    fetchDesigners();
                }
            },
        });
    };

    const handlePublish = async (record) => {
        const success = await actions.publishDesigner(record.id);
        if (success) {
            fetchDesigners();
        }
    };

    const handleBulkSend = (record) => {
        setSelectedDesigner(record);
        setBulkModalVisible(true);
        setSelectedBulkUsers([]);
    };

    const executeBulkSend = async () => {
        if (selectedBulkUsers.length === 0) {
            message.warning("Please select at least one user");
            return;
        }

        setIsBulkSending(true);
        try {
            const targetUsers = users.filter(u => selectedBulkUsers.includes(u.id));
            const success = await actions.bulkPublishDesigner(selectedDesigner.id, targetUsers);
            if (success) {
                setBulkModalVisible(false);
                fetchDesigners();
            }
        } finally {
            setIsBulkSending(false);
        }
    };

    const handleEdit = (record) => {
        navigate(`/designers/edit/${record.id}`);
    };

    const handleAudit = (record) => {
        Modal.info({
            title: 'Document Audit Summary',
            width: 600,
            content: (
                <div style={{ marginTop: '20px' }}>
                    <p><strong>Published At:</strong> {record.updatedAt ? moment(record.updatedAt).format('MMMM Do YYYY, h:mm:ss a') : 'N/A'}</p>
                    <p style={{ marginBottom: '8px' }}><strong>Assigned Recipients:</strong></p>
                    <ul style={{ paddingLeft: '20px' }}>
                        {record.recipients && record.recipients.length > 0 ? (
                            record.recipients.map((user, idx) => (
                                <li key={idx}>
                                    {user.firstName} {user.lastName} ({user.email || user.userName})
                                </li>
                            ))
                        ) : (
                            <li>No recipients assigned</li>
                        )}
                    </ul>
                    <p style={{ marginTop: '16px', fontStyle: 'italic' }}>
                        This document has been published and sent to the recipients above.
                    </p>
                </div>
            ),
            okText: 'Close',
        });
    };

    const getMenu = (record) => {
        const isPublished = record.status === 'published';
        const isTemplate = record.status === 'template';

        return (
            <Menu>
                <Menu.Item key="preview" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
                    Preview
                </Menu.Item>
                {isPublished && (
                    <Menu.Item key="audit" icon={<AuditOutlined />} onClick={() => handleAudit(record)}>
                        Published Info
                    </Menu.Item>
                )}
                {isTemplate && (
                    <Menu.Item key="bulk-send" icon={<SendOutlined />} onClick={() => handleBulkSend(record)}>
                        Bulk Send
                    </Menu.Item>
                )}
                {!isPublished && (
                    <>
                        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                            Edit
                        </Menu.Item>
                        <Menu.Item key="publish" icon={<CloudUploadOutlined />} onClick={() => handlePublish(record)}>
                            Publish
                        </Menu.Item>
                        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record)}>
                            Delete
                        </Menu.Item>
                    </>
                )}
            </Menu>
        );
    };

    const columns = [
        {
            title: "Document Name",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <span className="document-name-cell">
                    <FileOutlined className="document-icon" />
                    {text}
                </span>
            ),
        },
        {
            title: "Created/Updayed By",
            dataIndex: "updatedBy",
            key: "updatedBy",
            render: (text) => text || 'System Admin',
        },
        {
            title: "Created/Updated At",
            dataIndex: "updatedAt",
            key: "updatedAt",
            render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A',
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "default";
                if (status === "published") color = "success";
                if (status === "template") color = "blue";
                if (status === "draft") color = "warning";
                if (status === "sent") color = "processing";
                return <Tag color={color}>{status ? status.toUpperCase() : 'N/A'}</Tag>;
            },
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Dropdown overlay={getMenu(record)} trigger={['click']}>
                    <Button icon={<EllipsisOutlined />} type="text" />
                </Dropdown>
            ),
        }
    ];

    return (
        <>
            <Card 
                title={
                    <div className="designer-docs-title">
                        <span>Designer Documents</span>
                        <Space>
                            <Button 
                                type="primary" 
                                icon={<PlusOutlined />} 
                                onClick={() => navigate('/designers/create')}
                            >
                                Create Document
                            </Button>
                        </Space>
                    </div>
                } 
                variant="borderless"
            >
                <Table 
                    columns={columns} 
                    dataSource={designers} 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <DocumentPreview 
                visible={previewVisible}
                designer={selectedDesigner}
                onClose={() => setPreviewVisible(false)}
                mode="design"
            />

            <Modal
                title="Bulk Distribution"
                visible={bulkModalVisible}
                onOk={executeBulkSend}
                onCancel={() => setBulkModalVisible(false)}
                confirmLoading={isBulkSending}
                okText="Send To All"
                width={500}
            >
                <div style={{ marginBottom: '16px' }}>
                    <p>Select the users you want to send this template to. Each user will receive their own individual copy to sign.</p>
                </div>
                <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="Select recipients"
                    value={selectedBulkUsers}
                    onChange={setSelectedBulkUsers}
                    optionFilterProp="children"
                >
                    {users.map(user => (
                        <Option key={user.id} value={user.id}>
                            {user.firstName} {user.lastName} ({user.userName})
                        </Option>
                    ))}
                </Select>
            </Modal>
        </>
    );
};

const mapStateToProps = (state) => ({
    users: state.users.list || []
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      getAllDesigners, 
      deleteDesigner, 
      publishDesigner,
      bulkPublishDesigner,
      getAllUsers
    },
    dispatch
  ),
})
export default connect(mapStateToProps, mapDispatchToProps)(DesignerDocuments);

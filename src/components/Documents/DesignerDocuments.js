import { Table, Card, Tag, Button, Space, Dropdown, Menu, Modal, Select, message } from "antd";
import { useState, useEffect } from "react";
import { FileOutlined, PlusOutlined, EyeOutlined, EllipsisOutlined, DeleteOutlined, CloudUploadOutlined, ExclamationCircleOutlined, EditOutlined, AuditOutlined, SendOutlined } from "@ant-design/icons";
import { getAllDesigners, deleteDesigner, publishDesigner, bulkPublishDesigner } from "../../actions/designer";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import DocumentPreview from "../DocumentCompletion/DocumentPreview";
import moment from 'moment';
import { bindActionCreators } from "@reduxjs/toolkit";
import '../../styles/Designer.css'
import { isValidEmail } from "../../utils/validation";

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
            message.warning("Please select at least one user or email");
            return;
        }

        setIsBulkSending(true);
        try {
            const targetUsers = selectedBulkUsers.map(value => {
                const existingUser = users.find(u => u.id === value);
                if (existingUser) {
                    return {
                        id: existingUser.id,
                        userId: existingUser.id,
                        userName: existingUser.userName,
                        firstName: existingUser.firstName,
                        lastName: existingUser.lastName,
                        email: existingUser.email,
                        isExternal: false
                    };
                }
                
                if (isValidEmail(value)) {
                    return {
                        id: value,
                        userId: value,
                        userName: value,
                        firstName: '',
                        lastName: '',
                        email: value,
                        isExternal: true
                    };
                }
                
                return null;
            }).filter(u => u !== null);

            if (targetUsers.length === 0) {
                message.error("No valid users or emails selected");
                return;
            }

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
        const isTemplate = record.type === 'Template Document';

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
            title: "Type",
            dataIndex: "type",
            key: "type",
            render: (type) => (
                <Tag color={type === "Template Document" ? "purple" : "cyan"}>
                    {type || 'Document'}
                </Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status, record) => {
                let color = "default";
                if (status === "published") color = "success";
                if (status === "draft") color = "warning";
                if (status === "sent") color = "processing";
                
                // For templates, we want to emphasize they are templates but still show draft status
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
                title="Bulk Send"
                open={bulkModalVisible}
                onOk={executeBulkSend}
                onCancel={() => setBulkModalVisible(false)}
                confirmLoading={isBulkSending}
                okText="Send To All"
                width={500}  
                styles={{body:{minHeight: 250, overflowY: 'auto', },}}

            >
                <div style={{ marginBottom: '16px' }}>
                    <p>Select the users you want to send this template to. Each user will receive their own individual copy to sign.</p>
                </div>
                <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="Select recipients or type email address"
                    value={selectedBulkUsers}
                    onChange={setSelectedBulkUsers}
                    optionFilterProp="children"
                    tokenSeparators={[',', ' ']}
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
    },
    dispatch
  ),
})
export default connect(mapStateToProps, mapDispatchToProps)(DesignerDocuments);

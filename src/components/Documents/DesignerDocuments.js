import { Table, Card, Tag, Button, Space, Dropdown, Menu, Modal } from "antd";
import { useState, useEffect } from "react";
import { FileOutlined, PlusOutlined, EyeOutlined, EllipsisOutlined, DeleteOutlined, CloudUploadOutlined, ExclamationCircleOutlined, EditOutlined } from "@ant-design/icons";
import { getAllDesigners, deleteDesigner, publishDesigner } from "../../actions/designer";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import DocumentPreview from "../DocumentCompletion/DocumentPreview";
import moment from 'moment';
import { bindActionCreators } from "@reduxjs/toolkit";
import '../../styles/Designer.css'

const { confirm } = Modal;

const DesignerDocuments = (props) => {
    const { actions } = props
    const navigate = useNavigate();
    const [designers, setDesigners] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Preview State
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedDesigner, setSelectedDesigner] = useState(null);

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

    const handleEdit = (record) => {
        navigate(`/designers/edit/${record.id}`);
    };

    const getMenu = (record) => {
        const isPublished = record.status === 'published';
        return (
            <Menu>
                <Menu.Item key="preview" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
                    Preview
                </Menu.Item>
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
                bordered={false}
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
        </>
    );
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      getAllDesigners, 
      deleteDesigner, 
      publishDesigner,
    },
    dispatch
  ),
})
export default connect(null, mapDispatchToProps)(DesignerDocuments);

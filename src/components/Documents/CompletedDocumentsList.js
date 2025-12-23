import { Table, Card, Tag, Button, Dropdown, Menu } from "antd";
import { useState, useEffect } from "react";
import { FilePdfOutlined, EyeOutlined, EllipsisOutlined } from "@ant-design/icons";
import { getAllCompletedDesigners, getDesignerValues } from "../../actions/designer";
import { connect } from "react-redux";
import DocumentPreview from "../DocumentCompletion/DocumentPreview";
import moment from 'moment';
import { bindActionCreators } from "@reduxjs/toolkit";
import '../../styles/Documents.css'

const CompletedDocumentsList = (props) => {
    const { actions } = props
    const [previewVisible, setPreviewVisible] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docValues, setDocValues] = useState({});
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const data = await actions.getAllCompletedDesigners();
            if (data && Array.isArray(data)) {
                setDocuments(data.map(d => ({ ...d, key: d.id })));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (record) => {
        setSelectedDoc(record);
        const values = await actions.getDesignerValues(record.id);
        setDocValues(values || {});
        setPreviewVisible(true);
    };

    const getMenu = (record) => (
        <Menu>
             <Menu.Item key="preview" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
                Preview / Print
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: "Document Name",
            dataIndex: "title",
            key: "title",
            render: (text, record) => (
                <a onClick={() => handlePreview(record)} className="completed-docs-title-link">
                    <FilePdfOutlined className="document-icon-small" />
                    {text}
                </a>
            ),
        },
        {
            title: "Updated By",
            dataIndex: "updatedBy", 
            key: "updatedBy",
            render: (text) => text || 'System',
        },
        {
            title: "Completion Date",
            dataIndex: "updatedAt", 
            key: "updatedAt",
            render: (date) => date ? moment(date).format('YYYY-MM-DD HH:mm') : 'N/A',
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => <Tag color="success">{status ? status.toUpperCase() : 'COMPLETED'}</Tag>,
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
            <Card title="Completed Documents" bordered={false}>
                <Table 
                    columns={columns} 
                    dataSource={documents} 
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <DocumentPreview 
                visible={previewVisible}
                designer={selectedDoc}
                onClose={() => setPreviewVisible(false)}
                initialValues={docValues}
            />
        </>
    );
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      getAllCompletedDesigners, 
      getDesignerValues,
    },
    dispatch
  ),
})

export default connect(null, mapDispatchToProps)(CompletedDocumentsList);

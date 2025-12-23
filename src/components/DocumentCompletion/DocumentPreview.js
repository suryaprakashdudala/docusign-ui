import React, { useState, useEffect } from 'react';
import { Button, Modal, Spin, message} from 'antd';
import { Document, Page, pdfjs } from 'react-pdf';
import '../../styles/DocumentPreview.css';
import { FIELD_TYPES } from '../../constants/constants';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const DocumentPreview = ({ designer, visible, onClose, initialValues = {}, mode = 'view' }) => {
    const [numPages, setNumPages] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const [pageDimensions, setPageDimensions] = useState({});

    useEffect(() => {
        if (visible && designer) {
            fetchPdfUrl();
        }
    }, [visible, designer]);

    const fetchPdfUrl = async () => {
        setLoading(true);
        try {
           const token = localStorage.getItem('token');
           const headers = token ? { Authorization: `Bearer ${token}` } : {};
           
           // Ideally use a configured API client, but using fetch for direct access as per previous pattern
           const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
           const response = await fetch(`${baseUrl}/designers/${designer.id}/view-url`, { headers });
           if (!response.ok) throw new Error('Failed');
           const data = await response.json();
           setPdfUrl(data.url);
           
        } catch (err) {
            console.error("Preview error", err);
            message.error("Could not load PDF preview");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setPageDimensions({});
    };

    const onPageLoadSuccess = (page, index) => {
        const viewport = page.getViewport({ scale: 1 });
        setPageDimensions(prev => ({
            ...prev,
            [index]: {
                width: viewport.width,
                height: viewport.height,
                aspectRatio: viewport.width / viewport.height
            }
        }));
    };

    const renderField = (field, index) => {
        const dims = pageDimensions[index] || { width: 595, height: 842, aspectRatio: 595/842 };
        const renderWidth = 600;
        const renderHeight = renderWidth / dims.aspectRatio;

        const left = (field.x / 100) * renderWidth;
        const top = (field.y / 100) * renderHeight;
        const fieldWidth = field.width || 150;
        const fieldHeight = field.height || 30;

        const val = initialValues[field.id] !== undefined ? initialValues[field.id] : field.defaultValue;

        const isDesignMode = mode === 'design';
        const showPlaceholder = isDesignMode && !val;

        const fieldStyle = {
           left: `${left}px`,
           top: `${top}px`,
           width: `${fieldWidth}px`,
           height: `${fieldHeight}px`,
           border: isDesignMode ? '1px dashed #1890ff' : 'none',
        };

        const displayContent = showPlaceholder ? field.label : val;

        let fieldComponent = null;

        switch (field.type) {
           case FIELD_TYPES.TEXT:
               fieldComponent = (
                   <div className="preview-field-text">
                       {displayContent}
                   </div>
               );
               break;
           case FIELD_TYPES.TEXTAREA:
               fieldComponent = (
                   <div className="preview-field-textarea">
                       {displayContent}
                   </div>
               );
               break;
           case FIELD_TYPES.CHECKBOX:
               fieldComponent = (
                    <div className="preview-field-checkbox">
                        <input type="checkbox" disabled checked={val === 'true' || val === true} className="preview-checkbox-input" />
                    </div>
               );
               break;
           case FIELD_TYPES.RADIO:
               fieldComponent = (
                   <div className="preview-field-radio">
                         <input type="radio" disabled checked={val === 'true' || val === true} className="preview-checkbox-input" />
                   </div>
               );
               break;
           case FIELD_TYPES.SIGNATURE:
               fieldComponent = (
                   <div className={`preview-field-signature ${showPlaceholder ? 'placeholder' : ''}`}>
                       {val ? <img src={val} alt="Sig" className="signature-img"/> : (showPlaceholder ? "Signature" : null)}
                   </div>
               );
               break;
           default:
               fieldComponent = <div className="preview-field-text">{displayContent}</div>;
        }

        return (
            <div key={field.id} className="preview-field-item" style={fieldStyle}>
                {fieldComponent}
            </div>
        );
    };

    return (
        <Modal
            title={`Preview: ${designer?.title}`}
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="print" onClick={handlePrint}>Print</Button>,
                <Button key="close" onClick={onClose}>Close</Button>
            ]}
            className="document-preview-modal custom-modal-style"
        >

            {loading ? <Spin /> : (
                <div className="preview-wrapper print-area">
                     {pdfUrl && (
                        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
                            {Array.from(new Array(numPages), (el, index) => (
                                <div key={`page_${index + 1}`} className="preview-page-container">
                                    <Page 
                                        pageNumber={index + 1} 
                                        width={600} 
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                        onLoadSuccess={(page) => onPageLoadSuccess(page, index + 1)}
                                    />
                                    {designer.fields
                                        ?.filter(f => (f.page || 1) === index + 1)
                                        .map(f => renderField(f, index + 1))
                                    }
                                </div>
                            ))}
                        </Document>
                     )}
                </div>
            )}
        </Modal>
    );
};

export default DocumentPreview;

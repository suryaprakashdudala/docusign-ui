import React from 'react'
import { Document, Page } from 'react-pdf'
import { message, Button, Space } from 'antd'
import { Rnd } from 'react-rnd'
import FieldBadge from './FieldBadge'
import {
  FileTextOutlined,
  EditOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
  BgColorsOutlined
} from '@ant-design/icons'
import { FIELD_TYPES } from '../../constants/constants';
import '../../styles/PdfViewer.css'

const FIELD_ICONS = {
  [FIELD_TYPES.TEXT]: <FileTextOutlined />,
  [FIELD_TYPES.TEXTAREA]: <EditOutlined />,
  [FIELD_TYPES.SIGNATURE]: <BgColorsOutlined />,
  [FIELD_TYPES.RADIO]: <CheckCircleOutlined />,
  [FIELD_TYPES.CHECKBOX]: <CheckSquareOutlined />
}

const DEFAULT_FIELD_WIDTH = 150
const DEFAULT_FIELD_HEIGHT = 30

const PdfViewer = ({
  documentRef,
  documentUrl,
  numPages,
  setNumPages,
  loading,
  error,
  onRetry,
  fields,
  onCreateField,
  onMoveField,
  onFieldClick,
  draggedFieldType,
  draggedField,
  setDraggedField,
  getUserColor,
  getUserName
}) => {
  const [pageSizes, setPageSizes] = React.useState({})
  
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedFieldType) return
    if (!documentRef.current) return

    const pageElements = documentRef.current.querySelectorAll('.react-pdf__Page')
    if (!pageElements || pageElements.length === 0) return

    let targetPage = 1
    let pageElement = null
    let rect = null

    for (let i = 0; i < pageElements.length; i++) {
        const r = pageElements[i].getBoundingClientRect()
        if (e.clientY >= r.top && e.clientY <= r.bottom) {
            pageElement = pageElements[i]
            rect = r
            targetPage = i + 1
            break
        }
    }

    if (!pageElement) {
        pageElement = pageElements[0]
        rect = pageElement.getBoundingClientRect()
        targetPage = 1
    }

    const measured = pageSizes[targetPage]
    const pdfWidth = measured?.width || rect.width
    const pdfHeight = measured?.height || rect.height

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const maxX = pdfWidth - DEFAULT_FIELD_WIDTH
    const maxY = pdfHeight - DEFAULT_FIELD_HEIGHT
    const pdfX = Math.max(0, Math.min(maxX, x))
    const pdfY = Math.max(0, Math.min(maxY, y))

    const xPercent = (pdfX / pdfWidth) * 100
    const yPercent = (pdfY / pdfHeight) * 100

    onCreateField({ page: targetPage, xPercent, yPercent })
  }

  const onPageLoadSuccess = (page, pageNum) => {
      const viewport = page.getViewport({ scale: 1 })
      const scale = 600 / viewport.width
      const height = viewport.height * scale
      
      setPageSizes(prev => ({
          ...prev,
          [pageNum]: {
              width: 600,
              height: height
          }
      }))
  }

  const renderField = (field, pageNumber) => {
    if (field.page !== pageNumber) return null

    const userColor = getUserColor(field.userId)
    const pageSize = pageSizes[pageNumber] || {
      width: 600,
      height: 600 * 1.414
    }
    const pdfWidth = pageSize.width
    const pdfHeight = pageSize.height

    const fieldWidth = field.width || DEFAULT_FIELD_WIDTH
    const fieldHeight = field.height || DEFAULT_FIELD_HEIGHT

    const x = (field.x / 100) * pdfWidth
    const y = (field.y / 100) * pdfHeight

    return (
      <Rnd
        key={field.id}
        size={{ width: fieldWidth, height: fieldHeight }}
        position={{ x, y }}
        minWidth={50}
        minHeight={20}
        bounds="parent"
        enableResizing={{
          top: true, right: true, bottom: true, left: true,
          topRight: true, bottomRight: true, bottomLeft: true, topLeft: true
        }}
        onDragStop={(e, d) => {
            let newX = d.x;
            let newY = d.y;
            const maxX = pdfWidth - fieldWidth;
            const maxY = pdfHeight - fieldHeight;
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            const xPercent = (newX / pdfWidth) * 100;
            const yPercent = (newY / pdfHeight) * 100;
            
            onMoveField(field.id, { 
                page: pageNumber, 
                xPercent, 
                yPercent, 
                width: fieldWidth, 
                height: fieldHeight 
            });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
             const newWidth = parseInt(ref.style.width, 10);
             const newHeight = parseInt(ref.style.height, 10);
             
             const newX = position.x;
             const newY = position.y;

             const xPercent = (newX / pdfWidth) * 100;
             const yPercent = (newY / pdfHeight) * 100;

             onMoveField(field.id, { 
                 page: pageNumber, 
                 xPercent, 
                 yPercent,
                 width: newWidth,
                 height: newHeight
             });
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
             e.stopPropagation()
             onFieldClick(field)
        }}
        className="pdf-field-rnd"
        style={{
             border: `2px solid ${userColor}`,
        }}
      >
        <div className="pdf-field-content">
            <FieldBadge
                icon={FIELD_ICONS[field.type]}
                label={field.label}
                required={field.required}
                userColor={userColor}
                userInitial={getUserName(field.userId).charAt(0).toUpperCase()}
            />
        </div>
      </Rnd>
    )
  }

  return (
    <div
      ref={documentRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`pdf-viewer-container ${draggedFieldType ? 'cursor-crosshair' : 'cursor-default'}`}
    >
      {loading && (
        <div className="pdf-loading-container">
          <div>Loading document...</div>
        </div>
      )}

      {error && !loading && (
        <div className="pdf-error-container">
          <div className="pdf-error-title">
            {error}
          </div>
          <Space>
            <Button onClick={onRetry} type="primary">
              Retry
            </Button>
            {documentUrl && (
              <Button onClick={onRetry}>
                Refresh URL
              </Button>
            )}
          </Space>
        </div>
      )}

      {!documentUrl && !loading && !error && (
        <div className="pdf-no-document-container">
          <div className="pdf-no-document-title">
            No document available
          </div>
          <div className="pdf-no-document-subtitle">
            Please ensure the document was uploaded in step 1
          </div>
          <Button onClick={onRetry} type="primary">
            Load Document
          </Button>
        </div>
      )}

      {documentUrl && !loading && (
        <div className="pdf-document-wrapper">
          <Document
            file={documentUrl}
            onLoadSuccess={({ numPages: n }) => {
              setNumPages(n)
            }}
            onLoadError={(err) => {
              console.error('PDF load error:', err)
              message.error('Failed to load PDF document')
            }}
            loading={
              <div className="pdf-loading-container">
                <div>Loading PDF...</div>
              </div>
            }
          >
            {numPages > 0 && (
              <div className="pdf-pages-wrapper">
                {Array.from({ length: numPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <div
                      key={pageNum}
                      className={`pdf-page-container ${pageNum === numPages ? 'last-page' : ''}`}
                      style={{
                        height: pageSizes[pageNum]?.height || 'auto'
                      }}
                    >
                      <Page
                        pageNumber={pageNum}
                        width={600}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        onLoadSuccess={(page) => onPageLoadSuccess(page, pageNum)}
                        onRenderError={(err) => {
                          console.error('Page render error:', err)
                          message.error(`Failed to render page ${pageNum}`)
                        }}
                      />
                      <div className="pdf-fields-layer">
                        {fields
                          .filter((f) => f.page === pageNum)
                          .map((field) => (
                            <React.Fragment key={field.id}>
                              {renderField(field, pageNum)}
                            </React.Fragment>
                          ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </Document>
        </div>
      )}
    </div>
  )
}

export default PdfViewer
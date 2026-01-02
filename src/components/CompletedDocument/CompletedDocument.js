import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Spin, message } from 'antd'
import { Document, Page, pdfjs } from 'react-pdf'
import { getDesigner, getDesignerValues, getViewUrl } from '../../actions/designer'
import { bindActionCreators } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import { FIELD_TYPES } from '../../constants/constants';
import '../../styles/Documents.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`


const CompletedDocument = (props) => {
  const {actions} = props
  const { designerId } = useParams()
  const [loading, setLoading] = useState(true)
  const [designer, setDesigner] = useState(null)
  const [fieldValues, setFieldValues] = useState({})
  const [pdfUrl, setPdfUrl] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pageSizes, setPageSizes] = useState({})

  useEffect(() => {
    fetchData()
  }, [designerId])

  const fetchData = async () => {
    try {
      // 1. Get designer (PDF layout)
      const des = await actions.getDesigner(designerId)
      setDesigner(des)
      
      // 2. Get PDF URL
      const { url } = await actions.getViewUrl(designerId)
      setPdfUrl(url)

      // 3. Get ALL field values (consolidated)
      const values = await actions.getDesignerValues(designerId)
      setFieldValues(values)
      
      setLoading(false)
    } catch (err) {
      console.error('Failed to load completed document', err)
      message.error('Failed to load document')
      setLoading(false)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
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
    const value = fieldValues[field.id] || ''
    
    const pdfWidth = 600 
    const pageSize = pageSizes[pageNumber] || { width: 600, height: 600 * 1.414 }
    const pdfHeight = pageSize.height
    const left = (field.x / 100) * pdfWidth
    const top = (field.y / 100) * pdfHeight
    
    const fieldWidth = field.width || 150
    const fieldHeight = field.height || 30
    
    const fieldStyle = {
      left: `${left}px`,
      top: `${top}px`,
      width: `${fieldWidth}px`,
      height: `${fieldHeight}px`,
    }

    let fieldComponent = null

    switch (field.type) {
      case FIELD_TYPES.TEXT:
        fieldComponent = (
          <div className="completed-field-text">
             {value}
          </div>
        )
        break
      case FIELD_TYPES.TEXTAREA:
        fieldComponent = (
          <div className="completed-field-textarea" style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
             {value}
          </div>
        )
        break
      case FIELD_TYPES.SIGNATURE:
        fieldComponent = (
           <div className="completed-field-signature">
            {value ? (
                <img 
                    src={value} 
                    alt="Signature" 
                    className="signature-img"
                />
            ) : null}
          </div>
        )
        break
      case FIELD_TYPES.CHECKBOX:
        fieldComponent = (
          <div className="completed-field-checkbox">
             <input type="checkbox" checked={value === true || value === 'true'} readOnly disabled className="checkbox-input" />
          </div>
        )
        break
      case FIELD_TYPES.RADIO:
        fieldComponent = (
          <div className="completed-field-checkbox">
             <input type="radio" checked={value === true || value === 'true'} readOnly disabled className="checkbox-input" />
          </div>
        )
        break
      default:
        fieldComponent = (
           <div className="default-field-value">{value}</div>
        )
    }

    return (
      <div key={field.id} className="document-field" style={fieldStyle}>
        {fieldComponent}
      </div>
    )
  }

  if (loading) return <Spin className="loading-spinner" />

  return (
    <div className="completed-document-container">
      <Card title={`Completed: ${designer?.title || 'Document'}`} className="completed-document-card">
        <div className="completion-instruction">
             This is the final document with all signatures and data.
        </div>

        {/* PDF Renderer */}
        <div className="document-viewer-wrapper">
           <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
             {Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="document-page-container">
                    <Page 
                        pageNumber={index + 1} 
                        width={600} 
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        onLoadSuccess={(page) => onPageLoadSuccess(page, index + 1)}
                    />
                     {/* Using null-safe check for designer.fields */}
                    {designer?.fields
                        ?.filter(f => (f.page || 1) === index + 1)
                        .map(f => renderField(f, index + 1))
                    }
                </div>
             ))}
           </Document>
        </div>
      </Card>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      getDesigner, 
      getDesignerValues, 
      getViewUrl
    },
    dispatch
  ),
})


export default connect(null, mapDispatchToProps)(CompletedDocument)

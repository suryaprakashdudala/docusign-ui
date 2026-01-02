import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Input, message, Spin, Tag, Modal, Space, Alert } from 'antd'
import { Page, Document, pdfjs } from 'react-pdf'
import SignatureCanvas from 'react-signature-canvas'
import {getDocumentByToken, getDesigner, getViewUrl, submitCompletedDocument } from '../../actions/designer'
import {connect} from 'react-redux'
import { bindActionCreators } from '@reduxjs/toolkit'
import { FIELD_TYPES } from '../../constants/constants';
import '../../styles/Documents.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const { TextArea } = Input


const DocumentCompletion = (props) => {
  const {actions} = props
  const { token } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completionData, setCompletionData] = useState(null)
  const [fieldValues, setFieldValues] = useState({})
  const [designer, setDesigner] = useState(null)
  const [numPages, setNumPages] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)
  
  const [signatureModalVisible, setSignatureModalVisible] = useState(false)
  const [currentSignatureFieldId, setCurrentSignatureFieldId] = useState(null)
  const sigPad = useRef(null)

  const [pageSizes, setPageSizes] = useState({})
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false)

  useEffect(() => {
    if (signatureModalVisible && sigPad.current && typeof sigPad.current.clear === 'function') {
      sigPad.current.clear()
    }
  }, [signatureModalVisible])

  const [isReadOnly, setIsReadOnly] = useState(false)
  
  useEffect(() => {
    fetchCompletionData()
  }, [token])

  const fetchCompletionData = async () => {
    try {
      const completion = await actions.getDocumentByToken(token)
      setCompletionData(completion)
      
      const designerData = await actions.getDesigner(completion.designerId)
      setDesigner(designerData)
      
      const { url } = await actions.getViewUrl(completion.designerId)
      setPdfUrl(url)

      if (completion.status === 'completed') {
          setIsReadOnly(true)
          message.info('This document has already been submitted.')
      }

      const initialValues = {}
      const consolidated = completion.consolidatedData || {}
      
      if (designerData.fields) {
          designerData.fields.forEach(f => {
              // Use consolidated data if exists, otherwise default value
              initialValues[f.id] = (consolidated[f.id] !== undefined && consolidated[f.id] !== null && consolidated[f.id] !== '')
                ? consolidated[f.id] 
                : (f.defaultValue || '')
          })
      }
      setFieldValues(initialValues)
      
      setLoading(false)
    } catch (err) {
      console.error('Failed to load document', err)
      message.error('Invalid or expired link')
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

    if (pageNum === 1) {
        setIsDocumentLoaded(true)
    }
  }

  const [errors, setErrors] = useState({})


  const handleFieldChange = (id, value) => {
    if (isReadOnly) return

    setFieldValues(prev => ({
      ...prev,
      [id]: value
    }))
    if (errors[id]) {
        setErrors(prev => ({
            ...prev,
            [id]: null
        }))
    }
  }

  
  const openSignatureModal = (fieldId) => {
    if (isReadOnly) return
    setCurrentSignatureFieldId(fieldId)
    setSignatureModalVisible(true)
  }

  const handleSignatureSave = () => {
    if (sigPad.current.isEmpty()) {
        message.warning('Please provide a signature')
        return
    }
    const signatureData = sigPad.current.getCanvas().toDataURL('image/png')
    handleFieldChange(currentSignatureFieldId, signatureData)
    setSignatureModalVisible(false)
    setCurrentSignatureFieldId(null)
  }

  const handleSubmit = async () => {
    if (isReadOnly) return
    if (!designer || !designer.fields) return

    const myFields = designer.fields.filter(f => isFieldEnabled(f))
    const newErrors = {}

    myFields.forEach(field => {
        if (field.required) {
            const val = fieldValues[field.id]
            if (!val || (typeof val === 'string' && !val.trim())) {
                newErrors[field.id] = 'This field is required'
            }
        }
    })

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        message.error('Please fill the required fields')
        return
    }

    setSubmitting(true)
    try {
      await actions.submitCompletedDocument(completionData.designerId, {
        token,
        userId: completionData.currentUserId,
        fieldValues
      })
      message.success('Document submitted successfully!')
      navigate('/document-submitted') 
    } catch (err) {
      console.error('Submission failed', err)
      message.error('Failed to submit document')
    } finally {
      setSubmitting(false)
    }
  }

  const isFieldEnabled = (field) => {
    return !isReadOnly && completionData && field.userId === completionData.currentUserId
  }

  const renderField = (field, pageNumber) => {
    const enabled = isFieldEnabled(field)
    const value = fieldValues[field.id] || ''
    const error = errors[field.id]
    
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
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={!enabled}
            placeholder={field.label}
            status={error ? 'error' : ''}
            className="full-size-input"
          />
        )
        break
      case FIELD_TYPES.TEXTAREA:
        fieldComponent = (
          <TextArea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={!enabled}
            placeholder={field.label}
            status={error ? 'error' : ''}
            className="full-size-input resize-none"
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        )
        break
      case FIELD_TYPES.SIGNATURE:
        fieldComponent = (
          <div 
            onClick={() => {
                if (enabled) {
                    openSignatureModal(field.id)
                }
            }}
            className={`signature-field-interactive ${error ? 'has-error' : ''} ${!enabled ? 'is-disabled' : ''}`}
          >
            {value ? (
                <img 
                    src={value} 
                    alt="Signature" 
                    className="signature-img"
                />
            ) : (
                <span className={`signature-placeholder ${error ? 'has-error' : ''}`}>Click to sign</span>
            )}
          </div>
        )
        break
      case FIELD_TYPES.CHECKBOX:
        fieldComponent = (
          <div className="completed-field-checkbox">
              <input
                type="checkbox"
                checked={value === true || value === 'true'}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                disabled={!enabled}
                className={`checkbox-input ${error ? 'has-error' : ''}`}
              />
          </div>
        )
        break
      case FIELD_TYPES.RADIO:
        fieldComponent = (
          <div className="completed-field-checkbox">
              <input
                type="radio"
                checked={value === true || value === 'true'}
                onClick={() => {
                    if (enabled) {
                         handleFieldChange(field.id, true)
                    }
                }}
                disabled={!enabled}
                className={`checkbox-input radio-input ${error ? 'has-error' : ''}`}
              />
          </div>
        )
        break
      default:
        fieldComponent = (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            disabled={!enabled}
            placeholder={field.label}
            status={error ? 'error' : ''}
            className="full-size-input"
          />
        )
    }

    return (
      <div key={field.id} className="document-field" style={fieldStyle}>
        
        {fieldComponent}
        
        {error && (
            <div className="document-field-error">
                {error}
            </div>
        )}
      </div>
    )

  }

  if (loading) return <Spin className="loading-spinner" />

  return (
    <div className="completed-document-container">
      <Card title={designer?.title || 'Document Completion'} className="completed-document-card">
        {isReadOnly && (
            <Alert
                message="Document Already Submitted"
                description="This document has already been completed and cannot be edited. You are viewing a read-only version."
                type="info"
                showIcon
                style={{ marginBottom: '20px' }}
            />
        )}
        <div className="completion-instruction">
             {isReadOnly ? 'Viewing read-only version of submitted document.' : 'Please fill in the fields assigned to you. Fields assigned to other users are disabled.'}
        </div>

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
                    {designer?.fields
                        ?.filter(f => (f.page || 1) === index + 1)
                        .map(f => renderField(f, index + 1))
                    }
                </div>
             ))}
           </Document>
        </div>
        {designer &&
          <div className="completion-footer">
            <Space>
              <Button onClick={() => navigate('/')}>Cancel</Button>
              {!isReadOnly && (
                  <Button
                    type="primary"
                    size="large"
                    loading={submitting}
                    onClick={handleSubmit}
                    disabled={!isDocumentLoaded}
                  >
                    Submit Document
                  </Button>
              )}
            </Space>
          </div>
        }
      </Card>

      <Modal
        title="Draw Your Signature"
        open={signatureModalVisible}
        onOk={handleSignatureSave}
        onCancel={() => setSignatureModalVisible(false)}
        width={500}
      >
        <div className="signature-modal-container">
            <SignatureCanvas 
                ref={sigPad}
                penColor='black'
                canvasProps={{width: 450, height: 200, className: 'sigCanvas'}} 
            />
        </div>
        <div className="clear-button-wrapper">
            <Button size="small" onClick={() => sigPad.current.clear()}>Clear</Button>
        </div>
      </Modal>
    </div>
  )
}


const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      getDocumentByToken, 
      getDesigner, 
      getViewUrl,
      submitCompletedDocument
    },
    dispatch
  ),
})

export default connect(null, mapDispatchToProps)(DocumentCompletion)


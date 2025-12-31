import React, { useState, useEffect } from 'react'
import { Steps, Card, Spin, message } from 'antd'
import { bindActionCreators } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import { useParams } from 'react-router-dom' 
import DesignerUpload from './DesignerUpload'
import UserSelection from './UserSelection'
import DesignerConfig from './DesignerConfig'
import { createDesigner, requestPresignedUrl, updateDesignerMetadata, getDesigner } from '../../actions/designer'
import '../../styles/DesignerStepper.css'

const { Step } = Steps

const DesignerStepper = ({ actions }) => {
  const { id } = useParams()
  const [current, setCurrent] = useState(0)
  const [designer, setDesigner] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log("DesignerStepper mounted. ID:", id);
    if (id) {
       fetchDesignerData(id)
    }
  }, [id])

  const fetchDesignerData = async (designerId) => {
      console.log("Fetching designer data for:", designerId);
      setLoading(true)
      try {
          const data = await actions.getDesigner(designerId)
          console.log("Fetched designer data:", data);
          if(data) {
              setDesigner(data)
              if(data.recipients && data.recipients.length > 0) {
                  setSelectedUsers(data.recipients)
                  setCurrent(2) 
              } else {
                  setCurrent(1)
              }
          }
      } catch (e) {
          console.error("Failed to load designer", e)
          message.error("Failed to load designer for editing")
      } finally {
          setLoading(false)
      }
  }

  const steps = [
    {
      title: 'Upload Document',
      content: (
        <DesignerUpload
          actions={actions}
          onComplete={(designerData) => {
            setDesigner(designerData)
            setCurrent(1)
          }}
        />
      ),
    },
    {
      title: 'Select Users',
      content: (
        <UserSelection
          actions={actions}
          designer={designer}
          onComplete={(updatedDesigner) => {
            setDesigner(updatedDesigner)
            setSelectedUsers(updatedDesigner.recipients)
            setCurrent(2)
          }}
          onBack={() => {
              if (id) {
                  message.info("Cannot change document file while editing. Retrieve a new document to start over.")
              } else {
                  setCurrent(0)
              }
          }}
        />
      ),
    },
    {
      title: 'Configure Fields',
      content: (
        <DesignerConfig
          actions={actions}
          designer={designer}
          selectedUsers={selectedUsers}
          onBack={() => setCurrent(1)}
          onFieldsUpdate={(newFields) => {
             setDesigner(prev => ({ ...prev, fields: newFields }))
          }}
        />
      ),
    },
  ]
  
  if (loading) return <div className="designer-stepper-loading"><Spin size="large" /></div>

  return (
    <div className="designer-stepper-container">
      <Card>
        <Steps current={current} className="designer-stepper-steps">
          {steps.map((item, index) => (
            <Step key={item.title} title={item.title} disabled={id && index === 0} />
          ))}
        </Steps>
        <div className="steps-content">{steps[current].content}</div>
      </Card>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      createDesigner,
      requestPresignedUrl,
      updateDesignerMetadata,
      getDesigner,
    },
    dispatch
  ),
})

export default connect(null, mapDispatchToProps)(DesignerStepper)


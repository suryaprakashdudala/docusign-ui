import { useState, useEffect, useRef } from 'react'
import { Layout, message, Modal } from 'antd'
import { bindActionCreators } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import {
  updateDesignerMetadata,
  getDesigner
} from '../../actions/designer'

import SidebarLeft from './SidebarLeft'
import SidebarRight from './SidebarRight'
import PdfViewer from './PdfViewer'
import FieldDrawer from './FieldDrawer'
import { useNavigate } from 'react-router-dom'
import '../../styles/DesignerConfig.css'
import { FIELD_LABELS } from '../../constants/constants'
import { generateColor } from '../../utils/colorUtils'

const { Sider, Content } = Layout

const DesignerConfig = ({ actions, designer, selectedUsers, onBack, onFieldsUpdate }) => {
  const [numPages, setNumPages] = useState(0)
  const [documentUrl, setDocumentUrl] = useState(null)
  const [fields, setFields] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [draggedFieldType, setDraggedFieldType] = useState(null)
  const [draggedField, setDraggedField] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

  const [form] = FieldDrawer.useDrawerForm()
  const documentRef = useRef(null)

  useEffect(() => {
    if (designer?.id) {
      loadDesigner()
    } else {
      setLoading(false)
      setError('No designer selected. Please go back and complete the previous steps.')
    }
  }, [designer?.id])

  useEffect(() => {
    if (documentUrl) setError(null)
  }, [documentUrl])

  const loadDesigner = async () => {
    if (!designer?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const designerData = await actions.getDesigner(designer.id)

      if (designerData.viewUrl) {
        setDocumentUrl(designerData.viewUrl)
      } else {
        setError('Document URL not available. Please ensure the document was uploaded successfully.')
      }

      if (designerData.fields) setFields(designerData.fields)
      if (designerData.pages) setNumPages(designerData.pages)

      if (selectedUsers && selectedUsers.length > 0) {
        setSelectedUser(selectedUsers[0].userId)
      }
    } catch (err) {
      console.error('Failed to load designer:', err)
      setError('Failed to load designer data. Please try again.')
      message.error('Failed to load designer')
    } finally {
      setLoading(false)
    }
  }

  const getUserColor = (userId) => {
    const user = selectedUsers?.find(u => u.userId === userId || u.id === userId)
    return user?.color || generateColor(0)
  }

  const getUserName = (userId) => {
    const user = selectedUsers?.find(u => u.userId === userId || u.id === userId)
    return user
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName
      : 'Unknown'
  }

  const handleControlDragStart = (e, fieldType) => {
    setDraggedFieldType(fieldType)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleCreateField = ({ page, xPercent, yPercent }) => {
    if (!draggedFieldType || !selectedUser) return

    const newField = {
      id: `field_${Date.now()}`,
      type: draggedFieldType,
      page,
      x: xPercent,
      y: yPercent,
      userId: selectedUser,
      label: FIELD_LABELS[draggedFieldType],
      required: false,
      width: 150,
      height: 30
    }

    setEditingField(newField)
    setDrawerVisible(true)
    form.setFieldsValue({
      label: newField.label,
      required: newField.required
    })
    setDraggedFieldType(null)
  }

  const handleMoveField = (id, { page, xPercent, yPercent, width, height }) => {
    setFields(prev =>
      prev.map(f =>
        f.id === id
          ? {
              ...f,
              page,
              x: xPercent,
              y: yPercent,
              width: width || f.width,
              height: height || f.height
            }
          : f
      )
    )
  }

  const handleFieldClick = (field) => {
    setEditingField(field)
    form.setFieldsValue({
      label: field.label,
      required: field.required
    })
    setDrawerVisible(true)
  }

  const handleSaveField = async (values) => {
    if (!editingField) return
    const updatedField = { ...editingField, ...values }

    const updatedFields = (() => {
      const idx = fields.findIndex(f => f.id === editingField.id)
      if (idx >= 0) {
        const copy = [...fields]
        copy[idx] = updatedField
        return copy
      }
      return [...fields, updatedField]
    })()

      const loDesigner = {
        ...designer,
        fields: updatedFields
      }
    setFields(updatedFields)
    if(onFieldsUpdate) onFieldsUpdate(updatedFields);
    try {
      await actions.updateDesignerMetadata(designer.id, loDesigner)
      message.success('Field saved successfully')
    } catch (err) {
      console.error('Failed to save field', err)
      message.error('Failed to save field')
    } finally {
      setDrawerVisible(false)
      setEditingField(null)
      form.resetFields()
    }
  }

  const handleDeleteField = async () => {
    if (!editingField) return
    const updatedFields = fields.filter(f => f.id !== editingField.id)
    setFields(updatedFields)
    if(onFieldsUpdate) onFieldsUpdate(updatedFields);
    
      const loDesigner = {
        ...designer,
        fields: updatedFields
      }
    await actions.updateDesignerMetadata(designer.id, loDesigner)
    message.success('Field deleted')
    setDrawerVisible(false)
    setEditingField(null)
    form.resetFields()
  }

  const handleSubmit = async (isTemplate = false) => {
    if (!designer?.id) {
      message.error('Designer not found')
      return
    }
    if (fields.length === 0) {
      Modal.warning({
        title: 'No Fields Added',
        content: 'Please add at least one field to the document before saving the configuration.',
        okText: 'Got it',
      });
      return
    }
    if (!selectedUsers || selectedUsers.length === 0) {
      message.warning('Please select at least one user')
      return
    }

    const usersWithoutEmail = selectedUsers.filter(u => !u.email)
    if (usersWithoutEmail.length > 0) {
      message.error(
        `Some users don't have email addresses: ${usersWithoutEmail
          .map(u => u.firstName || u.userName)
          .join(', ')}`
      )
      return
    }

    setIsSubmitting(true)
    try {
      
      const loDesigner = {
        ...designer,
        fields,
        status: isTemplate ? 'template' : 'draft',
        pages: numPages
      }
      await actions.updateDesignerMetadata(designer.id, loDesigner)
      // await actions.sendDesignerEmails(designer.id, selectedUsers)
      message.success(isTemplate ? "Template saved successfully" : "Document saved successfully");
      navigate('/documents/designer')
    } catch (err) {
      console.error('Failed to submit designer:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout className="designer-layout">
      <Sider
        width={250}
        className="designer-sider-left"
      >
        <SidebarLeft
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          selectedUsers={selectedUsers}
          onBack={onBack}
          onControlDragStart={handleControlDragStart}
        />
      </Sider>

      <Content className="designer-content">
        <PdfViewer
          documentRef={documentRef}
          documentUrl={documentUrl}
          numPages={numPages}
          setNumPages={setNumPages}
          loading={loading}
          error={error}
          onRetry={loadDesigner}
          fields={fields}
          onCreateField={handleCreateField}
          onMoveField={handleMoveField}
          onFieldClick={handleFieldClick}
          draggedFieldType={draggedFieldType}
          draggedField={draggedField}
          setDraggedField={setDraggedField}
          getUserColor={getUserColor}
          getUserName={getUserName}
        />
      </Content>

      <Sider
        width={200}
        className="designer-sider-right"
      >
        <SidebarRight
          numPages={numPages}
          totalFields={fields.length}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </Sider>

      <FieldDrawer
        visible={drawerVisible}
        form={form}
        field={editingField}
        onClose={() => {
          setDrawerVisible(false)
          setEditingField(null)
          form.resetFields()
        }}
        onSave={handleSaveField}
        onDelete={handleDeleteField}
        getUserColor={getUserColor}
        getUserName={getUserName}
      />
    </Layout>
  )
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      updateDesignerMetadata,
      getDesigner
    },
    dispatch
  )
})

export default connect(null, mapDispatchToProps)(DesignerConfig)
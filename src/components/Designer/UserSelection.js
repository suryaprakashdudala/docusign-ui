import React, { useState, useEffect } from 'react'
import { Card, Select, Button, Tag, Space, message, Checkbox } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import { updateDesignerMetadata } from '../../actions/designer'
import { bindActionCreators } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import '../../styles/UserSelection.css'
import { generateColor } from '../../utils/colorUtils'
import { isValidEmail } from '../../utils/validation'

const { Option } = Select


const UserSelection = ({ actions, designer, onComplete, onBack, users }) => {
  const [selectedValues, setSelectedValues] = useState([])
  const [isTemplate, setIsTemplate] = useState(false)

  useEffect(() => {
    if (designer?.type === 'Template Document') {
      setIsTemplate(true)
    }

    if (designer?.recipients?.length) {
      const existingValues = designer.recipients.map(
        r => r.userId || r.email
      )
      // If it's a template, the only recipient might be the placeholder "Signer"
      if (designer?.type === 'Template Document' && designer.recipients[0]?.userId === 'placeholder_signer') {
          setSelectedValues([])
      } else {
          setSelectedValues(existingValues)
      }
    }
  }, [designer])

  const handleUserChange = (values) => {
    const removedUsers = selectedValues.filter(v => !values.includes(v));

    if (removedUsers.length > 0 && designer && designer.fields) {
       for (const removedUserId of removedUsers) {
           const hasFields = designer.fields.some(f => f.userId === removedUserId);
           if (hasFields) {
               const u = users.find(user => user.id === removedUserId) || { userName: removedUserId };
               const name = u.firstName ? `${u.firstName} ${u.lastName}` : u.userName;
               message.error(`Cannot remove user "${name}" because they have fields assigned.`);
               return; 
           }
       }
    }

    const invalid = values.find(
      v => !users.some(u => u.id === v) && !isValidEmail(v)
    )

    if (invalid) {
      message.error(`Invalid email address: ${invalid}`)
      return
    }

    setSelectedValues(values)
  }

  const buildRecipients = () => {
    if (isTemplate) {
        return []
    }

    return selectedValues.map((value, index) => {
      const user = users.find(u => u.id === value)

      if (user) {
        return {
          id: user.id,
          userId: user.id,
          userName: user.userName,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isExternal: false,
          color: generateColor(index)
        }
      }

      return {
        id: value,
        userId: null,
        userName: value,
        firstName: '',
        lastName: '',
        email: value,
        isExternal: true,
        color: generateColor(index)
      }
    })
  }

  const handleNext = async () => {
    if (!isTemplate && !selectedValues.length) {
      message.warning('Please select at least one user or email')
      return
    }

    try {
      const recipients = buildRecipients()
      const updatedType = isTemplate ? 'Template Document' : 'Document';
      const updatedStatus = isTemplate ? 'draft' : (designer?.status);

      const updatedDesigner = {
        ...designer,
        status: updatedStatus,
        type: updatedType,
        recipients
      };

      await actions.updateDesignerMetadata(designer.id, updatedDesigner)

      message.success(isTemplate ? "Template mode enabled" : "Users saved successfully");
      onComplete?.(updatedDesigner)
    } catch {
      message.error('Failed to save configuration')
    }
  }

  const getSelectedDisplayUsers = () =>
    selectedValues.map(value => {
      const user = users.find(u => u.id === value)
      return (
        user || {
          id: value,
          email: value,
          isExternal: true
        }
      )
    })

  return (
    <div>
      <Card title="Recipients Configuration" className="user-selection-card">
        <Space direction="vertical" className="user-selection-space" size="large">
          <div className="template-toggle-section" style={{ marginBottom: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
            <Checkbox 
                checked={isTemplate} 
                onChange={e => setIsTemplate(e.target.checked)}
                className="template-checkbox"
                disabled={isTemplate}
            >
              <span style={{ fontWeight: 600, fontSize: '16px' }}>
                <FileTextOutlined style={{ marginRight: '8px' }} />
                Create as a reusable Template
              </span>
            </Checkbox>
            <p style={{ marginTop: '8px', marginLeft: '24px', color: '#666' }}>
                Templates are generic configurations that can be sent to anyone later. No specific users needed now.
            </p>
          </div>

          {!isTemplate && (
            <>
              <div>
                <label className="user-selection-label">
                  Select Users or Add Emails:
                </label>

                <Select
                  mode="tags"
                  className="user-selection-select"
                  placeholder="Select users or type an email address"
                  value={selectedValues}
                  onChange={handleUserChange}
                  optionLabelProp="label"
                  tokenSeparators={[',', ' ']}
                >
                  {users.map(user => (
                    <Option
                      key={user.id}
                      value={user.id}
                      label={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName}
                    >
                      <Space>
                        <UserOutlined />
                        <span>{user.firstName} {user.lastName}</span>
                        <span className="user-selection-username">({user.userName})</span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </div>

              {selectedValues.length > 0 && (
                <div>
                  <label className="user-selection-label">
                    Selected Recipients ({selectedValues.length}):
                  </label>

                  <Space wrap>
                    {getSelectedDisplayUsers().map((user, index) => (
                      <Tag
                        key={user.id}
                        color={generateColor(index)}
                        className="user-selection-tag"
                      >
                        {user.isExternal ? (
                          <>
                            <MailOutlined /> {user.email}
                          </>
                        ) : (
                          <>
                            <UserOutlined /> {user.firstName} {user.lastName}
                          </>
                        )}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}
            </>
          )}

          {isTemplate && (
              <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '4px' }}>
                  <Space direction="vertical">
                      <FileTextOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                      <div style={{ fontWeight: 500 }}>Generic Template Mode Active</div>
                      <div style={{ color: '#888' }}>You can skip recipient selection and proceed to design the document structure.</div>
                  </Space>
              </div>
          )}
        </Space>
      </Card>

      <div className="user-selection-actions">
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          Back
        </Button>

        <Button type="primary" icon={<ArrowRightOutlined />} onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
const mapStateToProps = (state) => ({
  users : state.users.list
})
const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      updateDesignerMetadata
    },
    dispatch
  )
})

export default connect(mapStateToProps, mapDispatchToProps)(UserSelection)

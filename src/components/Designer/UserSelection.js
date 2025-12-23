import React, { useState, useEffect } from 'react'
import { Card, Select, Button, Tag, Space, message } from 'antd'
import {
  UserOutlined,
  MailOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'
import { updateDesignerMetadata } from '../../actions/designer'
import { bindActionCreators } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import '../../styles/UserSelection.css'
import { generateColor } from '../../utils/colorUtils'

const { Option } = Select

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const UserSelection = ({ actions, designer, onComplete, onBack, users }) => {
  const [selectedValues, setSelectedValues] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    if (designer?.recipients?.length) {
      const existingValues = designer.recipients.map(
        r => r.userId || r.email
      )
      setSelectedValues(existingValues)
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

  const buildRecipients = () =>
    selectedValues.map((value, index) => {
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

  const handleNext = async () => {
    if (!selectedValues.length) {
      message.warning('Please select at least one user or email')
      return
    }

    try {
      const recipients = buildRecipients()

      await actions.updateDesignerMetadata(designer.id, {
        ...designer,
        recipients
      })

      onComplete?.(recipients)
    } catch {
      message.error('Failed to save recipients')
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
      <Card title="Select Users for Document" className="user-selection-card">
        <Space direction="vertical" className="user-selection-space" size="large">
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
              loading={loading}
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

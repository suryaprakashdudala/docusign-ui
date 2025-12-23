import React from 'react'
import { Tag } from 'antd'
import '../../styles/Designer.css'

const FieldBadge = ({ icon, label, required, userColor, userInitial }) => (
  <>
    {icon}
    <span className="field-badge-label">{label}</span>
    {required && (
      <Tag color="red" className="field-badge-required">
        Required
      </Tag>
    )}
    <Tag color={userColor} className="field-badge-user">
      {userInitial}
    </Tag>
  </>
)

export default FieldBadge
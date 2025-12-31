import { Select, Space, Button } from 'antd'
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  EditOutlined,
  CheckSquareOutlined,
  CheckCircleOutlined,
  BgColorsOutlined
} from '@ant-design/icons'
import { FIELD_TYPES, FIELD_LABELS } from '../../constants/constants';
import '../../styles/Designer.css'

const { Option } = Select


const FIELD_ICONS = {
  [FIELD_TYPES.TEXT]: <FileTextOutlined />,
  [FIELD_TYPES.TEXTAREA]: <EditOutlined />,
  [FIELD_TYPES.SIGNATURE]: <BgColorsOutlined />,
  [FIELD_TYPES.RADIO]: <CheckCircleOutlined />,
  [FIELD_TYPES.CHECKBOX]: <CheckSquareOutlined />
}

const SidebarLeft = ({
  selectedUser,
  onSelectUser,
  selectedUsers,
  onBack,
  onControlDragStart,
  isTemplate
}) => {
  return (
    <div className="sidebar-left-container">
      {!isTemplate && (
          <div className="sidebar-section-header">
            <label className="sidebar-label">
              Select User:
            </label>
            <Select
              className="full-width-select"
              value={selectedUser}
              onChange={onSelectUser}
              placeholder="Select user"
              size="large"
            >
              {selectedUsers?.map((user) => (
                <Option key={user.userId || user.id} value={user.userId || user.id}>
                  <Space align="center">
                    <span
                      className="user-color-indicator"
                      style={{
                        backgroundColor: user.color,
                      }}
                    />
                    <span>
                      {user.isExternal ? user.id : user.firstName + ' '+ user.lastName}
                    </span>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
      )}

      {isTemplate && (
           <div className="sidebar-section-header">
                <div style={{ padding: '12px', background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px', textAlign: 'center' }}>
                    <EditOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                    <div style={{ fontWeight: 600, marginTop: '4px' }}>Template Designer</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Generic fields for any signer</div>
                </div>
           </div>
      )}

      <div className="controls-section">
        <label className="controls-label">
          Controls:
        </label>
        <Space direction="vertical" className="full-width-space" size="middle">
          {Object.values(FIELD_TYPES).map((type) => (
            <Button
              key={type}
              type="default"
              block
              icon={FIELD_ICONS[type]}
              draggable
              onDragStart={(e) => onControlDragStart(e, type)}
              className="control-button"
              size="large"
              style={{ height: '50px', fontSize: '16px' }}
            >
              {FIELD_LABELS[type]}
            </Button>
          ))}
        </Space>
      </div>

      <div className="sidebar-footer">
        <Button
          type="primary"
          block
          onClick={onBack}
          icon={<ArrowLeftOutlined />}
          size="middle"
        >
          Back
        </Button>
      </div>
    </div>
  )
}

export default SidebarLeft
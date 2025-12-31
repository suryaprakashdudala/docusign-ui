import { Button } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import '../../styles/Designer.css'

const SidebarRight = ({
  numPages,
  totalFields,
  isSubmitting,
  onSubmit,
  isTemplate
}) => (
  <div className="sidebar-right-container">
    <div className="document-info-title">Document Info</div>
    <div className="document-info-details">
      <div>Total Pages: {numPages}</div>
      <div className="info-item">Fields: {totalFields}</div>
    </div>

    <div className="sidebar-right-footer">
      <Button
        type="primary"
        block
        size="large"
        loading={isSubmitting}
        onClick={onSubmit}
        icon={<SendOutlined />}
        className="save-config-button"
      >
        {isTemplate ? 'Save Template' : 'Save Configuration'}
      </Button>
    </div>
  </div>
)

export default SidebarRight
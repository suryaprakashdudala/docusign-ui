import { Button } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import '../../styles/Designer.css'

const SidebarRight = ({
  numPages,
  totalFields,
  isSubmitting,
  onSubmit,
  onSaveTemplate,
  onBack
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
        Save Configuration
      </Button>
      <Button
        block
        style={{ marginTop: '10px' }}
        loading={isSubmitting}
        onClick={onSaveTemplate}
        className="save-template-button"
      >
        Save as Template
      </Button>
      {/* <Button type="default" block onClick={onBack} icon={<ArrowLeftOutlined />}>
        Back
      </Button> */}
    </div>
  </div>
)

export default SidebarRight
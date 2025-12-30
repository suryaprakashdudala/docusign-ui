import { Card, Result } from 'antd';
import '../../styles/Documents.css';

const SubmissionSuccess = () => {

    return (
        <div className="completed-document-container">
            <Card className="completed-document-card">
                <Result
                    status="success"
                    title="Document Submitted Successfully!"
                    subTitle="Thank you for completing the document. Your submission has been recorded."
                    extra={[
                        <div key="info" style={{ marginBottom: '20px', color: '#666' }}>
                            You can now safely close this window.
                        </div>,
                    ]}
                />
            </Card>
        </div>
    );
};

export default SubmissionSuccess;

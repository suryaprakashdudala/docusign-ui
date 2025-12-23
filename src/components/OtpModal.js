import React, { useRef } from 'react';
import { Form, Button, Modal } from 'antd';
import '../styles/otp.css';

const OtpModal = ({ open, onCancel, onVerify }) => {
  const [form] = Form.useForm();
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    e.target.value = value;

    if (value && index < inputs.current.length - 1) {
      inputs.current[index + 1].focus();
    }

    if (!value && index > 0 && e.nativeEvent.inputType === 'deleteContentBackward') {
      inputs.current[index - 1].focus();
    }

    const otp = inputs.current.map((input) => input?.value || '').join('');
    form.setFieldsValue({ otp });
  };

  const handleSubmit = () => {
    const otp = inputs.current.map((input) => input?.value || '').join('');
    if (otp.length !== 6) {
      form.setFields([
        {
          name: 'otp',
          errors: ['OTP must be 6 digits!'],
        },
      ]);
      return;
    }
    onVerify(otp);
  };

  return (
    <div className="login-page">
      <Modal open={open} title="Verify OTP" footer={null} onCancel={onCancel} centered>
        <Form form={form} autoComplete="off" onFinish={handleSubmit}>
          <Form.Item
            label="OTP"
            name="otp"
            // rules={[
            //   { required: true, message: 'Please enter OTP!' },
            //   { pattern: /^[0-9]{6}$/, message: 'OTP must be 6 digits!' },
            // ]}
          >
            <div className="otp-input-container">
              {Array.from({ length: 6 }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  ref={(el) => (inputs.current[index] = el)}
                  onChange={(e) => handleChange(e, index)}
                  className="otp-input-box"
                />
              ))}
            </div>
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Verify
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default OtpModal;

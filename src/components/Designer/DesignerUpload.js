import React, { useState } from 'react'
import { bindActionCreators } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import { Card, Upload, Button, Progress, message, Typography } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { createDesigner, requestPresignedUrl, updateDesignerMetadata} from '../../actions/designer'
import '../../styles/registerUser.css'
import '../../styles/DesignerUpload.css'

const { Text } = Typography

const DesignerUpload = ({ actions, onComplete }) => {
  const [file, setFile] = useState(null)
  const [designer, setDesigner] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const uploadWithProgress = async (url, file, contentType, onProgress) => {
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', url, true)
      
      const finalContentType = contentType || file.type || 'application/pdf'
      xhr.setRequestHeader('Content-Type', finalContentType)
      

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && typeof onProgress === 'function') {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr)
        } else {
          let errorMsg = `Upload failed with status ${xhr.status}`
          try {
            const responseText = xhr.responseText || xhr.response
            if (responseText) {
              errorMsg += `: ${responseText.substring(0, 200)}`
            }
          } catch (e) {
            console.log(e);
            
          }
          console.error('S3 Upload Error Details:', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
            url: url.substring(0, 100) + '...'
          })
          reject(new Error(errorMsg))
        }
      }

      xhr.onerror = () => {
        console.error('S3 Upload Network Error:', {
          url: url.substring(0, 100) + '...'
        })
        reject(new Error('Network error during upload'))
      }
      
      xhr.ontimeout = () => {
        reject(new Error('Upload timeout'))
      }
      
      xhr.timeout = 300000
      
      xhr.send(file)
    })
  }

  const getPageCount = async (file) => {
    try {
      const buffer = await file.arrayBuffer()
      const pdfjs = await import('pdfjs-dist')
      if (!pdfjs.GlobalWorkerOptions.workerSrc || pdfjs.GlobalWorkerOptions.workerSrc.includes('cdnjs')) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
      }
      
      const pdf = await pdfjs.getDocument({ 
        data: buffer,
        useWorkerFetch: false,
        isEvalSupported: false
      }).promise
      
      const pageCount = pdf.numPages
      console.log(`PDF has ${pageCount} pages`)
      return pageCount
    } catch (err) {
      console.error('Could not read PDF page count', err)
      try {
        const pdfjs = await import('pdfjs-dist')
        pdfjs.GlobalWorkerOptions.workerSrc = false
        const buffer = await file.arrayBuffer()
        const pdf = await pdfjs.getDocument({ data: buffer }).promise
        return pdf.numPages
      } catch (fallbackErr) {
        console.error('PDF page count fallback also failed', fallbackErr)
        return 1
      }
    }
  }

  const handleUpload = async () => {
    if (!file) {
      message.warning('Please select a PDF first')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      let d = designer
      if (!d) {
        d = await actions.createDesigner(file.name || 'Untitled')
        setDesigner(d)
      }

      const contentType = file.type || 'application/pdf'
      const pres = await actions.requestPresignedUrl(
        d.id,
        file.name,
        contentType,
      )
      if (!pres || !pres.url) throw new Error('Invalid presigned URL response')

      await uploadWithProgress(pres.url, file, contentType, (p) => setProgress(p))

      const pages = await getPageCount(file)
      console.log('Page count result:', pages)

      const pageCount = pages && pages > 0 ? pages : 1
      const updatedDesigner = await actions.updateDesignerMetadata(
        d.id,
        { s3Key: pres.key, pages: pageCount },
      )
      if (onComplete) {
        onComplete({ ...updatedDesigner, s3Key: pres.key, pages: pageCount })
      }
    } catch (err) {
      console.error('Upload flow error', err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const uploadProps = {
    accept: 'application/pdf',
    beforeUpload: (f) => {
      setFile(f)
      return false
    },
    onRemove: () => {
      setFile(null)
      setProgress(0)
    },
    fileList: file ? [file] : [],
  }

  return (
    <div className="register-page">
      <Card title="Upload PDF & Create Designer" className="register-card">
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />}>Select PDF</Button>
        </Upload>

        {file && (
          <div className="designer-upload-file-info">
            <Text strong>File:</Text> <Text>{file.name}</Text>
          </div>
        )}

        {uploading && (
          <div className="designer-upload-progress">
            <Progress percent={progress} />
          </div>
        )}

        <div className="designer-upload-actions">
          <Button type="primary" onClick={handleUpload} disabled={!file || uploading}>
            Upload & Save
          </Button>
          <Button
            onClick={() => {
              setFile(null)
              setDesigner(null)
              setProgress(0)
            }}
            disabled={uploading}
          >
            Reset
          </Button>
        </div>
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
    },
    dispatch
  ),
})

export default connect(null, mapDispatchToProps)(DesignerUpload)

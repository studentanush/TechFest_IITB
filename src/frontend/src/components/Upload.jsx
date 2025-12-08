import React from 'react'

const Upload = () => {
  return (
    <section className="section section-4" id="section4">
      <div className="container">
        <div className="section-grid">
          <div className="section-content fade-in">
            <div className="section-badge">
              <i className="fas fa-file-upload"></i>
              <span>Upload & See Magic</span>
            </div>
            <h2 className="section-title">
              Upload <span className="text-highlight">Documents</span>
            </h2>
            <p className="section-description">
              Simply upload your documents and watch as our AI transforms them into 
              interactive quizzes. Supports multiple formats including PDF, DOC, images, and text.
            </p>
            <div className="upload-features">
              <div className="upload-feature">
                <div className="feature-icon-small">
                  <i className="fas fa-bolt"></i>
                </div>
                <div className="feature-content">
                  <h4>Instant Processing</h4>
                  <p>Convert documents in under 30 seconds</p>
                </div>
              </div>
              <div className="upload-feature">
                <div className="feature-icon-small">
                  <i className="fas fa-image"></i>
                </div>
                <div className="feature-content">
                  <h4>Image Recognition</h4>
                  <p>Extract text from images with OCR technology</p>
                </div>
              </div>
              <div className="upload-feature">
                <div className="feature-icon-small">
                  <i className="fas fa-sync-alt"></i>
                </div>
                <div className="feature-content">
                  <h4>Auto-Refresh</h4>
                  <p>Real-time updates as you edit documents</p>
                </div>
              </div>
            </div>
          </div>
          <div className="section-visual fade-in" data-delay="200">
            <div className="upload-demo-large">
              <div className="upload-area">
                <div className="upload-icon-large">
                  <i className="fas fa-cloud-upload-alt"></i>
                  <div className="upload-pulse"></div>
                </div>
                <h3>Drop Files Here</h3>
                <p>or click to browse files</p>
                <div className="file-types-large">
                  <div className="file-type">
                    <i className="fas fa-file-pdf"></i>
                    <span>PDF</span>
                  </div>
                  <div className="file-type">
                    <i className="fas fa-file-word"></i>
                    <span>DOC</span>
                  </div>
                  <div className="file-type">
                    <i className="fas fa-file-image"></i>
                    <span>Images</span>
                  </div>
                  <div className="file-type">
                    <i className="fas fa-file-alt"></i>
                    <span>Text</span>
                  </div>
                </div>
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill"></div>
                  </div>
                  <div className="progress-text">Processing... 75%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Upload

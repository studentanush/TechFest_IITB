import React from 'react'

const Generate = () => {
  return (
    <section className="section section-2" id="section2">
      <div className="container">
        <div className="section-grid reverse">
          <div className="section-visual fade-in">
            <div className="chat-preview-large">
              <div className="chat-header">
                <div className="chat-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="chat-info">
                  <h4>AI Assistant</h4>
                  <span className="status active"><i className="fas fa-circle"></i> Online</span>
                </div>
                <div className="chat-actions">
                  <button className="btn-icon"><i className="fas fa-ellipsis-h"></i></button>
                </div>
              </div>
              <div className="chat-body">
                <div className="message incoming">
                  <div className="message-content">
                    <p>Hello! I can help you create quizzes from your uploaded documents. What would you like to create?</p>
                  </div>
                </div>
                <div className="message outgoing">
                  <div className="message-content">
                    <p>Create a 10-question quiz about JavaScript fundamentals</p>
                  </div>
                </div>
                <div className="message incoming typing">
                  <div className="message-content">
                    <p>Great! I'll generate a quiz on JavaScript fundamentals with questions covering variables, functions, and loops.</p>
                  </div>
                </div>
                <div className="input-container">
                  <input type="text" placeholder="Type your message..." />
                  <button className="btn-send">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="section-content fade-in" data-delay="200">
            <div className="section-badge">
              <i className="fas fa-wand-magic-sparkles"></i>
              <span>Here We Generate & Curate</span>
            </div>
            <h2 className="section-title">
              Intelligent <span className="text-highlight">Generation</span>
            </h2>
            <p className="section-description">
              Our AI engine analyzes your content and generates customized quizzes. 
              Curate questions with intelligent suggestions and context-aware modifications.
            </p>
            <ul className="benefits-list">
              <li><i className="fas fa-check-circle"></i> Natural language understanding</li>
              <li><i className="fas fa-check-circle"></i> Context-aware suggestions</li>
              <li><i className="fas fa-check-circle"></i> Multiple question types</li>
              <li><i className="fas fa-check-circle"></i> Smart difficulty adjustment</li>
            </ul>
            <button className="btn btn-primary btn-animated">
              <i className="fas fa-play"></i>
              <span>Try AI Assistant</span>
              <div className="btn-wave"></div>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Generate

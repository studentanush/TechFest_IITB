import React, { useState, useRef } from 'react';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm your Quiz Assistant. I can help you create quizzes from documents or through conversation. Upload a file or ask me anything!" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agenticMode, setAgenticMode] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (!inputText.trim() && uploadedFiles.length === 0) return;

    // Add user message
    const userMessage = { role: 'user', content: inputText };
    if (uploadedFiles.length > 0) {
      userMessage.files = [...uploadedFiles];
    }
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I've analyzed your document! Here's a quiz I generated based on the content:",
        "Great question! Here are 5 multiple-choice questions on that topic:",
        "Based on our conversation, I've created this quiz for you:"
      ];
      
      const quizContent = {
        title: "Sample Quiz",
        questions: [
          {
            id: 1,
            question: "What is the capital of France?",
            options: ["London", "Berlin", "Paris", "Madrid"],
            correctAnswer: 2,
            type: "mcq"
          },
          {
            id: 2,
            question: "Explain Newton's First Law of Motion",
            options: [],
            type: "voice",
            voiceEnabled: true
          }
        ]
      };

      const aiResponse = {
        role: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        quiz: quizContent
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      setUploadedFiles([]);
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileList = files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    setUploadedFiles(prev => [...prev, ...fileList]);
  };

  const handleSaveQuiz = () => {
    alert('Quiz saved! Redirecting to Generated Quizzes...');
    // In real app, this would redirect to /generated
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Create New Quiz</h1>
        <p>Upload documents or chat with AI to generate quizzes</p>
      </div>

      <div className="chat-main">
        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'ai' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                <p>{msg.content}</p>
                
                {/* Display uploaded files */}
                {msg.files && (
                  <div className="uploaded-files">
                    {msg.files.map((file, i) => (
                      <div key={i} className="file-item">
                        <i className="fas fa-file"></i>
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Display generated quiz */}
                {msg.quiz && (
                  <div className="quiz-preview">
                    <h4>Generated Quiz: {msg.quiz.title}</h4>
                    <div className="quiz-questions">
                      {msg.quiz.questions.map((q, qIndex) => (
                        <div key={q.id} className="question-item">
                          <p><strong>Q{q.id}:</strong> {q.question}</p>
                          {q.type === 'mcq' && (
                            <div className="options">
                              {q.options.map((opt, optIndex) => (
                                <div key={optIndex} className="option">
                                  {String.fromCharCode(65 + optIndex)}. {opt}
                                </div>
                              ))}
                            </div>
                          )}
                          {q.type === 'voice' && (
                            <div className="voice-question">
                              <i className="fas fa-microphone"></i>
                              Voice-enabled question
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <button className="save-quiz-btn" onClick={handleSaveQuiz}>
                      <i className="fas fa-save"></i>
                      Save Quiz to Generated Quizzes
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="chat-input-area">
          {/* File Upload Area */}
          {uploadedFiles.length > 0 && (
            <div className="file-preview">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="file-preview-item">
                  <i className="fas fa-file"></i>
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="input-wrapper">
            {/* File Upload Button */}
            <button 
              className="file-upload-btn"
              onClick={() => fileInputRef.current.click()}
            >
              <i className="fas fa-paperclip"></i>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
              style={{ display: 'none' }}
            />

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message or upload documents..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />

            {/* Send Button */}
            <button 
              className="send-btn"
              onClick={handleSend}
              disabled={(!inputText.trim() && uploadedFiles.length === 0) || isLoading}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>

          {/* Agentic Mode Toggle */}
          <div className="agentic-mode-toggle">
            <label>
              <input
                type="checkbox"
                checked={agenticMode}
                onChange={(e) => setAgenticMode(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">
                <i className="fas fa-robot"></i>
                Agentic Mode
              </span>
            </label>
            <span className="mode-hint">
              (AI will ask clarifying questions before generating)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

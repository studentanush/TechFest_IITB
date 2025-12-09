import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, FileText, Loader2, Download, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

function Chat() {
  const [messages, setMessages] = useState([
    {
      type: 'assistant',
      content: 'Hello! I\'m your Quiz Generator Assistant. Upload a document (PDF, DOCX, or TXT) and I\'ll help you create custom quizzes. Just tell me what you need!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [conversationContext, setConversationContext] = useState({
    hasFile: false,
    lastQuizParams: null
  });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addAssistantMessage = (content) => {
    setMessages(prev => [...prev, {
      type: 'assistant',
      content: content,
      timestamp: new Date()
    }]);
  };

  const callLLM = async (userPrompt, context) => {
    const prompt = userPrompt.toLowerCase();
    
    if (prompt.match(/^(hi|hello|hey|greetings)/)) {
      return "Hello! How can I help you today? If you'd like to generate a quiz, please upload a document first.";
    }
    
    if (prompt.includes('help') || prompt.includes('how')) {
      return "I can help you generate quizzes from your documents! Here's how:\n1. Upload a PDF, DOCX, or TXT file\n2. Tell me how many questions you want (minimum 5)\n3. I'll generate a comprehensive quiz for you\n\nYou can also ask me to regenerate questions or modify the quiz.";
    }
    
    if (!context.hasFile && prompt.match(/\d+\s*(questions?|quiz)/)) {
      return "I'd love to generate questions for you, but I don't see any document uploaded yet. Please upload a PDF, DOCX, or TXT file first.";
    }
    
    if (prompt.includes('regenerate') || prompt.includes('try again') || prompt.includes('redo')) {
      if (context.lastQuizParams) {
        return `regenerate:${context.lastQuizParams.numQuestions}`;
      } else {
        return "I don't have any previous quiz to regenerate. Please tell me how many questions you'd like to generate.";
      }
    }
    
    if (prompt.includes('more questions') || prompt.includes('add more')) {
      return "Sure! How many additional questions would you like me to generate?";
    }
    
    if (prompt.includes('easier') || prompt.includes('harder') || prompt.includes('difficulty')) {
      return "I understand you'd like questions with different difficulty. Please specify how many questions you need, and I'll generate a new quiz.";
    }
    
    const numberMatch = prompt.match(/(\d+)\s*(questions?|quiz)?/);
    if (numberMatch && context.hasFile) {
      const num = parseInt(numberMatch[1]);
      if (num < 5) {
        return "I need to generate at least 5 questions. Please request 5 or more questions.";
      }
      return `generate:${num}`;
    }
    
    if (context.hasFile) {
      return "I have your document ready. How many questions would you like me to generate? (Minimum 5 questions)";
    } else {
      return "Please upload a document first, then tell me how many questions you'd like to generate.";
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (validTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        setConversationContext(prev => ({ ...prev, hasFile: true }));
        setMessages(prev => [...prev, {
          type: 'user',
          content: `📎 Uploaded: ${selectedFile.name}`,
          timestamp: new Date()
        }]);
        
        setTimeout(() => {
          addAssistantMessage(`Great! I've received "${selectedFile.name}". How many questions would you like me to generate from this document?`);
        }, 500);
      } else {
        setMessages(prev => [...prev, {
          type: 'error',
          content: 'Please upload a PDF, DOCX, or TXT file.',
          timestamp: new Date()
        }]);
      }
    }
  };

  const generateQuiz = async (numQuestions) => {
    if (!file) {
      addAssistantMessage("Oops! It seems the file is missing. Please upload a document again.");
      return;
    }

    setIsLoading(true);
    addAssistantMessage(`Generating ${numQuestions} questions from your document. This may take a moment...`);

    // Simulated quiz generation for demo
    setTimeout(() => {
      const mockQuiz = {
        quiz_name: `Quiz from ${file.name}`,
        questions: Array.from({ length: numQuestions }, (_, i) => ({
          question: `Sample question ${i + 1} generated from your document?`,
          type: 'mcq',
          options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
          correct_option_letter: 'A',
          explanation: 'This is a sample explanation for the correct answer.',
          difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
          sub_topics: ['Topic 1', 'Topic 2']
        }))
      };

      setGeneratedQuiz(mockQuiz);
      setConversationContext(prev => ({
        ...prev,
        lastQuizParams: { numQuestions, fileName: file.name }
      }));
      
      setMessages(prev => [...prev, {
        type: 'success',
        content: `✅ Successfully generated "${mockQuiz.quiz_name}" with ${mockQuiz.questions.length} questions! You can download it below or ask me to regenerate if you'd like different questions.`,
        timestamp: new Date()
      }]);
      setIsLoading(false);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);
    setInput('');
    setIsLoading(true);

    try {
      const llmResponse = await callLLM(userMessage, conversationContext);
      
      if (llmResponse.startsWith('generate:')) {
        const numQuestions = parseInt(llmResponse.split(':')[1]);
        setIsLoading(false);
        await generateQuiz(numQuestions);
      } else if (llmResponse.startsWith('regenerate:')) {
        const numQuestions = parseInt(llmResponse.split(':')[1]);
        setIsLoading(false);
        addAssistantMessage("Sure! Let me regenerate the quiz with different questions.");
        await generateQuiz(numQuestions);
      } else {
        setTimeout(() => {
          addAssistantMessage(llmResponse);
          setIsLoading(false);
        }, 500);
      }
    } catch (error) {
      addAssistantMessage(`Sorry, I encountered an error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleRegenerate = () => {
    if (conversationContext.lastQuizParams) {
      setInput(`Regenerate ${conversationContext.lastQuizParams.numQuestions} questions`);
    }
  };

  const downloadQuiz = () => {
    if (!generatedQuiz) return;
    
    const dataStr = JSON.stringify(generatedQuiz, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedQuiz.quiz_name.replace(/\s+/g, '_')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderMessage = (msg, index) => {
    switch (msg.type) {
      case 'user':
        return (
          <div key={index} style={styles.userMessageWrapper}>
            <div style={styles.messageAvatar}>👤</div>
            <div style={styles.userMessage}>
              <p style={styles.messageText}>{msg.content}</p>
              <span style={styles.timestamp}>
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      
      case 'assistant':
        return (
          <div key={index} style={styles.assistantMessageWrapper}>
            <div style={styles.messageAvatarAI}>🤖</div>
            <div style={styles.assistantMessage}>
              <p style={styles.messageText}>{msg.content}</p>
              <span style={styles.timestamp}>
                {msg.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        );
      
      case 'success':
        return (
          <div key={index} style={styles.assistantMessageWrapper}>
            <div style={styles.messageAvatarAI}>🤖</div>
            <div style={styles.successMessage}>
              <div style={styles.messageWithIcon}>
                <CheckCircle style={styles.iconSuccess} />
                <div>
                  <p style={styles.messageText}>{msg.content}</p>
                  <span style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div key={index} style={styles.assistantMessageWrapper}>
            <div style={styles.messageAvatarAI}>🤖</div>
            <div style={styles.errorMessage}>
              <div style={styles.messageWithIcon}>
                <XCircle style={styles.iconError} />
                <div>
                  <p style={styles.messageText}>{msg.content}</p>
                  <span style={styles.timestamp}>
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderQuizPreview = () => {
    if (!generatedQuiz) return null;

    return (
      <div style={styles.quizPreview}>
        <div style={styles.quizHeader}>
          <h2 style={styles.quizTitle}>{generatedQuiz.quiz_name}</h2>
          <div style={styles.quizActions}>
            <button onClick={handleRegenerate} style={styles.regenerateButton}>
              <RefreshCw style={styles.buttonIcon} />
              Regenerate
            </button>
            <button onClick={downloadQuiz} style={styles.downloadButton}>
              <Download style={styles.buttonIcon} />
              Download JSON
            </button>
          </div>
        </div>
        
        <p style={styles.totalQuestions}>
          Total Questions: {generatedQuiz.questions.length}
        </p>

        <div style={styles.questionsContainer}>
          {generatedQuiz.questions.map((q, idx) => (
            <div key={idx} style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <h3 style={styles.questionTitle}>
                  {idx + 1}. {q.question}
                </h3>
                <span style={styles.questionType}>
                  {q.type.toUpperCase()}
                </span>
              </div>
              
              <div style={styles.optionsContainer}>
                {q.options.map((opt, optIdx) => (
                  <div
                    key={optIdx}
                    style={opt.startsWith(q.correct_option_letter) ? styles.correctOption : styles.option}
                  >
                    <span style={styles.optionText}>{opt}</span>
                  </div>
                ))}
              </div>

              <div style={styles.questionFooter}>
                <p style={styles.explanation}>
                  <strong>Explanation:</strong> {q.explanation}
                </p>
                <div style={styles.metadata}>
                  <span>Difficulty: {q.difficulty}</span>
                  <span>Topics: {q.sub_topics.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.headerTitle}>Quiz Generator AI</h1>
            <p style={styles.headerSubtitle}>
              Interactive assistant for creating custom quizzes
            </p>
          </div>

          <div style={styles.chatArea}>
            {messages.map((msg, idx) => renderMessage(msg, idx))}
            {isLoading && (
              <div style={styles.assistantMessageWrapper}>
                <div style={styles.messageAvatarAI}>🤖</div>
                <div style={styles.loadingMessage}>
                  <div style={styles.messageWithIcon}>
                    <Loader2 style={styles.iconLoading} />
                    <span style={styles.messageText}>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <div style={styles.filePreview}>
              {file && (
                <div style={styles.filePreviewItem}>
                  <FileText style={styles.fileIcon} />
                  <span>{file.name}</span>
                </div>
              )}
            </div>

            <div style={styles.inputContainer}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.docx,.txt"
                style={styles.fileInput}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={styles.uploadButton}
              >
                <Upload style={styles.buttonIcon} />
                Upload
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (e.g., 'Generate 10 questions')"
                style={styles.messageInput}
                disabled={isLoading}
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !input.trim()}
                style={isLoading || !input.trim() ? styles.sendButtonDisabled : styles.sendButton}
              >
                <Send style={styles.buttonIcon} />
              </button>
            </div>
          </div>
        </div>
        {renderQuizPreview()}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0a001a, #1a0033)',
    padding: '40px 20px'
  },
  mainCard: {
    maxWidth: '1280px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  header: {
    background: 'rgba(138, 43, 226, 0.2)',
    borderBottom: '1px solid rgba(138, 43, 226, 0.3)',
    color: '#ffffff',
    padding: '30px',
    textAlign: 'center'
  },
  headerTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
    margin: 0,
    color: '#fff'
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    fontSize: '16px'
  },
  chatArea: {
    height: '500px',
    overflowY: 'auto',
    padding: '30px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  userMessageWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
    gap: '15px',
    animation: 'fadeIn 0.3s ease-out'
  },
  assistantMessageWrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginBottom: '20px',
    gap: '15px',
    animation: 'fadeIn 0.3s ease-out'
  },
  messageAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(247, 37, 133, 0.3)',
    border: '2px solid rgba(247, 37, 133, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0
  },
  messageAvatarAI: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(138, 43, 226, 0.3)',
    border: '2px solid rgba(138, 43, 226, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0
  },
  userMessage: {
    maxWidth: '600px',
    borderRadius: '15px',
    padding: '16px 20px',
    backgroundColor: 'rgba(138, 43, 226, 0.3)',
    border: '1px solid rgba(138, 43, 226, 0.4)',
    color: '#ffffff'
  },
  assistantMessage: {
    maxWidth: '600px',
    borderRadius: '15px',
    padding: '16px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.9)'
  },
  successMessage: {
    maxWidth: '600px',
    borderRadius: '15px',
    padding: '16px 20px',
    backgroundColor: 'rgba(76, 201, 240, 0.15)',
    border: '1px solid rgba(76, 201, 240, 0.3)',
    color: '#4cc9f0'
  },
  errorMessage: {
    maxWidth: '600px',
    borderRadius: '15px',
    padding: '16px 20px',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#ff6b6b'
  },
  loadingMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '15px',
    padding: '16px 20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  messageWithIcon: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  iconSuccess: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
    flexShrink: 0,
    color: '#4cc9f0'
  },
  iconError: {
    width: '20px',
    height: '20px',
    marginTop: '2px',
    flexShrink: 0,
    color: '#ff6b6b'
  },
  iconLoading: {
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
    color: '#8a2be2'
  },
  messageText: {
    fontSize: '15px',
    margin: 0,
    lineHeight: '1.6',
    whiteSpace: 'pre-line'
  },
  timestamp: {
    fontSize: '11px',
    opacity: 0.6,
    marginTop: '8px',
    display: 'block'
  },
  inputArea: {
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '20px 30px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)'
  },
  filePreview: {
    marginBottom: '12px'
  },
  filePreviewItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 15px',
    background: 'rgba(138, 43, 226, 0.2)',
    border: '1px solid rgba(138, 43, 226, 0.3)',
    borderRadius: '10px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px'
  },
  fileIcon: {
    width: '18px',
    height: '18px',
    color: '#8a2be2'
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  fileInput: {
    display: 'none'
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    backgroundColor: 'rgba(76, 201, 240, 0.2)',
    border: '1px solid rgba(76, 201, 240, 0.3)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: '#4cc9f0',
    fontSize: '14px',
    fontWeight: '500'
  },
  messageInput: {
    flex: 1,
    padding: '12px 20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    transition: 'all 0.3s ease'
  },
  sendButton: {
    padding: '12px 20px',
    backgroundColor: 'rgba(138, 43, 226, 0.4)',
    color: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(138, 43, 226, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sendButtonDisabled: {
    padding: '12px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.4)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'not-allowed',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  buttonIcon: {
    width: '18px',
    height: '18px'
  },
  quizPreview: {
    marginTop: '24px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
  },
  quizHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  quizTitle: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0
  },
  quizActions: {
    display: 'flex',
    gap: '10px'
  },
  regenerateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500'
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'rgba(138, 43, 226, 0.4)',
    color: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(138, 43, 226, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500'
  },
  totalQuestions: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '24px',
    fontSize: '15px'
  },
  questionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: '500px',
    overflowY: 'auto',
    paddingRight: '10px'
  },
  questionCard: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)'
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '15px'
  },
  questionTitle: {
    fontWeight: '600',
    color: '#fff',
    margin: 0,
    fontSize: '16px',
    lineHeight: '1.5'
  },
  questionType: {
    fontSize: '11px',
    backgroundColor: 'rgba(76, 201, 240, 0.2)',
    color: '#4cc9f0',
    padding: '4px 10px',
    borderRadius: '6px',
    fontWeight: '600',
    flexShrink: 0
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    margin: '15px 0'
  },
  option: {
    padding: '12px 15px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.2s ease'
  },
  correctOption: {
    padding: '12px 15px',
    borderRadius: '8px',
    backgroundColor: 'rgba(76, 201, 240, 0.15)',
    border: '1px solid rgba(76, 201, 240, 0.3)',
    color: '#4cc9f0'
  },
  optionText: {
    fontSize: '14px'
  },
  questionFooter: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  explanation: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '10px',
    lineHeight: '1.6'
  },
  metadata: {
    display: 'flex',
    gap: '15px',
    marginTop: '10px',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.6)'
  }
};

export default Chat;
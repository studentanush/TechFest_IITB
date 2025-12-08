import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AttendQuiz.css';

const AttendQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  // State variables
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [questions, setQuestions] = useState([]);
  const [questionStatus, setQuestionStatus] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Dynamic grid class based on question count
  const getGridClass = (count) => {
    if (count <= 15) return '';
    if (count <= 30) return 'large-set';
    return 'xlarge-set';
  };

  const getLegendClass = (count) => {
    return count > 20 ? 'many-questions' : '';
  };

  // ==================== BACKEND INTEGRATION FUNCTIONS ====================

  // Fetch quiz from backend (Ready for API integration)
  const fetchQuizFromBackend = async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      
      // REAL API CALL - UNCOMMENT WHEN READY:
      // const response = await fetch(`/api/quizzes/${quizId}`);
      // if (!response.ok) throw new Error('Failed to fetch quiz');
      // const data = await response.json();
      // return data;
      
      // MOCK DATA FOR DEVELOPMENT:
      return mockFetchQuiz(quizId);
      
    } catch (err) {
      console.error('Error fetching quiz:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit answers to backend (Ready for API integration)
  const submitAnswersToBackend = async (quizId, answers) => {
    try {
      setSubmitting(true);
      
      // REAL API CALL - UNCOMMENT WHEN READY:
      // const response = await fetch(`/api/quizzes/${quizId}/submit`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     studentId: localStorage.getItem('studentId'),
      //     answers: answers,
      //     timeSpent: 1800 - timeLeft,
      //     submittedAt: new Date().toISOString()
      //   })
      // });
      // 
      // if (!response.ok) throw new Error('Submission failed');
      // const result = await response.json();
      // return result;
      
      // MOCK SUBMISSION FOR DEVELOPMENT:
      return mockSubmitQuiz(quizId, answers);
      
    } catch (err) {
      console.error('Error submitting quiz:', err);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Save answer to backend (Auto-save functionality)
  const saveAnswerToBackend = async (questionId, answer) => {
    try {
      // REAL API CALL - UNCOMMENT WHEN READY:
      // await fetch(`/api/quizzes/${quizId}/answers/${questionId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     answer: answer,
      //     timestamp: new Date().toISOString()
      //   })
      // });
      
      console.log('Auto-saved answer:', { questionId, answer });
    } catch (err) {
      console.error('Error auto-saving answer:', err);
    }
  };

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await fetchQuizFromBackend(quizId);
        setQuizData(data);
        setQuestions(data.questions);
        setTimeLeft(data.duration * 60); // Convert minutes to seconds
        
        // Initialize question status
        const initialStatus = {};
        data.questions.forEach((question) => {
          initialStatus[question.id] = {
            answered: false,
            skipped: false,
            marked: false,
            selectedOption: null,
            voiceAnswer: null,
            // Load previously saved answers if any
            ...(question.savedAnswer && {
              answered: true,
              selectedOption: question.savedAnswer,
            }),
          };
        });
        setQuestionStatus(initialStatus);
      } catch (err) {
        console.error('Failed to load quiz:', err);
      }
    };

    loadQuiz();
  }, [quizId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || !quizData) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizData]);

  // ==================== UTILITY FUNCTIONS ====================

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (qId) => {
    const status = questionStatus[qId];
    if (!status) return 'not-answered';
    
    if (status.answered) return 'answered';
    if (status.skipped) return 'skipped';
    if (status.marked) return 'marked';
    return 'not-answered';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'answered': return '#00ff88';
      case 'skipped': return '#ff6b6b';
      case 'marked': return '#8a2be2';
      default: return 'rgba(255, 255, 255, 0.15)';
    }
  };

  // ==================== QUESTION HANDLERS ====================

  const handleOptionSelect = async (optionId) => {
    const questionId = questions[currentQuestion].id;
    setSelectedOption(optionId);
    
    const newStatus = {
      ...questionStatus[questionId],
      answered: true,
      skipped: false,
      selectedOption: optionId,
    };
    
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: newStatus
    }));

    // Auto-save to backend
    await saveAnswerToBackend(questionId, optionId);
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestion(index);
      // Reset selection state for new question
      const currentQId = questions[currentQuestion].id;
      setSelectedOption(questionStatus[currentQId]?.selectedOption || null);
    }
  };

  const handleSaveNext = async () => {
    const questionId = questions[currentQuestion].id;
    
    // If MCQ with no selection, mark as skipped
    if (questions[currentQuestion].type === 'mcq' && !selectedOption) {
      const newStatus = {
        ...questionStatus[questionId],
        skipped: true,
        answered: false,
      };
      
      setQuestionStatus(prev => ({
        ...prev,
        [questionId]: newStatus
      }));
    }
    
    // Move to next question or submit if last
    if (currentQuestion < questions.length - 1) {
      goToQuestion(currentQuestion + 1);
    } else {
      await handleSubmitQuiz();
    }
  };

  const handleSkip = async () => {
    const questionId = questions[currentQuestion].id;
    
    const newStatus = {
      ...questionStatus[questionId],
      skipped: true,
      answered: false,
      selectedOption: null,
    };
    
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: newStatus
    }));

    // Auto-save skip to backend
    await saveAnswerToBackend(questionId, null);
    
    if (currentQuestion < questions.length - 1) {
      goToQuestion(currentQuestion + 1);
    }
  };

  const handleMarkReview = () => {
    const questionId = questions[currentQuestion].id;
    
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        marked: !prev[questionId].marked,
      }
    }));
  };

  const handleClearResponse = async () => {
    const questionId = questions[currentQuestion].id;
    
    setSelectedOption(null);
    setTranscript('');
    
    const newStatus = {
      ...questionStatus[questionId],
      answered: false,
      skipped: false,
      selectedOption: null,
      voiceAnswer: null,
    };
    
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: newStatus
    }));

    // Clear answer in backend
    await saveAnswerToBackend(questionId, null);
  };

  // ==================== VOICE HANDLERS ====================

  const handleStartRecording = () => {
    setIsRecording(true);
    // In real app: Initialize Web Speech API or external service
    setTimeout(() => {
      setTranscript("This is a mock transcript. In real app, this would be actual speech-to-text.");
    }, 2000);
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    const questionId = questions[currentQuestion].id;
    
    const newStatus = {
      ...questionStatus[questionId],
      answered: true,
      voiceAnswer: transcript,
    };
    
    setQuestionStatus(prev => ({
      ...prev,
      [questionId]: newStatus
    }));

    // Save voice answer to backend
    await saveAnswerToBackend(questionId, transcript);
  };

  // ==================== SUBMISSION HANDLERS ====================

  const handleAutoSubmit = async () => {
    alert('Time\'s up! Auto-submitting your quiz...');
    await handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    // Confirm submission
    const confirmed = window.confirm(
      `Submit quiz now?\n\nAnswered: ${Object.values(questionStatus).filter(q => q.answered).length}\n` +
      `Skipped: ${Object.values(questionStatus).filter(q => q.skipped).length}\n` +
      `Marked for review: ${Object.values(questionStatus).filter(q => q.marked).length}\n\n` +
      `You have ${formatTime(timeLeft)} remaining.`
    );
    
    if (!confirmed) return;

    try {
      // Prepare answers for backend
      const answers = Object.entries(questionStatus).map(([questionId, status]) => ({
        questionId,
        answer: status.selectedOption || status.voiceAnswer,
        status: status.answered ? 'answered' : 'skipped',
        marked: status.marked,
        timestamp: new Date().toISOString(),
      }));

      // Submit to backend
      const result = await submitAnswersToBackend(quizId, answers);
      
      // Redirect to report page
      navigate(`/student-report/${quizId}`, {
        state: {
          submissionId: result.submissionId,
          score: result.score,
          total: result.total,
        }
      });
      
    } catch (err) {
      alert(`Submission failed: ${err.message}\nPlease try again.`);
    }
  };

  // ==================== MOCK DATA FUNCTIONS ====================

  const mockFetchQuiz = (quizId) => {
    // Generate 25 questions for testing
    const questions = Array.from({ length: 25 }, (_, i) => ({
      id: `q${i + 1}`,
      text: `Question ${i + 1}: A car accelerates uniformly from 0 to ${72 + i} km/h in 10 seconds. What is the acceleration?`,
      options: [
        { id: 'a', text: `${2 + i * 0.5} m/s²` },
        { id: 'b', text: `${5 + i * 0.5} m/s²` },
        { id: 'c', text: `${7.2 + i * 0.5} m/s²` },
        { id: 'd', text: `${10 + i * 0.5} m/s²` }
      ],
      type: i % 5 === 0 ? 'voice' : 'mcq', // Every 5th question is voice
      correctAnswer: 'a',
      marks: 1,
      difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard',
      category: ['Motion', 'Forces', 'Energy'][i % 3],
    }));

    return {
      id: quizId,
      title: 'Physics - Motion and Forces Quiz',
      teacher: 'Dr. Johnson',
      totalQuestions: 25,
      duration: 45, // minutes
      instructions: [
        'Answer all questions',
        'You can skip and return to questions',
        'Voice questions require recording',
        'Timer will auto-submit when time ends'
      ],
      questions: questions,
      createdAt: '2024-01-15T10:30:00Z',
      expiresAt: '2024-12-31T23:59:59Z',
    };
  };

  const mockSubmitQuiz = (quizId, answers) => {
    console.log('Mock submission:', { quizId, answers });
    
    // Simulate API delay
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          submissionId: `sub_${Date.now()}`,
          quizId: quizId,
          score: Math.floor(Math.random() * 25),
          total: 25,
          submittedAt: new Date().toISOString(),
          timeSpent: 1800 - timeLeft,
          message: 'Quiz submitted successfully!',
        });
      }, 1500);
    });
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="attend-quiz-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Quiz...</h2>
          <p>Preparing your test environment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="attend-quiz-error">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2>Error Loading Quiz</h2>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            <i className="fas fa-redo"></i> Retry
          </button>
          <button 
            className="dashboard-btn"
            onClick={() => navigate('/student/dashboard')}
          >
            <i className="fas fa-home"></i> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!quizData || questions.length === 0) {
    return null;
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="attend-quiz-container">
      {/* Header */}
      <header className="quiz-header">
        <div className="quiz-logo" onClick={() => navigate('/student/dashboard')}>
          <div className="logo-icon">🎓</div>
          <div className="logo-text">
            <div className="primary">QUIZZCO.AI</div>
            <div className="secondary">Attending Quiz</div>
          </div>
        </div>
        
        <div className="quiz-title-section">
          <h1 className="quiz-title">{quizData.title}</h1>
          <div className="quiz-meta">
            <span className="meta-item"><i className="fas fa-user"></i> {quizData.teacher}</span>
            <span className="meta-item"><i className="fas fa-question-circle"></i> {quizData.totalQuestions} Questions</span>
            <span className="meta-item"><i className="fas fa-clock"></i> {quizData.duration} min</span>
          </div>
        </div>
        
        <div className="timer-container">
          <div className="timer-display">
            <div className="timer-label">Time Left</div>
            <div className="timer-value">{formatTime(timeLeft)}</div>
          </div>
          {submitting && (
            <div className="submitting-indicator">
              <div className="submitting-spinner"></div>
              <span>Submitting...</span>
            </div>
          )}
        </div>
      </header>

      <div className="quiz-main-content">
        {/* Question Section */}
        <div className="question-section">
          <div className="question-header">
            <div className="question-number">
              <span className="current">Question {currentQuestion + 1}</span>
              <span className="total"> of {questions.length}</span>
            </div>
            
            <div className="question-meta">
              {currentQ.type === 'voice' ? (
                <span className="type-badge voice">
                  <i className="fas fa-microphone"></i> Voice Response
                </span>
              ) : (
                <span className="type-badge mcq">
                  <i className="fas fa-list-ol"></i> Multiple Choice
                </span>
              )}
              <span className="difficulty-badge">
                {currentQ.difficulty}
              </span>
              <span className="marks-badge">
                {currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="question-content">
            <h2 className="question-text">{currentQ.text}</h2>
            
            {/* MCQ Options */}
            {currentQ.type === 'mcq' && currentQ.options.length > 0 && (
              <div className="options-grid">
                {currentQ.options.map((option) => (
                  <div 
                    key={option.id}
                    className={`option-item ${
                      selectedOption === option.id ? 'selected' : ''
                    }`}
                    onClick={() => handleOptionSelect(option.id)}
                  >
                    <div className="option-letter">{option.id.toUpperCase()}</div>
                    <div className="option-text">{option.text}</div>
                    {selectedOption === option.id && (
                      <div className="option-check">
                        <i className="fas fa-check"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Voice Interface */}
            {currentQ.type === 'voice' && (
              <div className="voice-section">
                <div className="voice-instructions">
                  <p><i className="fas fa-info-circle"></i> Click the record button and speak your answer clearly.</p>
                </div>
                
                <div className="voice-controls">
                  {!isRecording ? (
                    <button 
                      className="voice-btn record-btn"
                      onClick={handleStartRecording}
                      disabled={submitting}
                    >
                      <i className="fas fa-microphone"></i> Start Recording
                    </button>
                  ) : (
                    <button 
                      className="voice-btn stop-btn"
                      onClick={handleStopRecording}
                    >
                      <i className="fas fa-stop"></i> Stop Recording
                    </button>
                  )}
                  
                  {isRecording && (
                    <div className="recording-status">
                      <div className="pulse-dot"></div>
                      <span>Recording... Speak now</span>
                    </div>
                  )}
                </div>
                
                {transcript && (
                  <div className="transcript-box">
                    <h4><i className="fas fa-scroll"></i> Your Answer:</h4>
                    <p className="transcript">{transcript}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Controls */}
          <div className="action-controls">
            <button 
              className="control-btn clear"
              onClick={handleClearResponse}
              disabled={currentQ.type === 'voice' || submitting}
            >
              <i className="fas fa-eraser"></i> Clear
            </button>
            
            <button 
              className="control-btn mark"
              onClick={handleMarkReview}
              disabled={submitting}
            >
              <i className="fas fa-bookmark"></i> {questionStatus[currentQ.id]?.marked ? 'Unmark' : 'Mark'}
            </button>
            
            <button 
              className="control-btn skip"
              onClick={handleSkip}
              disabled={submitting}
            >
              <i className="fas fa-forward"></i> Skip
            </button>
            
            <button 
              className="control-btn save-next primary"
              onClick={handleSaveNext}
              disabled={submitting}
            >
              {currentQuestion === questions.length - 1 ? (
                <>
                  <i className="fas fa-paper-plane"></i> {submitting ? 'Submitting...' : 'Submit'}
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> Save & Next
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="navigation-section">
          <div className="nav-header">
            <h3><i className="fas fa-bars"></i> Questions ({questions.length})</h3>
            <div className="question-stats-compact">
              <span className="stat answered">
                {Object.values(questionStatus).filter(q => q.answered).length} A
              </span>
              <span className="stat skipped">
                {Object.values(questionStatus).filter(q => q.skipped).length} S
              </span>
              <span className="stat marked">
                {Object.values(questionStatus).filter(q => q.marked).length} M
              </span>
            </div>
          </div>
          
          <div className={`questions-navigation ${getGridClass(questions.length)}`}>
            {questions.map((question, index) => {
              const status = getQuestionStatus(question.id);
              const isCurrent = index === currentQuestion;
              
              return (
                <button
                  key={question.id}
                  className={`question-dot ${status} ${isCurrent ? 'current' : ''}`}
                  onClick={() => !submitting && goToQuestion(index)}
                  disabled={submitting}
                  style={{
                    backgroundColor: getStatusColor(status),
                    border: isCurrent ? '2px solid #ffffff' : 'none',
                    opacity: submitting ? 0.7 : 1
                  }}
                  title={`Question ${index + 1} (${status})`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          
          <div className={`status-legend-compact ${getLegendClass(questions.length)}`}>
            <div className="legend">
              <div className="color-dot answered"></div>
              <span>Answered</span>
            </div>
            <div className="legend">
              <div className="color-dot skipped"></div>
              <span>Skipped</span>
            </div>
            <div className="legend">
              <div className="color-dot marked"></div>
              <span>Marked</span>
            </div>
          </div>
          
          <button 
            className="submit-button"
            onClick={handleSubmitQuiz}
            disabled={submitting}
          >
            <i className="fas fa-flag-checkered"></i> 
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="quiz-footer">
        <div className="progress-info">
          <div className="progress-text">
            Progress: <strong>{currentQuestion + 1}</strong> of <strong>{questions.length}</strong> questions
            <span className="time-remaining">
              • Time remaining: <strong>{formatTime(timeLeft)}</strong>
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AttendQuiz;

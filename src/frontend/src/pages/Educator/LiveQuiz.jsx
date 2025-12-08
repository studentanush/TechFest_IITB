import React, { useState, useEffect } from 'react';
import './LiveQuiz.css';

const LiveQuiz = () => {
  const [quiz, setQuiz] = useState({
    id: 'PHY2024',
    title: 'Physics - Motion & Forces',
    totalQuestions: 20,
    timeLimit: 30,
    roomCode: 'QUIZ-8B2X9P',
    students: [
      { id: 1, name: 'Alex Johnson', email: 'alex@edu.com', status: 'active', score: 85, avatarColor: '#8a2be2' },
      { id: 2, name: 'Sarah Miller', email: 'sarah@edu.com', status: 'active', score: 92, avatarColor: '#f72585' },
      { id: 3, name: 'Mike Chen', email: 'mike@edu.com', status: 'waiting', score: 78, avatarColor: '#4cc9f0' },
      { id: 4, name: 'Emma Wilson', email: 'emma@edu.com', status: 'active', score: 88, avatarColor: '#4361ee' },
      { id: 5, name: 'David Brown', email: 'david@edu.com', status: 'active', score: 95, avatarColor: '#ffd166' },
      { id: 6, name: 'Lisa Garcia', email: 'lisa@edu.com', status: 'waiting', score: 81, avatarColor: '#06d6a0' },
      { id: 7, name: 'Tom Smith', email: 'tom@edu.com', status: 'active', score: 87, avatarColor: '#ef476f' },
      { id: 8, name: 'Priya Patel', email: 'priya@edu.com', status: 'active', score: 90, avatarColor: '#118ab2' },
    ],
    maxParticipants: 50,
    currentParticipants: 8,
    quizStatus: 'lobby', // lobby, started, ended
  });

  const [showMaxLimitPopup, setShowMaxLimitPopup] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  // Timer countdown
  useEffect(() => {
    if (isQuizStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isQuizStarted, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRemoveStudent = (studentId) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
      setQuiz(prev => ({
        ...prev,
        students: prev.students.filter(s => s.id !== studentId),
        currentParticipants: prev.currentParticipants - 1
      }));
    }
  };

  const handleStartQuiz = () => {
    if (quiz.currentParticipants < 1) {
      alert('Need at least 1 participant to start the quiz!');
      return;
    }
    setIsQuizStarted(true);
    setQuiz(prev => ({ ...prev, quizStatus: 'started' }));
  };

  const handleEndQuiz = () => {
    setIsQuizStarted(false);
    setQuiz(prev => ({ ...prev, quizStatus: 'ended' }));
    alert('Quiz ended! Redirecting to reports...');
    window.location.href = '/educator/reports';
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(quiz.roomCode);
    alert(`Room code ${quiz.roomCode} copied to clipboard!`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#00ff88';
      case 'waiting': return '#ffd166';
      case 'inactive': return '#ff6b6b';
      default: return '#8a2be2';
    }
  };

  return (
    <div className="live-quiz">
      {/* Header */}
      <div className="live-header">
        <div className="header-info">
          <h1>Live Quiz Session</h1>
          <p>Hosting: <span className="quiz-title">{quiz.title}</span></p>
        </div>
        
        <div className="room-code-section">
          <div className="room-code-box">
            <div className="code-label">ROOM CODE</div>
            <div className="code-display">
              <span className="code">{quiz.roomCode}</span>
              <button className="copy-btn" onClick={copyRoomCode}>
                <i className="fas fa-copy"></i>
              </button>
            </div>
            <p className="code-hint">Share this code with students to join</p>
          </div>
          
          <div className="participants-count">
            <div className="count-box">
              <i className="fas fa-users"></i>
              <div className="count-info">
                <span className="current">{quiz.currentParticipants}</span>
                <span className="total">/{quiz.maxParticipants}</span>
              </div>
            </div>
            <p className="count-label">Students in Lobby</p>
          </div>
        </div>
      </div>

      <div className="live-content">
        {/* Left Column - Student List */}
        <div className="students-section">
          <div className="section-header">
            <h2>
              <i className="fas fa-user-friends"></i>
              Students in Lobby
            </h2>
            <div className="header-badge">
              {quiz.currentParticipants} connected
            </div>
          </div>

          <div className="students-list">
            {quiz.students.map((student) => (
              <div 
                key={student.id} 
                className={`student-card ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="student-avatar" style={{ background: student.avatarColor }}>
                  {student.name.charAt(0)}
                </div>
                
                <div className="student-info">
                  <h4>{student.name}</h4>
                  <p>{student.email}</p>
                  <div className="student-meta">
                    <span className="score">
                      <i className="fas fa-star"></i> {student.score} pts
                    </span>
                    <span 
                      className="status" 
                      style={{ color: getStatusColor(student.status) }}
                    >
                      <div 
                        className="status-dot" 
                        style={{ background: getStatusColor(student.status) }}
                      ></div>
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="student-actions">
                  <button 
                    className="action-btn remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStudent(student.id);
                    }}
                    title="Remove student"
                  >
                    <i className="fas fa-user-minus"></i>
                  </button>
                  <button 
                    className="action-btn profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Viewing ${student.name}'s profile`);
                    }}
                    title="View profile"
                  >
                    <i className="fas fa-id-card"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Max Limit Warning */}
          {quiz.currentParticipants >= quiz.maxParticipants * 0.8 && (
            <div className="limit-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <p>Lobby is {Math.round((quiz.currentParticipants / quiz.maxParticipants) * 100)}% full</p>
            </div>
          )}
        </div>

        {/* Right Column - Quiz Controls & Preview */}
        <div className="quiz-controls-section">
          {isQuizStarted ? (
            /* Quiz in Progress View */
            <>
              <div className="quiz-progress">
                <div className="progress-header">
                  <h2>Quiz in Progress</h2>
                  <div className="timer">
                    <i className="fas fa-clock"></i>
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Current Question Display */}
                <div className="current-question-view">
                  <div className="question-header">
                    <span className="question-number">Question {currentQuestion} of {quiz.totalQuestions}</span>
                    <span className="question-type">Multiple Choice</span>
                  </div>
                  
                  <div className="question-content">
                    <p>What is the formula for calculating force using Newton's Second Law of Motion?</p>
                    
                    <div className="options-grid">
                      {['F = ma', 'E = mc²', 'P = mv', 'W = Fd'].map((option, index) => (
                        <div key={index} className="option-card">
                          <div className="option-label">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div className="option-text">{option}</div>
                          <div className="option-stats">
                            <span className="percentage">42%</span>
                            <span className="count">5 students</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="question-nav">
                    <button 
                      className="nav-btn prev"
                      onClick={handlePrevQuestion}
                      disabled={currentQuestion === 1}
                    >
                      <i className="fas fa-arrow-left"></i>
                      Previous Question
                    </button>
                    
                    <div className="question-tracker">
                      {[...Array(quiz.totalQuestions)].map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`tracker-dot ${idx + 1 === currentQuestion ? 'active' : idx + 1 < currentQuestion ? 'answered' : ''}`}
                          onClick={() => setCurrentQuestion(idx + 1)}
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      className="nav-btn next"
                      onClick={handleNextQuestion}
                      disabled={currentQuestion === quiz.totalQuestions}
                    >
                      Next Question
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>

                {/* Live Stats */}
                <div className="live-stats">
                  <div className="stat-card">
                    <i className="fas fa-check-circle"></i>
                    <div className="stat-info">
                      <span className="value">12</span>
                      <span className="label">Answered</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-clock"></i>
                    <div className="stat-info">
                      <span className="value">5</span>
                      <span className="label">Still Working</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-times-circle"></i>
                    <div className="stat-info">
                      <span className="value">1</span>
                      <span className="label">Disconnected</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-chart-line"></i>
                    <div className="stat-info">
                      <span className="value">85%</span>
                      <span className="label">Avg Score</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Lobby View */
            <>
              <div className="quiz-preview">
                <h2>Quiz Preview</h2>
                <div className="preview-card">
                  <div className="preview-header">
                    <h3>{quiz.title}</h3>
                    <div className="preview-badges">
                      <span className="badge">
                        <i className="fas fa-question-circle"></i>
                        {quiz.totalQuestions} Questions
                      </span>
                      <span className="badge">
                        <i className="fas fa-clock"></i>
                        {quiz.timeLimit} minutes
                      </span>
                      <span className="badge">
                        <i className="fas fa-microphone"></i>
                        Voice Enabled
                      </span>
                    </div>
                  </div>
                  
                  <div className="preview-stats">
                    <div className="stat">
                      <div className="stat-value">{quiz.currentParticipants}</div>
                      <div className="stat-label">Students Ready</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">{quiz.maxParticipants}</div>
                      <div className="stat-label">Max Capacity</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">Ready</div>
                      <div className="stat-label">Status</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="quiz-controls">
                <div className="control-group">
                  <h3>Quiz Settings</h3>
                  <div className="settings-grid">
                    <div className="setting">
                      <label>
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                        <span>Shuffle Questions</span>
                      </label>
                    </div>
                    <div className="setting">
                      <label>
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                        <span>Show Scores</span>
                      </label>
                    </div>
                    <div className="setting">
                      <label>
                        <input type="checkbox" />
                        <span className="toggle-slider"></span>
                        <span>Time Limit</span>
                      </label>
                    </div>
                    <div className="setting">
                      <label>
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-slider"></span>
                        <span>Allow Review</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  <button 
                    className="btn secondary"
                    onClick={() => setShowMaxLimitPopup(true)}
                  >
                    <i className="fas fa-cog"></i>
                    Settings
                  </button>
                  <button 
                    className="btn primary"
                    onClick={handleStartQuiz}
                    disabled={quiz.currentParticipants === 0}
                  >
                    <i className="fas fa-play-circle"></i>
                    Start Quiz Session
                  </button>
                  <button 
                    className="btn danger"
                    onClick={handleEndQuiz}
                  >
                    <i className="fas fa-stop-circle"></i>
                    End Session
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Max Limit Popup */}
      {showMaxLimitPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Maximum Limit Reached</h3>
              <button 
                className="close-btn"
                onClick={() => setShowMaxLimitPopup(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h4>Lobby is Full!</h4>
              <p>
                The maximum number of participants ({quiz.maxParticipants}) has been reached.
                You need to upgrade your plan to allow more students.
              </p>
              <div className="modal-actions">
                <button 
                  className="btn outline"
                  onClick={() => setShowMaxLimitPopup(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn primary"
                  onClick={() => {
                    setShowMaxLimitPopup(false);
                    alert('Redirecting to upgrade plan...');
                  }}
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveQuiz;

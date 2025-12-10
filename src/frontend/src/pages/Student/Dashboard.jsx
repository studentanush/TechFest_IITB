import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { ContextAPI } from '../../Context';

const StudentDashboard = () => {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [typingText, setTypingText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const typingMessages = [
    "Join Live Quiz Instantly ⚡",
    "Track Your Progress 📊",
    "Get AI-Powered Insights 🤖",
    "Improve With Analytics 📈"
  ];

  // Typing effect
  useEffect(() => {
    const handleTyping = () => {
      const currentMessage = typingMessages[typingIndex];
      
      if (!isDeleting && charIndex < currentMessage.length) {
        setTypingText(currentMessage.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      } else if (isDeleting && charIndex > 0) {
        setTypingText(currentMessage.substring(0, charIndex - 1));
        setCharIndex(charIndex - 1);
      } else if (!isDeleting && charIndex === currentMessage.length) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setTypingIndex((typingIndex + 1) % typingMessages.length);
      }
    };

    const typingSpeed = isDeleting ? 50 : 100;
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typingText, typingIndex, charIndex, isDeleting]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const availableQuizzes = [
    { 
      id: 1, 
      title: 'Physics - Motion Quiz', 
      teacher: 'Dr. Johnson', 
      duration: '30 min', 
      questions: 15,
      status: 'live',
      icon: '⚡'
    },
    { 
      id: 2, 
      title: 'Math - Calculus Basics', 
      teacher: 'Prof. Smith', 
      duration: '45 min', 
      questions: 20,
      status: 'upcoming',
      icon: '∫'
    },
    { 
      id: 3, 
      title: 'History - World War II', 
      teacher: 'Ms. Davis', 
      duration: '60 min', 
      questions: 25,
      status: 'live',
      icon: '📜'
    },
  ];

  const pastAttempts = [
    { 
      id: 1, 
      title: 'Chemistry Basics', 
      date: 'Dec 5, 2024', 
      score: 85, 
      total: 100,
      icon: '🧪'
    },
    { 
      id: 2, 
      title: 'Biology - Cells', 
      date: 'Nov 28, 2024', 
      score: 92, 
      total: 100,
      icon: '🔬'
    },
    { 
      id: 3, 
      title: 'Physics - Energy', 
      date: 'Nov 20, 2024', 
      score: 78, 
      total: 100,
      icon: '⚛️'
    },
  ];

  const handleJoinQuiz = () => {
    if (roomCode.trim()) {
      navigate(`/attend-quiz/${roomCode}`);
    } else {
      alert('Please enter a room code');
    }
  };

  const handleViewReport = (quizId) => {
    navigate(`/student-report/${quizId}`);
  };

  const handleJoinLiveQuiz = (quizId) => {
    navigate(`/attend-quiz/${quizId}`);
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 90) return 'score-badge excellent';
    if (score >= 80) return 'score-badge good';
    if (score >= 70) return 'score-badge average';
    return 'score-badge poor';
  };

  const getScoreEmoji = (score) => {
    if (score >= 90) return '🎯';
    if (score >= 80) return '✅';
    if (score >= 70) return '📈';
    return '📊';
  };

  if (isLoading) {
    return (
      <div className="educator-dashboard student-version loading">
        <div className="dashboard-content" style={{textAlign: 'center', padding: '100px'}}>
          <div className="logo-icon" style={{margin: '0 auto 30px', animation: 'pulse-glow 2s infinite'}}>
            🎓
          </div>
          <h1 style={{color: 'white'}}>Loading Student Portal...</h1>
          <p style={{color: 'rgba(255,255,255,0.7)'}}>Preparing your learning experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="educator-dashboard student-version">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-container">
            <div className="logo-icon">
              <span style={{ fontSize: '1.5rem' }}>🎓</span>
            </div>
            <div className="logo-text">
              <div className="primary">QUIZZCO.AI</div>
              <div className="secondary">Student Portal</div>
            </div>
          </div>
          <div className="typing-text-container">
            <span className="typing-text">{typingText}</span>
            <span className="typing-cursor">|</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="notification-bell">
            <i className="fas fa-bell"></i>
            <div className="notification-badge">3</div>
          </div>
          
          <div className="user-profile">
            <div className="user-avatar">S</div>
            <div className="user-info">
              <h4>Alex Johnson</h4>
              <p>Physics 101 • Roll No: 25</p>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1>Welcome to <span className="highlight">Student Portal</span>! 👋</h1>
          <p>Join live quizzes, track your progress, and improve your learning with AI-powered insights</p>
        </section>

        {/* Join Live Quiz Section */}
        <section className="section-container join-section-first">
          <div className="join-card action-card">
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #f72585, #ff006e)' }}>
              <i className="fas fa-broadcast-tower"></i>
            </div>
            <h2>Join Live Quiz Now</h2>
            <p>Enter the room code provided by your teacher to join instantly</p>
            
            <div className="join-input-group">
              <input
                type="text"
                placeholder="Enter room code (e.g., QUIZ-8B2X)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength="10"
                onKeyPress={(e) => e.key === 'Enter' && handleJoinQuiz()}
              />
              <button onClick={handleJoinQuiz} className="action-btn join-btn">
                <i className="fas fa-sign-in-alt"></i> Join Now
              </button>
            </div>
            
            <div className="quick-join-hint">
              <span><i className="fas fa-lightbulb"></i> Quick tip: Ask your teacher for the room code!</span>
            </div>
          </div>
        </section>

        {/* Quick Action - View Reports */}
        <section className="section-container quick-actions-single">
          <div className="action-card" onClick={() => navigate('/student-report/1')}>
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #4cc9f0, #4361ee)' }}>
              📊
            </div>
            <h3>View Reports</h3>
            <p>Check your performance analytics and insights</p>
            <button className="action-btn">
              <span>Explore</span>
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </section>

        {/* Available Quizzes */}
        <section className="section-container">
          <div className="quiz-table">
            <div className="quiz-table-header">
              <h3><i className="fas fa-bolt"></i> Available Quizzes</h3>
              <button className="view-all-btn">
                <span>View All</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            
            <div className="quiz-items">
              {availableQuizzes.map((quiz, index) => (
                <div 
                  key={quiz.id} 
                  className="quiz-item"
                  style={{ animationDelay: `${0.4 + (0.1 * index)}s` }}
                  onClick={() => quiz.status === 'live' && handleJoinLiveQuiz(quiz.id)}
                >
                  <div className="quiz-info">
                    <div className="quiz-icon">{quiz.icon}</div>
                    <div className="quiz-details">
                      <h4>{quiz.title}</h4>
                      <p>By {quiz.teacher} • {quiz.questions} questions • {quiz.duration}</p>
                    </div>
                  </div>
                  
                  <div className="quiz-meta">
                    <span className={`status-badge status-${quiz.status}`}>
                      {quiz.status === 'live' ? '🔴 LIVE NOW' : '🟡 UPCOMING'}
                    </span>
                    <div className="quiz-actions">
                      <button 
                        className="icon-btn" 
                        title="Join Quiz"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinLiveQuiz(quiz.id);
                        }}
                      >
                        <i className="fas fa-play"></i>
                      </button>
                      <button 
                        className="icon-btn" 
                        title="View Details"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/attend/${quiz.id}`);
                        }}
                      >
                        <i className="fas fa-info-circle"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Past Attempts */}
        <section className="section-container">
          <div className="quiz-table">
            <div className="quiz-table-header">
              <h3><i className="fas fa-history"></i> Your Recent Attempts</h3>
              <button className="view-all-btn">
                <span>View All Reports</span>
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            
            <div className="quiz-items">
              {pastAttempts.map((attempt, index) => {
                const scoreEmoji = getScoreEmoji(attempt.score);
                const badgeClass = getScoreBadgeClass(attempt.score);
                
                return (
                  <div 
                    key={attempt.id} 
                    className="quiz-item"
                    style={{ animationDelay: `${0.7 + (0.1 * index)}s` }}
                    onClick={() => handleViewReport(attempt.id)}
                  >
                    <div className="quiz-info">
                      <div className="quiz-icon">{attempt.icon}</div>
                      <div className="quiz-details">
                        <h4>{attempt.title}</h4>
                        <p>Attempted on {attempt.date} • Score: <span className="score-highlight">{attempt.score}%</span></p>
                      </div>
                    </div>
                    
                    <div className="quiz-meta">
                      <span className="status-badge status-completed">
                        <i className="fas fa-check-circle"></i> COMPLETED
                      </span>
                      
                      <div className={badgeClass}>
                        <span className="score-emoji">{scoreEmoji}</span>
                        <span className="score-value">{attempt.score}%</span>
                      </div>
                      
                      <div className="quiz-actions">
                        <button 
                          className="icon-btn" 
                          title="View Report"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewReport(attempt.id);
                          }}
                        >
                          <i className="fas fa-chart-bar"></i>
                        </button>
                        <button 
                          className="icon-btn" 
                          title="Download PDF"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/student-report/${attempt.id}`);
                          }}
                        >
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>© 2024 QUIZZCO.AI Student Portal • Learn, Practice, Excel!</p>
          <div className="footer-links">
            <button onClick={() => alert('Help Center coming soon!')}>
              <i className="fas fa-question-circle"></i> Help Center
            </button>
            <button onClick={() => alert('Settings coming soon!')}>
              <i className="fas fa-cog"></i> Settings
            </button>
            <button onClick={() => {
              alert('Logged out successfully!');
              navigate('/');
            }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentDashboard; 

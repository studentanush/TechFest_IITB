import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EducatorDashboard.css';

const EducatorDashboard = () => {
  const [typingText, setTypingText] = useState('');
  const [notifications] = useState(3);
  const navigate = useNavigate();
  
  const welcomeMessages = [
    "Create engaging quizzes in seconds",
    "Track student progress in real-time",
    "Generate AI-powered assessments",
    "Host live interactive sessions"
  ];

  useEffect(() => {
    let currentMessage = 0;
    let currentChar = 0;
    let isDeleting = false;
    let timer;

    const type = () => {
      const message = welcomeMessages[currentMessage];
      
      if (isDeleting) {
        setTypingText(message.substring(0, currentChar - 1));
        currentChar--;
      } else {
        setTypingText(message.substring(0, currentChar + 1));
        currentChar++;
      }

      if (!isDeleting && currentChar === message.length) {
        isDeleting = true;
        timer = setTimeout(type, 2000);
      } else if (isDeleting && currentChar === 0) {
        isDeleting = false;
        currentMessage = (currentMessage + 1) % welcomeMessages.length;
        timer = setTimeout(type, 500);
      } else {
        const speed = isDeleting ? 50 : 100;
        timer = setTimeout(type, speed);
      }
    };

    timer = setTimeout(type, 1000);
    return () => clearTimeout(timer);
  }, []);

  const actions = [
    { 
      id: 'chat',
      icon: 'fas fa-plus-circle', 
      title: 'Create New Quiz', 
      description: 'Generate AI-powered quizzes with document upload and chat',
      color: 'linear-gradient(135deg, #8a2be2, #f72585)',
      link: '/educator/chat'
    },
    { 
      id: 'live-quiz',
      icon: 'fas fa-broadcast-tower', 
      title: 'Live Quiz Session', 
      description: 'Host real-time interactive quizzes with students',
      color: 'linear-gradient(135deg, #4361ee, #4cc9f0)',
      link: '/educator/live-quiz'
    },
    { 
      id: 'reports',
      icon: 'fas fa-chart-bar', 
      title: 'View Reports', 
      description: 'Analyze student performance with detailed analytics',
      color: 'linear-gradient(135deg, #f72585, #ff80ab)',
      link: '/educator/reports'
    },
  ];

  const recentQuizzes = [
    { 
      id: 1,
      name: 'Physics - Motion & Forces', 
      date: 'Today', 
      questions: 20, 
      status: 'draft',
      link: '/educator/generated?quiz=1'
    },
    { 
      id: 2,
      name: 'Math - Calculus Basics', 
      date: 'Yesterday', 
      questions: 15, 
      status: 'published',
      link: '/educator/generated?quiz=2'
    },
    { 
      id: 3,
      name: 'History - World War II', 
      date: 'Dec 5', 
      questions: 25, 
      status: 'live',
      link: '/educator/live-quiz?quiz=3'
    },
    { 
      id: 4,
      name: 'Chemistry - Organic Compounds', 
      date: 'Dec 3', 
      questions: 18, 
      status: 'published',
      link: '/educator/generated?quiz=4'
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleEditQuiz = (quiz) => {
    if (quiz.status === 'live') {
      handleNavigation(`/educator/live-quiz?quiz=${quiz.id}`);
    } else {
      handleNavigation(`/educator/generated?quiz=${quiz.id}`);
    }
  };

  const handleShareQuiz = (quiz) => {
    const shareUrl = `${window.location.origin}/attend/${quiz.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: quiz.name,
        text: `Join my quiz "${quiz.name}" on Quizzco.ai`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert(`Quiz link copied to clipboard!\n\n${shareUrl}`);
    }
  };

  const handleViewQuiz = (quiz) => {
    if (quiz.status === 'live') {
      handleNavigation(`/educator/live-quiz?quiz=${quiz.id}&preview=true`);
    } else {
      handleNavigation(`/educator/generated?quiz=${quiz.id}&view=true`);
    }
  };

  const handleNotificationClick = () => {
    alert('You have 3 new notifications:\n1. Student Mike completed Physics quiz\n2. Quiz "Math Basics" is ready to publish\n3. New student joined your class');
  };

  const handleProfileClick = () => {
    alert('Profile menu would open here');
  };

  const handleLogoClick = () => {
    navigate('/educator/dashboard');
  };

  return (
    <div className="educator-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-container" onClick={handleLogoClick}>
            <div className="logo-icon">
              <i className="fas fa-brain"></i>
            </div>
            <div className="logo-text">
              <div className="primary">QUIZZCO.AI</div>
              <div className="secondary">Educator Portal</div>
            </div>
          </div>
          <div className="typing-text">{typingText}</div>
        </div>

        <div className="header-right">
          <div className="notification-bell" onClick={handleNotificationClick}>
            <i className="fas fa-bell"></i>
            {notifications > 0 && (
              <div className="notification-badge">{notifications}</div>
            )}
          </div>
          
          <div className="user-profile" onClick={handleProfileClick}>
            <div className="user-avatar">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="user-info">
              <h4>Dr. Sarah Johnson</h4>
              <p>Physics Department</p>
            </div>
            <i className="fas fa-chevron-down" style={{marginLeft: '10px'}}></i>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1>
            Welcome back, <span className="highlight">Dr. Sharma</span>! 👋
          </h1>
          <p>
            Ready to create some amazing learning experiences today?
            Your students are waiting for your next engaging quiz!
          </p>
        </section>

        {/* Quick Actions - Now comes directly after welcome section */}
        <section className="actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid three-column">
            {actions.map((action, index) => (
              <div 
                key={action.id} 
                className="action-card"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  cursor: 'pointer'
                }}
                onClick={() => handleNavigation(action.link)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <div className="action-icon" style={{background: action.color}}>
                  <i className={action.icon}></i>
                </div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <button 
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigation(action.link);
                  }}
                >
                  Get Started <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Quizzes */}
        <section className="recent-section">
          <div className="quiz-table">
            <div className="quiz-table-header">
              <h3>Recent Quizzes</h3>
              <button 
                className="view-all-btn"
                onClick={() => handleNavigation('/educator/generated')}
              >
                View All <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            
            <div className="quiz-items">
              {recentQuizzes.map((quiz, index) => (
                <div 
                  key={quiz.id} 
                  className="quiz-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleViewQuiz(quiz)}
                >
                  <div className="quiz-info">
                    <div className="quiz-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="quiz-details">
                      <h4>{quiz.name}</h4>
                      <p>{quiz.questions} questions • Created: {quiz.date}</p>
                    </div>
                  </div>
                  
                  <div className="quiz-meta">
                    <span className={`status-badge status-${quiz.status}`}>
                      {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                    </span>
                    <div className="quiz-actions">
                      <button 
                        className="icon-btn" 
                        title="Edit Quiz"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditQuiz(quiz);
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Preview Quiz"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewQuiz(quiz);
                        }}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className="icon-btn" 
                        title="Share Quiz"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareQuiz(quiz);
                        }}
                      >
                        <i className="fas fa-share"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>© 2024 QUIZZCO.AI Educator Portal • Making learning interactive and fun!</p>
          <div className="footer-links">
            <button onClick={() => handleNavigation('/educator/chat')}>Create Quiz</button>
            <button onClick={() => handleNavigation('/educator/generated')}>My Quizzes</button>
            <button onClick={() => handleNavigation('/educator/reports')}>Reports</button>
            <button onClick={() => handleNavigation('/educator/live-quiz')}>Live Sessions</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EducatorDashboard;

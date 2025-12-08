import React, { useState } from 'react';
import './GeneratedQuizzes.css';

const GeneratedQuizzes = () => {
  const [quizzes, setQuizzes] = useState([
    {
      id: 1,
      title: 'Physics - Motion & Forces',
      date: 'Today',
      questions: 20,
      status: 'draft',
      score: 100,
      topics: ['Kinematics', 'Newton\'s Laws', 'Friction'],
      voiceEnabled: true,
      context: 'Based on Chapter 3 of Physics textbook covering motion and forces.'
    },
    {
      id: 2,
      title: 'Math - Calculus Basics',
      date: 'Yesterday',
      questions: 15,
      status: 'published',
      score: 85,
      topics: ['Derivatives', 'Integrals', 'Limits'],
      voiceEnabled: false,
      context: 'Introduction to calculus concepts for beginners.'
    },
    {
      id: 3,
      title: 'History - World War II',
      date: 'Dec 5',
      questions: 25,
      status: 'live',
      score: 95,
      topics: ['Causes', 'Major Battles', 'Aftermath'],
      voiceEnabled: true,
      context: 'Comprehensive coverage of WWII events from 1939-1945.'
    },
    {
      id: 4,
      title: 'Chemistry - Organic Compounds',
      date: 'Dec 3',
      questions: 18,
      status: 'published',
      score: 90,
      topics: ['Hydrocarbons', 'Functional Groups', 'Isomers'],
      voiceEnabled: false,
      context: 'Organic chemistry fundamentals from lab manual.'
    },
  ]);

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showContext, setShowContext] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const handleEditQuestion = (quizId, questionIndex) => {
    setEditingQuestion({ quizId, questionIndex });
  };

  const handleSaveQuiz = (quizId) => {
    alert(`Quiz ${quizId} saved successfully!`);
    // Logic to save quiz
  };

  const handleSaveAndRun = (quizId) => {
    alert(`Quiz ${quizId} saved and ready for students!`);
    window.location.href = `/educator/live-quiz?quiz=${quizId}`;
  };

  const handleSaveAndPublish = (quizId) => {
    alert(`Quiz ${quizId} published for hosting!`);
    window.location.href = `/educator/live-quiz?quiz=${quizId}&publish=true`;
  };

  const handleViewContext = (context) => {
    setShowContext(context);
  };

  const sampleQuestions = [
    {
      id: 1,
      question: "What is the formula for Newton's Second Law of Motion?",
      options: ["F = ma", "E = mc²", "P = mv", "W = Fd"],
      correctAnswer: 0,
      score: 10,
      type: "mcq"
    },
    {
      id: 2,
      question: "Describe the concept of inertia in your own words.",
      options: [],
      score: 15,
      type: "voice",
      voiceEnabled: true
    },
    {
      id: 3,
      question: "Calculate the force required to accelerate a 5kg object at 3m/s²",
      options: ["15N", "8N", "20N", "12N"],
      correctAnswer: 0,
      score: 10,
      type: "mcq"
    }
  ];

  return (
    <div className="generated-quizzes">
      {/* Header */}
      <div className="quizzes-header">
        <div className="header-left">
          <h1>Generated Quizzes</h1>
          <p>Review, edit, and publish your AI-generated quizzes</p>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search quizzes..." />
          </div>
          <button className="filter-btn">
            <i className="fas fa-filter"></i>
            Filter
          </button>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <div 
            key={quiz.id} 
            className={`quiz-card ${quiz.status}`}
            onClick={() => setSelectedQuiz(selectedQuiz?.id === quiz.id ? null : quiz)}
          >
            {/* Quiz Header */}
            <div className="quiz-card-header">
              <div className="quiz-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="quiz-info">
                <h3>{quiz.title}</h3>
                <p className="quiz-meta">
                  <span><i className="far fa-calendar"></i> {quiz.date}</span>
                  <span><i className="far fa-question-circle"></i> {quiz.questions} Qs</span>
                  <span><i className="fas fa-star"></i> {quiz.score} pts</span>
                </p>
              </div>
              <span className={`status-badge ${quiz.status}`}>
                {quiz.status.toUpperCase()}
              </span>
            </div>

            {/* Topics */}
            <div className="quiz-topics">
              {quiz.topics.map((topic, index) => (
                <span key={index} className="topic-tag">
                  {topic}
                </span>
              ))}
              {quiz.voiceEnabled && (
                <span className="voice-tag">
                  <i className="fas fa-microphone"></i> Voice
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="quiz-actions">
              <button 
                className="action-btn view-context"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewContext(quiz.context);
                }}
              >
                <i className="fas fa-eye"></i> View Context
              </button>
              <button 
                className={`action-btn voice-toggle ${quiz.voiceEnabled ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Toggle voice
                }}
              >
                <i className="fas fa-microphone"></i> 
                {quiz.voiceEnabled ? ' Voice On' : ' Enable Voice'}
              </button>
            </div>

            {/* Expanded View */}
            {selectedQuiz?.id === quiz.id && (
              <div className="quiz-details">
                <h4>Questions Preview</h4>
                {sampleQuestions.map((q) => (
                  <div key={q.id} className="question-box">
                    <div className="question-header">
                      <span className="question-number">Q{q.id}</span>
                      <span className="question-score">{q.score} pts</span>
                      <span className="question-type">{q.type.toUpperCase()}</span>
                    </div>
                    
                    <div className="question-content">
                      <p>{q.question}</p>
                      
                      {q.type === 'mcq' ? (
                        <div className="options-grid">
                          {q.options.map((option, optIndex) => (
                            <div key={optIndex} className="option-item">
                              <span className="option-label">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <input 
                                type="text" 
                                defaultValue={option}
                                className="option-input"
                                onClick={(e) => e.stopPropagation()}
                              />
                              {optIndex === q.correctAnswer && (
                                <span className="correct-badge">
                                  <i className="fas fa-check"></i>
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="voice-question-box">
                          <div className="voice-icon">
                            <i className="fas fa-microphone"></i>
                          </div>
                          <p>Voice-enabled response question</p>
                          <button className="test-voice-btn">
                            <i className="fas fa-play"></i> Test Voice
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="question-actions">
                      <button className="edit-btn">
                        <i className="fas fa-edit"></i> Reframe
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        max="100" 
                        defaultValue={q.score}
                        className="score-input"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ))}

                {/* Final Actions */}
                <div className="final-actions">
                  <button 
                    className="final-btn save"
                    onClick={() => handleSaveQuiz(quiz.id)}
                  >
                    <i className="fas fa-save"></i> Save Quiz
                  </button>
                  <button 
                    className="final-btn save-run"
                    onClick={() => handleSaveAndRun(quiz.id)}
                  >
                    <i className="fas fa-play"></i> Save & Run
                  </button>
                  <button 
                    className="final-btn save-publish"
                    onClick={() => handleSaveAndPublish(quiz.id)}
                  >
                    <i className="fas fa-broadcast-tower"></i> Save & Publish
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Context Modal */}
      {showContext && (
        <div className="context-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Document Context</h3>
              <button 
                className="close-modal"
                onClick={() => setShowContext(null)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>{showContext}</p>
              <div className="source-info">
                <i className="fas fa-file-pdf"></i>
                <span>Source: physics_textbook_chapter3.pdf</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedQuizzes;

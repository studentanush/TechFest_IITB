import React, { useState, useEffect } from 'react';
import './LiveQuiz.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { adminSocket } from '../../socket';

const LiveQuiz = () => {

  const { id } = useParams(); // 
  const [players, setPlayers] = useState([]);;

  const [quiz, setQuiz] = useState({});


  const getRoomCodeAndSetQuiz = (quizData) => {
    const hostName = quizData[0]?.createdBy?.name;
   
    const quizD = quizData[0];
    adminSocket.emit(
      "createRoom",
      { hostName, quizD},
      (response) => {
        if (response.roomCode) {
          const roomCode = response.roomCode;
          // Create the final quiz object with roomCode and detail
          setQuiz({
            roomCode,
            detail: quizData[0]
          });

          console.log("Quiz room created:", roomCode);
        } else {
          alert("Error creating room!");
        }
      }
    );
  };
  useEffect(() => {
    // This will run AFTER setQuiz is called and the component re-renders
    if (quiz.roomCode) {
      console.log("State Monitor: Quiz state has been updated:", quiz);
    }
  }, [quiz]);
  const fetchQuiz = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/quizzes/getQuiz", {
        params: {
          id: id,
        }
      });

      const quizData = response.data;
      if (quizData) {

        getRoomCodeAndSetQuiz(quizData);
      }

    } catch (error) {
      console.log(error);
    }
  };
  console.log(quiz);
  console.log(players);
  useEffect(() => {
    console.log("in use effect")
    adminSocket.on("updatePlayers", (players) => setPlayers(players));

    fetchQuiz();


    // adminSocket.on("leaderboardUpdate", (details) =>
    //   setLeaderBoardData(details)
    // );

    return () => {
      //adminSocket.off("leaderboardUpdate");
      adminSocket.off("updatePlayers");
    };
  }, [])

  const [showMaxLimitPopup, setShowMaxLimitPopup] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0); // 30 minutes in seconds

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
    const roomCode = quiz.roomCode;
    adminSocket.emit("playOnOff",{roomCode,play:true},(response)=>{
        console.log(response);
    })
  };

  const handleEndQuiz = () => {
    setIsQuizStarted(false);
    setQuiz(prev => ({ ...prev, quizStatus: 'ended' }));
    const roomCode = quiz.roomCode;
    adminSocket.emit("playOnOff",{roomCode,play:false},(response)=>{
        console.log(response);
    })
    alert('Quiz ended! Redirecting to reports...');
    window.location.href = '/educator/reports';
  };

  const handleNextQuestion = () => {
    // Use optional chaining for safety
    const totalQuestions = quiz.detail?.questions?.length || 0;
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Get the data for the currently displayed question (0-indexed array vs 1-indexed display)
  const currentQuestionData = quiz.detail?.questions[currentQuestion - 1]

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
          <p>Hosting: <span className="quiz-title">{quiz.detail?.title}</span></p>
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
                <span className="current">{players.length}</span>
                <span className="total">/50</span>
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
              {players.length} connected
            </div>
          </div>

          <div className="students-list">
            {players.map((student) => (
              <div
                key={student.id}
                className={`student-card ${selectedStudent?.id === student.id ? 'selected' : ''}`}
                onClick={() => setSelectedStudent(student)}
              >
                <div className="student-avatar" style={{ background: student.avatarColor }}>
                  {student.playerName.charAt(0)}
                </div>

                <div className="student-info">
                  <h4>{student.playerName}</h4>
                  <p>{student.playerEmail}</p>
                  <div className="student-meta">
                    <span className="score">
                      <i className="fas fa-star"></i> {student.score} pts
                    </span>
                    <span
                      className="status"
                      style={{ color: getStatusColor('active') }}
                    >
                      <div
                        className="status-dot"
                        style={{ background: getStatusColor(student?.status) }}
                      ></div>
                      {student?.status?.charAt(0).toUpperCase() + student?.status?.slice(1)}
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
                      alert(`Viewing ${student.playerName}'s profile`);
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
          {players.length >= 50 * 0.8 && (
            <div className="limit-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <p>Lobby is {Math.round((players.length / 50) * 100)}% full</p>
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
                    <span className="question-number">
                      Question {currentQuestion} of {quiz.detail?.questions?.length || 0}
                    </span>
                    <span className="question-type">{currentQuestionData?.type || 'Multiple Choice'}</span>
                  </div>

                  <div className="question-content">
                    
                    <p>{currentQuestionData?.question || 'Loading Question...'}</p>

                    <div className="options-grid">
                     
                      {currentQuestionData?.options?.map((optionText, index) => (
                        <div key={index} className="option-card">
                          <div className="option-label">
                            {String.fromCharCode(65 + index)} {/* A, B, C, D */}
                          </div>
                        
                          <div className="option-text">{optionText}</div>
                          
                          {/* <div className="option-stats">
                            <span className="percentage">42%</span>
                            <span className="count">5 students</span>
                          </div> */}
                        </div>
                      ))}
                    </div>
                  </div>

                 
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
                      {quiz.detail?.questions?.map((_, idx) => (
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
                      disabled={currentQuestion === (quiz.detail?.questions?.length || 0)}
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
                    <h3>{quiz.detail?.title}</h3>
                    <div className="preview-badges">
                      <span className="badge">
                        <i className="fas fa-question-circle"></i>
                        {quiz.detail?.questions?.length} Questions
                      </span>
                      <span className="badge">
                        <i className="fas fa-clock"></i>
                        {quiz.detail?.time} minutes
                      </span>
                      <span className="badge">
                        <i className="fas fa-microphone"></i>
                        Voice Enabled
                      </span>
                    </div>
                  </div>

                  <div className="preview-stats">
                    <div className="stat">
                      <div className="stat-value">{players.length}</div>
                      <div className="stat-label">Students Ready</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">50</div>
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

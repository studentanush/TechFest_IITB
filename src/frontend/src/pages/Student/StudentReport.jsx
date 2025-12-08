import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './StudentReport.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const StudentReport = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reportRef = useRef();
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingSolutions, setDownloadingSolutions] = useState(false);

  // ==================== MOCK DATA (Replace with API) ====================
  const mockReportData = {
    submissionId: 'sub_123456789',
    quizId: quizId,
    quizTitle: 'Physics - Motion and Forces Quiz',
    studentName: 'Alex Johnson',
    studentId: 'STU2024001',
    className: 'Physics 101',
    teacher: 'Dr. Johnson',
    submittedAt: '2024-12-08T14:30:00Z',
    timeTaken: '25:30', // 25 minutes 30 seconds
    totalQuestions: 25,
    attempted: 22,
    correctAnswers: 18,
    wrongAnswers: 4,
    skipped: 3,
    score: 72,
    totalMarks: 25,
    percentage: 72,
    grade: 'B',
    rank: '15 out of 45',
    
    // Question-wise analysis
    questions: Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      question: `Question ${i + 1}: A car accelerates uniformly from 0 to ${72 + i} km/h in 10 seconds. What is the acceleration?`,
      type: i % 5 === 0 ? 'voice' : 'mcq',
      studentAnswer: i < 18 ? 'a' : i < 22 ? 'b' : null, // 18 correct, 4 wrong, 3 skipped
      correctAnswer: 'a',
      isCorrect: i < 18,
      marks: 1,
      awardedMarks: i < 18 ? 1 : 0,
      difficulty: ['Easy', 'Medium', 'Hard'][i % 3],
      topic: ['Motion', 'Forces', 'Energy'][i % 3],
      solution: `Solution: Convert ${72 + i} km/h to m/s = ${(72 + i) * 5/18} m/s. Acceleration = (final velocity - initial velocity)/time = (${(72 + i) * 5/18} - 0)/10 = ${((72 + i) * 5/18)/10} m/s² ≈ ${2 + i * 0.5} m/s².`,
      explanation: 'This question tests understanding of uniform acceleration and unit conversion from km/h to m/s.'
    })),
    
    // Topic-wise analysis
    topics: [
      { name: 'Motion', total: 9, correct: 7, percentage: 77.8 },
      { name: 'Forces', total: 8, correct: 6, percentage: 75.0 },
      { name: 'Energy', total: 8, correct: 5, percentage: 62.5 }
    ],
    
    // Question type analysis
    questionTypes: [
      { type: 'MCQ', total: 20, correct: 16, percentage: 80.0 },
      { type: 'Voice', total: 5, correct: 2, percentage: 40.0 }
    ],
    
    // Difficulty analysis
    difficulties: [
      { level: 'Easy', total: 9, correct: 8, percentage: 88.9 },
      { level: 'Medium', total: 10, correct: 7, percentage: 70.0 },
      { level: 'Hard', total: 6, correct: 3, percentage: 50.0 }
    ],
    
    // AI Insights
    aiInsights: {
      strengths: [
        'Strong understanding of motion concepts',
        'Good at unit conversions',
        'Excellent time management during quiz'
      ],
      weaknesses: [
        'Need improvement in force-related problems',
        'Struggles with voice response questions',
        'Should review energy conservation laws'
      ],
      recommendations: [
        'Practice force diagrams and free-body diagrams',
        'Review Newton\'s Laws of Motion',
        'Focus on energy conservation problems',
        'Improve verbal explanation skills for voice questions'
      ],
      overallAssessment: 'You performed well overall with a solid grasp of basic concepts. Focus on your weaker areas to improve your score next time.'
    },
    
    // Comparison with class
    classStats: {
      averageScore: 65,
      highestScore: 95,
      medianScore: 68,
      yourPercentile: 75
    }
  };

  // ==================== API FUNCTIONS ====================
  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // REAL API CALL - UNCOMMENT WHEN READY:
      // const response = await fetch(`/api/reports/${quizId}/student`);
      // if (!response.ok) throw new Error('Failed to fetch report');
      // const data = await response.json();
      // return data;
      
      // Mock delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockReportData;
      
    } catch (err) {
      console.error('Error fetching report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await fetchReportData();
        setReportData(data);
        
        // If coming from quiz submission, show submission details
        if (location.state) {
          console.log('Submission data:', location.state);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadReport();
  }, [quizId, location.state]);

  // ==================== PDF GENERATION ====================
  const generatePDFReport = async () => {
    if (!reportData) return;
    
    setDownloadingPDF(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(138, 43, 226);
      doc.text('QUIZZCO.AI - Student Report', pageWidth / 2, 20, { align: 'center' });
      
      // Quiz Info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Quiz: ${reportData.quizTitle}`, 20, 40);
      doc.text(`Student: ${reportData.studentName}`, 20, 50);
      doc.text(`Class: ${reportData.className}`, 20, 60);
      doc.text(`Submitted: ${new Date(reportData.submittedAt).toLocaleDateString()}`, 20, 70);
      
      // Score Summary
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Performance Summary', 20, 90);
      
      doc.setFontSize(11);
      const summaryData = [
        ['Total Questions', reportData.totalQuestions.toString()],
        ['Attempted', reportData.attempted.toString()],
        ['Correct Answers', reportData.correctAnswers.toString()],
        ['Wrong Answers', reportData.wrongAnswers.toString()],
        ['Skipped', reportData.skipped.toString()],
        ['Score', `${reportData.score}/${reportData.totalMarks}`],
        ['Percentage', `${reportData.percentage}%`],
        ['Grade', reportData.grade],
        ['Time Taken', reportData.timeTaken]
      ];
      
      doc.autoTable({
        startY: 95,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: [138, 43, 226] },
        margin: { left: 20 }
      });
      
      // Topic-wise Performance
      const topicTableY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Topic-wise Performance', 20, topicTableY);
      
      const topicData = reportData.topics.map(topic => [
        topic.name,
        topic.correct.toString(),
        topic.total.toString(),
        `${topic.percentage}%`
      ]);
      
      doc.autoTable({
        startY: topicTableY + 5,
        head: [['Topic', 'Correct', 'Total', 'Percentage']],
        body: topicData,
        theme: 'striped',
        headStyles: { fillColor: [76, 201, 240] }
      });
      
      // Add page number
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.height - 10);
      }
      
      // Save PDF
      doc.save(`Quiz_Report_${reportData.quizTitle.replace(/\s+/g, '_')}_${reportData.studentName}.pdf`);
      
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF report');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const downloadSolutionsPDF = async () => {
    if (!reportData) return;
    
    setDownloadingSolutions(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(138, 43, 226);
      doc.text('QUIZZCO.AI - Quiz Solutions', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Quiz: ${reportData.quizTitle}`, 20, 40);
      doc.text(`Student: ${reportData.studentName}`, 20, 50);
      
      let yPos = 70;
      
      // Questions with solutions
      reportData.questions.forEach((q, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Question ${q.id}:`, 20, yPos);
        
        doc.setFontSize(11);
        const questionLines = doc.splitTextToSize(q.question, pageWidth - 40);
        doc.text(questionLines, 20, yPos + 10);
        
        // Student's answer
        doc.setFontSize(10);
        if (q.studentAnswer) {
          doc.setTextColor(q.isCorrect ? [0, 255, 136] : [255, 107, 107]);
          doc.text(`Your Answer: ${q.studentAnswer} ${q.isCorrect ? '✓' : '✗'}`, 20, yPos + 10 + (questionLines.length * 7));
        } else {
          doc.setTextColor(255, 209, 102);
          doc.text('Skipped', 20, yPos + 10 + (questionLines.length * 7));
        }
        
        // Correct answer
        doc.setTextColor(0, 0, 0);
        doc.text(`Correct Answer: ${q.correctAnswer}`, 20, yPos + 20 + (questionLines.length * 7));
        
        // Solution
        doc.setTextColor(76, 201, 240);
        doc.setFontSize(10);
        const solutionLines = doc.splitTextToSize(`Solution: ${q.solution}`, pageWidth - 40);
        doc.text(solutionLines, 20, yPos + 30 + (questionLines.length * 7));
        
        yPos += 50 + (questionLines.length * 7) + (solutionLines.length * 5);
      });
      
      // Save PDF
      doc.save(`Quiz_Solutions_${reportData.quizTitle.replace(/\s+/g, '_')}.pdf`);
      
    } catch (err) {
      console.error('Error generating solutions PDF:', err);
      alert('Failed to generate solutions PDF');
    } finally {
      setDownloadingSolutions(false);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#00ff88';
    if (percentage >= 60) return '#4cc9f0';
    if (percentage >= 40) return '#ffd166';
    return '#ff6b6b';
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A': return '#00ff88';
      case 'B': return '#4cc9f0';
      case 'C': return '#ffd166';
      case 'D': return '#ffa726';
      case 'F': return '#ff6b6b';
      default: return '#8a2be2';
    }
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="report-loading">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Generating Your Report...</h2>
          <p>Analyzing your performance</p>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="report-error">
        <div className="error-content">
          <div className="error-icon">❌</div>
          <h2>Error Loading Report</h2>
          <p>{error || 'Report data not available'}</p>
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

  return (
    <div className="student-report-container" ref={reportRef}>
      {/* Header */}
      <header className="report-header">
        <div className="header-left">
          <div className="logo-container" onClick={() => navigate('/student/dashboard')}>
            <div className="logo-icon">📊</div>
            <div className="logo-text">
              <div className="primary">QUIZZCO.AI</div>
              <div className="secondary">Performance Report</div>
            </div>
          </div>
        </div>
        
        <div className="header-center">
          <h1 className="report-title">{reportData.quizTitle}</h1>
          <p className="report-subtitle">
            <span className="student-name">{reportData.studentName}</span> • 
            <span className="class-name"> {reportData.className}</span> • 
            <span className="submission-date"> {formatDate(reportData.submittedAt)}</span>
          </p>
        </div>
        
        <div className="header-right">
          <button 
            className="action-btn download-btn"
            onClick={generatePDFReport}
            disabled={downloadingPDF}
          >
            <i className="fas fa-file-pdf"></i> 
            {downloadingPDF ? 'Generating...' : 'Download Report'}
          </button>
          <button 
            className="action-btn solutions-btn"
            onClick={downloadSolutionsPDF}
            disabled={downloadingSolutions}
          >
            <i className="fas fa-download"></i> 
            {downloadingSolutions ? 'Downloading...' : 'Solutions'}
          </button>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="quick-stats-bar">
        <div className="stat-item">
          <div className="stat-value" style={{ color: getScoreColor(reportData.percentage) }}>
            {reportData.percentage}%
          </div>
          <div className="stat-label">Score</div>
        </div>
        
        <div className="stat-divider"></div>
        
        <div className="stat-item">
          <div className="stat-value">{reportData.correctAnswers}/{reportData.totalQuestions}</div>
          <div className="stat-label">Correct</div>
        </div>
        
        <div className="stat-divider"></div>
        
        <div className="stat-item">
          <div className="stat-value" style={{ color: getGradeColor(reportData.grade) }}>
            {reportData.grade}
          </div>
          <div className="stat-label">Grade</div>
        </div>
        
        <div className="stat-divider"></div>
        
        <div className="stat-item">
          <div className="stat-value">{reportData.rank}</div>
          <div className="stat-label">Class Rank</div>
        </div>
        
        <div className="stat-divider"></div>
        
        <div className="stat-item">
          <div className="stat-value">{reportData.timeTaken}</div>
          <div className="stat-label">Time Taken</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="report-content">
        {/* Left Column - Detailed Analysis */}
        <div className="analysis-column">
          {/* Tabs */}
          <div className="analysis-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-chart-bar"></i> Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              <i className="fas fa-question-circle"></i> Question Analysis
            </button>
            <button 
              className={`tab-btn ${activeTab === 'solutions' ? 'active' : ''}`}
              onClick={() => setActiveTab('solutions')}
            >
              <i className="fas fa-lightbulb"></i> Solutions
            </button>
            <button 
              className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              <i className="fas fa-brain"></i> AI Insights
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="overview-content">
                <div className="score-breakdown">
                  <h3><i className="fas fa-pie-chart"></i> Score Breakdown</h3>
                  <div className="breakdown-grid">
                    <div className="breakdown-item correct">
                      <div className="breakdown-header">
                        <span className="breakdown-label">Correct</span>
                        <span className="breakdown-count">{reportData.correctAnswers}</span>
                      </div>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill"
                          style={{ 
                            width: `${(reportData.correctAnswers / reportData.totalQuestions) * 100}%`,
                            backgroundColor: '#00ff88'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="breakdown-item wrong">
                      <div className="breakdown-header">
                        <span className="breakdown-label">Wrong</span>
                        <span className="breakdown-count">{reportData.wrongAnswers}</span>
                      </div>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill"
                          style={{ 
                            width: `${(reportData.wrongAnswers / reportData.totalQuestions) * 100}%`,
                            backgroundColor: '#ff6b6b'
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="breakdown-item skipped">
                      <div className="breakdown-header">
                        <span className="breakdown-label">Skipped</span>
                        <span className="breakdown-count">{reportData.skipped}</span>
                      </div>
                      <div className="breakdown-bar">
                        <div 
                          className="breakdown-fill"
                          style={{ 
                            width: `${(reportData.skipped / reportData.totalQuestions) * 100}%`,
                            backgroundColor: '#ffd166'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topic Performance */}
                <div className="topic-performance">
                  <h3><i className="fas fa-book"></i> Topic-wise Performance</h3>
                  <div className="topic-grid">
                    {reportData.topics.map((topic, index) => (
                      <div key={index} className="topic-card">
                        <div className="topic-header">
                          <span className="topic-name">{topic.name}</span>
                          <span className="topic-percentage" style={{ color: getScoreColor(topic.percentage) }}>
                            {topic.percentage}%
                          </span>
                        </div>
                        <div className="topic-stats">
                          <span className="topic-stat">
                            {topic.correct}/{topic.total} correct
                          </span>
                        </div>
                        <div className="topic-progress">
                          <div 
                            className="topic-progress-fill"
                            style={{ 
                              width: `${topic.percentage}%`,
                              backgroundColor: getScoreColor(topic.percentage)
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question Type Performance */}
                <div className="type-performance">
                  <h3><i className="fas fa-poll"></i> Question Type Analysis</h3>
                  <div className="type-stats">
                    {reportData.questionTypes.map((type, index) => (
                      <div key={index} className="type-item">
                        <div className="type-header">
                          <span className="type-name">{type.type}</span>
                          <span className="type-percentage" style={{ color: getScoreColor(type.percentage) }}>
                            {type.percentage}%
                          </span>
                        </div>
                        <div className="type-progress">
                          <div 
                            className="type-progress-fill"
                            style={{ 
                              width: `${type.percentage}%`,
                              backgroundColor: getScoreColor(type.percentage)
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Question Analysis Tab */}
            {activeTab === 'questions' && (
              <div className="questions-analysis">
                <h3><i className="fas fa-list-ol"></i> Question-wise Analysis</h3>
                <div className="questions-grid">
                  {reportData.questions.map((question, index) => (
                    <div 
                      key={question.id}
                      className={`question-summary ${question.isCorrect ? 'correct' : question.studentAnswer ? 'wrong' : 'skipped'}`}
                      onClick={() => {
                        setSelectedQuestion(index);
                        setActiveTab('solutions');
                      }}
                    >
                      <div className="question-number">Q{question.id}</div>
                      <div className="question-status">
                        <span className="status-icon">
                          {question.isCorrect ? '✓' : question.studentAnswer ? '✗' : '○'}
                        </span>
                        <span className="status-text">
                          {question.isCorrect ? 'Correct' : question.studentAnswer ? 'Wrong' : 'Skipped'}
                        </span>
                      </div>
                      <div className="question-topic">
                        <span className="topic-badge">{question.topic}</span>
                        <span className="difficulty-badge">{question.difficulty}</span>
                      </div>
                      <div className="question-marks">
                        {question.awardedMarks}/{question.marks} marks
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Solutions Tab */}
            {activeTab === 'solutions' && (
              <div className="solutions-content">
                <div className="solution-navigation">
                  <button 
                    className="nav-btn prev"
                    onClick={() => setSelectedQuestion(prev => Math.max(0, prev - 1))}
                    disabled={selectedQuestion === 0}
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                  
                  <div className="current-question">
                    Question {selectedQuestion + 1} of {reportData.questions.length}
                  </div>
                  
                  <button 
                    className="nav-btn next"
                    onClick={() => setSelectedQuestion(prev => Math.min(reportData.questions.length - 1, prev + 1))}
                    disabled={selectedQuestion === reportData.questions.length - 1}
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                </div>

                {reportData.questions[selectedQuestion] && (
                  <div className="question-solution">
                    <div className="question-header">
                      <h4>Question {reportData.questions[selectedQuestion].id}</h4>
                      <div className="question-meta">
                        <span className="meta-topic">{reportData.questions[selectedQuestion].topic}</span>
                        <span className="meta-difficulty">{reportData.questions[selectedQuestion].difficulty}</span>
                        <span className="meta-type">{reportData.questions[selectedQuestion].type}</span>
                      </div>
                    </div>
                    
                    <div className="question-text">
                      {reportData.questions[selectedQuestion].question}
                    </div>
                    
                    <div className="answer-comparison">
                      <div className="student-answer">
                        <h5><i className="fas fa-user"></i> Your Answer</h5>
                        <div className={`answer-box ${reportData.questions[selectedQuestion].isCorrect ? 'correct' : 'wrong'}`}>
                          {reportData.questions[selectedQuestion].studentAnswer || 'Skipped'}
                          {reportData.questions[selectedQuestion].studentAnswer && (
                            <span className="answer-icon">
                              {reportData.questions[selectedQuestion].isCorrect ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="correct-answer">
                        <h5><i className="fas fa-check-circle"></i> Correct Answer</h5>
                        <div className="answer-box correct">
                          {reportData.questions[selectedQuestion].correctAnswer}
                          <span className="answer-icon">✓</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="solution-explanation">
                      <h5><i className="fas fa-lightbulb"></i> Solution</h5>
                      <p>{reportData.questions[selectedQuestion].solution}</p>
                      
                      <h5><i className="fas fa-info-circle"></i> Explanation</h5>
                      <p>{reportData.questions[selectedQuestion].explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <div className="insights-content">
                <div className="ai-assessment">
                  <h3><i className="fas fa-robot"></i> AI-Powered Assessment</h3>
                  <div className="assessment-text">
                    {reportData.aiInsights.overallAssessment}
                  </div>
                </div>

                <div className="strengths-weaknesses">
                  <div className="strengths-section">
                    <h4><i className="fas fa-trophy"></i> Your Strengths</h4>
                    <ul className="strengths-list">
                      {reportData.aiInsights.strengths.map((strength, index) => (
                        <li key={index}>
                          <i className="fas fa-check-circle"></i> {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="weaknesses-section">
                    <h4><i className="fas fa-exclamation-triangle"></i> Areas for Improvement</h4>
                    <ul className="weaknesses-list">
                      {reportData.aiInsights.weaknesses.map((weakness, index) => (
                        <li key={index}>
                          <i className="fas fa-exclamation-circle"></i> {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="recommendations">
                  <h4><i className="fas fa-graduation-cap"></i> Personalized Recommendations</h4>
                  <div className="recommendations-grid">
                    {reportData.aiInsights.recommendations.map((rec, index) => (
                      <div key={index} className="recommendation-card">
                        <div className="rec-number">{index + 1}</div>
                        <div className="rec-text">{rec}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="class-comparison">
                  <h4><i className="fas fa-chart-line"></i> Class Comparison</h4>
                  <div className="comparison-stats">
                    <div className="comparison-item">
                      <div className="comparison-label">Your Score</div>
                      <div className="comparison-value" style={{ color: getScoreColor(reportData.percentage) }}>
                        {reportData.percentage}%
                      </div>
                    </div>
                    
                    <div className="comparison-item">
                      <div className="comparison-label">Class Average</div>
                      <div className="comparison-value">
                        {reportData.classStats.averageScore}%
                      </div>
                    </div>
                    
                    <div className="comparison-item">
                      <div className="comparison-label">Highest Score</div>
                      <div className="comparison-value">
                        {reportData.classStats.highestScore}%
                      </div>
                    </div>
                    
                    <div className="comparison-item">
                      <div className="comparison-label">Your Percentile</div>
                      <div className="comparison-value">
                        Top {reportData.classStats.yourPercentile}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className="summary-column">
          {/* Performance Card */}
          <div className="performance-card">
            <div className="performance-header">
              <h3>Performance Summary</h3>
              <div className="performance-grade" style={{ color: getGradeColor(reportData.grade) }}>
                {reportData.grade}
              </div>
            </div>
            
            <div className="performance-metrics">
              <div className="metric">
                <div className="metric-label">Overall Score</div>
                <div className="metric-value" style={{ color: getScoreColor(reportData.percentage) }}>
                  {reportData.percentage}%
                </div>
              </div>
              
              <div className="metric">
                <div className="metric-label">Correct Answers</div>
                <div className="metric-value">
                  {reportData.correctAnswers}/{reportData.totalQuestions}
                </div>
              </div>
              
              <div className="metric">
                <div className="metric-label">Accuracy Rate</div>
                <div className="metric-value">
                  {Math.round((reportData.correctAnswers / reportData.attempted) * 100)}%
                </div>
              </div>
              
              <div className="metric">
                <div className="metric-label">Time Efficiency</div>
                <div className="metric-value">
                  {Math.round(reportData.correctAnswers / (parseInt(reportData.timeTaken) / 60))}/min
                </div>
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="improvement-card">
            <h3><i className="fas fa-chart-line"></i> Quick Improvement Tips</h3>
            <ul className="improvement-list">
              <li>
                <i className="fas fa-bullseye"></i>
                <span>Focus on {reportData.topics.sort((a, b) => a.percentage - b.percentage)[0]?.name} topics</span>
              </li>
              <li>
                <i className="fas fa-clock"></i>
                <span>Improve time management for complex problems</span>
              </li>
              <li>
                <i className="fas fa-book"></i>
                <span>Review {reportData.questionTypes.sort((a, b) => a.percentage - b.percentage)[0]?.type} questions</span>
              </li>
              <li>
                <i className="fas fa-redo"></i>
                <span>Retake similar quiz for practice</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="action-card">
            <h3><i className="fas fa-rocket"></i> Next Steps</h3>
            <div className="action-buttons">
              <button 
                className="action-btn retake-btn"
                onClick={() => navigate(`/attend/${quizId}`)}
              >
                <i className="fas fa-redo"></i> Retake Quiz
              </button>
              <button 
                className="action-btn practice-btn"
                onClick={() => navigate('/student/dashboard')}
              >
                <i className="fas fa-dumbbell"></i> More Practice
              </button>
              <button 
                className="action-btn share-btn"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Report link copied to clipboard!');
                }}
              >
                <i className="fas fa-share"></i> Share Report
              </button>
            </div>
          </div>

          {/* Performance Chart Preview */}
          <div className="chart-card">
            <h3><i className="fas fa-chart-pie"></i> Performance Overview</h3>
            <div className="chart-preview">
              <div className="chart-sections">
                <div 
                  className="chart-section correct"
                  style={{ flex: reportData.correctAnswers }}
                  title={`Correct: ${reportData.correctAnswers}`}
                ></div>
                <div 
                  className="chart-section wrong"
                  style={{ flex: reportData.wrongAnswers }}
                  title={`Wrong: ${reportData.wrongAnswers}`}
                ></div>
                <div 
                  className="chart-section skipped"
                  style={{ flex: reportData.skipped }}
                  title={`Skipped: ${reportData.skipped}`}
                ></div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color correct"></div>
                  <span>Correct ({reportData.correctAnswers})</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color wrong"></div>
                  <span>Wrong ({reportData.wrongAnswers})</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color skipped"></div>
                  <span>Skipped ({reportData.skipped})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="report-footer">
        <div className="footer-content">
          <p className="footer-text">
            <i className="fas fa-info-circle"></i> 
            This report was generated on {formatDate(reportData.submittedAt)}. 
            For detailed analysis and personalized learning paths, visit your dashboard.
          </p>
          <div className="footer-links">
            <button onClick={() => navigate('/student/dashboard')}>
              <i className="fas fa-home"></i> Dashboard
            </button>
            <button onClick={() => window.print()}>
              <i className="fas fa-print"></i> Print Report
            </button>
            <button onClick={() => navigate('/student/dashboard')}>
              <i className="fas fa-question-circle"></i> Help
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentReport;

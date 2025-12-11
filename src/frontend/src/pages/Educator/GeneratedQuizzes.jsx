import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaTimes, 
  FaBroadcastTower, 
  FaEdit, 
  FaTrash, 
  FaSave,
  FaCheckCircle 
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const GeneratedQuizzes = () => {
  const [quizes, setQuizes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate  = useNavigate();
  // --- Backend Fetch ---
  const fetchQuizes = async () => {
    const eduInfo = sessionStorage.getItem('edu_info');
    if (!eduInfo) {
        setLoading(false);
        return;
    }
    const { token } = JSON.parse(eduInfo);

    try {
      const response = await axios.get("http://localhost:5000/api/quizzes/getUserQuizes", {
        headers: { Authorization: token },
      });
      setQuizes(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizes();
  }, []);

  // --- Handlers ---

  const handleOpenDetail = (quiz) => {
    setSelectedQuiz(quiz);
    // TODO: BACKEND CONNECTION - FETCH SINGLE QUIZ DETAILS
    // If you need fresh data (e.g., questions aren't in the list view):
    // const response = await axios.get(`.../api/quizzes/${quiz._id}`);
    // setSelectedQuiz(response.data);
  };

  const handleHostLive = (e, quizId) => {
    e.stopPropagation(); // Prevents the card click (modal) from triggering
    // TODO: BACKEND CONNECTION - HOST LIVE
    // Logic to start the socket.io room or generate a game code
    navigate(`/educator/live-quiz/${quizId}`);
    
    console.log(`Hosting Quiz Live: ${quizId}`);
  };

  const handleEdit = () => {
    // TODO: BACKEND CONNECTION - EDIT
    console.log("Edit Mode Triggered", selectedQuiz._id);
  };

  const handleDelete = () => {
    // TODO: BACKEND CONNECTION - DELETE
    console.log("Delete Triggered", selectedQuiz._id);
  };

  const handleSave = () => {
     // TODO: BACKEND CONNECTION - SAVE CHANGES
     console.log("Save Changes Triggered", selectedQuiz._id);
     setSelectedQuiz(null); // Close modal after save
  };

  // --- Formatting ---
  const formatDate = (dateString) => {
    if(!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    // MAIN CONTAINER: Very Dark Violet Theme
    <div className="min-h-screen bg-[#0D0B14] text-gray-200 p-8 font-sans">
      
      {/* Header */}
      <div className="mb-10 border-b border-violet-900/30 pb-4">
        <h2 className="text-3xl font-light tracking-wide text-violet-100">
          Quiz Library
        </h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-violet-400 animate-pulse">
          Loading Library...
        </div>
      ) : (
        // GRID LAYOUT
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {quizes.length > 0 ? (
            quizes.map((quiz) => (
              <div 
                key={quiz._id} 
                onClick={() => handleOpenDetail(quiz)}
                className="group relative bg-[#15121F] rounded-xl border border-violet-900/20 p-6 cursor-pointer hover:border-violet-500/50 hover:bg-[#1A1625] transition-all duration-300 shadow-lg shadow-black/40"
              >
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    quiz.status === 'Published' 
                    ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' 
                    : 'bg-orange-900/30 text-orange-400 border border-orange-800'
                }`}>
                  {quiz.status || 'Draft'}
                </div>

                <h3 className="text-xl font-medium text-white mb-4 pr-16 truncate">
                  {quiz.title}
                </h3>

                {/* Meta Info */}
                <div className="flex flex-col gap-2 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                        <FaClock className="text-violet-500" /> {quiz.time}
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-violet-500" /> {formatDate(quiz.date)}
                    </div>
                </div>

                {/* Host Button (Stops propagation) */}
                <button 
                    onClick={(e) => handleHostLive(e, quiz._id)}
                    className="w-full mt-auto flex items-center justify-center gap-2 bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg font-medium transition-colors shadow-lg shadow-violet-900/20"
                >
                    <FaBroadcastTower /> Host Live
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center py-10">No quizzes found.</p>
          )}
        </div>
      )}

      {/* --- POPUP MODAL (Overlay) --- */}
      {selectedQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          
          {/* Modal Content */}
          <div className="bg-[#15121F] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-violet-900/30 shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-violet-900/20 bg-[#1A1625]">
                <div>
                    <h2 className="text-2xl font-semibold text-white">{selectedQuiz.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        {selectedQuiz.questions?.length || 0} Questions • {selectedQuiz.time}
                    </p>
                </div>
                <button 
                    onClick={() => setSelectedQuiz(null)}
                    className="text-gray-500 hover:text-white transition-colors text-xl"
                >
                    <FaTimes />
                </button>
            </div>

            {/* Scrollable Questions Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {selectedQuiz.questions && selectedQuiz.questions.map((q, index) => (
                    <div key={index} className="bg-[#0D0B14] p-5 rounded-xl border border-violet-900/10">
                        
                        {/* Question Text */}
                        <div className="flex gap-3 mb-4">
                            <span className="text-violet-500 font-bold text-lg">Q{index + 1}.</span>
                            <p className="text-gray-200 text-lg leading-relaxed">{q.question}</p>
                        </div>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 ml-8">
                            {q.options.map((opt, i) => (
                                <div key={i} className="bg-[#1E1B2E] px-4 py-3 rounded-lg border border-gray-800 text-gray-400 text-sm">
                                    <span className="font-semibold text-violet-400 mr-2">
                                        {String.fromCharCode(65 + i)}.
                                    </span>
                                    {opt}
                                </div>
                            ))}
                        </div>

                        {/* Correct Answer Section */}
                        <div className="ml-8 mt-2 p-3 bg-emerald-900/10 border border-emerald-900/30 rounded-lg flex items-start gap-2">
                            <FaCheckCircle className="text-emerald-500 mt-1 shrink-0" />
                            <div>
                                <span className="text-emerald-500 font-bold text-sm block">Correct Answer:</span>
                                <span className="text-emerald-100 text-sm">
                                    {q.correctAnswer} (Option {q.correctAnswerOption})
                                </span>
                                {q.explantion && (
                                    <p className="text-gray-500 text-xs mt-1 italic border-t border-emerald-900/30 pt-1">
                                        Note: {q.explantion}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Footer (Actions) */}
            <div className="p-5 border-t border-violet-900/20 bg-[#1A1625] flex justify-end gap-3">
                <button 
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors"
                >
                    <FaTrash size={14} /> Delete
                </button>
                <button 
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                    <FaEdit size={14} /> Edit
                </button>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-colors"
                >
                    <FaSave size={14} /> Save
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default GeneratedQuizzes;
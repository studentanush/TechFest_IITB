import React, { useEffect, useState } from "react";
import { playerSocket } from "../socket";
import { useContext } from "react";
import { ContextAPI } from "../Context";

const Player = () => {
//   const [players, setPlayers] = useState([]);
//   const [leaderBoardData, setLeaderBoardData] = useState([]);    
  const [questionDetails, setQuestionDetails] = useState({});
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [join, setJoin] = useState(false);
  //const [play, setPlay] = useState(false);

  const {players,leaderBoardData,play} = useContext(ContextAPI);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [timer, setTimer] = useState(0);

  useEffect(() => {


    // playerSocket.on("updatePlayers", (players) => setPlayers(players));

    // playerSocket.on("leaderboardUpdate", (details) =>
    //   setLeaderBoardData(details)
    // );



    playerSocket.on("newQuestion", (details) => {
      setQuestionDetails(details);
      setSelectedAnswer(null);
      setTimer(details.timeLimit || 15);

      let t = details.timeLimit || 15;
      const intv = setInterval(() => {
        t -= 1;
        setTimer(t);

        if (t <= 0) clearInterval(intv);
      }, 1000);

      return () => clearInterval(intv);
    });

    // playerSocket.on("quizStarted", () => {
    //   setPlay(true);
    // });

    return () => {
      //playerSocket.off("updatePlayers");
      playerSocket.off("newQuestion");
      //playerSocket.off("leaderboardUpdate");
      //playerSocket.off("quizStarted");
    };
  }, []);

  // Join Room
  const joinRoom = (e) => {
    e.preventDefault();

    if (!playerName || !roomCode) return alert("Enter all fields");

    playerSocket.emit("joinRoom", { roomCode, playerName }, (response) => {
      if (response.success) setJoin(true);
      if (response.error) alert(response.error);
    });
  };

  // Submit Answer
  const submitAnswer = () => {
    if (!selectedAnswer) return alert("Choose an answer");

    const totalTime = questionDetails.timeLimit;
    const used = totalTime - timer;

    playerSocket.emit("submitAnswer", {
      roomCode,
      answer: selectedAnswer,
      correctAnswer: questionDetails.correctAnswer,
      timeTaken: used,
      totalTime,
    },(res)=>{
        console.log(res);
    });

    setSelectedAnswer("Submitted");
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-gray-100 p-4">

      {/* ==================== BEFORE QUIZ START ==================== */}
      {!play && (
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">

          {!join && (
            <form onSubmit={joinRoom} className="flex flex-col gap-3">
              <input
                className="border p-2 rounded"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />

              <input
                className="border p-2 rounded"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />

              <button className="bg-blue-600 text-white p-2 rounded">
                Join Room
              </button>
            </form>
          )}

          {join && (
            <div className="text-center">
              <h2 className="font-bold text-lg mb-2">Waiting for host…</h2>
              <p className="text-gray-700 mb-2">Players joined:</p>

              <div className="bg-gray-200 rounded p-2">
                {players.map((p, idx) => (
                  <div key={idx} className="text-sm py-1">
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== QUIZ SCREEN ==================== */}
      {play && questionDetails?.question && (
        <div className="bg-white w-full max-w-xl p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">{questionDetails.question}</h2>

          {/* TIMER */}
          <div className="text-right text-lg font-semibold text-red-600 mb-4">
            Time: {timer}s
          </div>

          {/* OPTIONS */}
          <div className="flex flex-col gap-3">
            {questionDetails.options?.map((opt, index) => (
              <button
                key={index}
                className={`p-3 rounded border text-left ${
                  selectedAnswer === opt
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100"
                }`}
                onClick={() => selectedAnswer !== "Submitted" && setSelectedAnswer(opt?opt:"")}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* SUBMIT */}
          <button
            onClick={submitAnswer}
            disabled={selectedAnswer === "Submitted"}
            className={`w-full mt-4 p-3 rounded text-white ${
              selectedAnswer === "Submitted"
                ? "bg-gray-400"
                : "bg-green-600"
            }`}
          >
            {selectedAnswer === "Submitted" ? "Submitted" : "Submit Answer"}
          </button>
        </div>
      )}

      {/* ==================== LEADERBOARD ==================== */}
      {play && !questionDetails?.question && leaderBoardData.length > 0 && (
        <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg">
          <h2 className="font-bold text-2xl mb-4 text-center">
            Leaderboard
          </h2>

          {leaderBoardData.map((p, i) => (
            <div
              key={i}
              className="flex justify-between p-2 border-b text-gray-800"
            >
              <span>{p.name}</span>
              <span className="font-bold">{p.points} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Player;

import { createContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { allQuestions } from "./pages/Admin";
import { playerSocket } from "./socket";

// we for now using ContextAPI for state management later we can upgrade it to redux(i dont think we need too )
// bcoz it is used for larger apps which has to do with lot of state variables

export const ContextAPI = createContext();
const Context = (props) => {
    const [play, setPlay] = useState(false);

    //const [quizTime, setQuizTime] = useState("");
    const [allQuestionsDetail,setAllQuestionDetail] = useState(allQuestions);
    const [players, setPlayers] = useState([]);
    const [leaderBoardData, setLeaderBoardData] = useState([]);
    useEffect(() => {
        playerSocket.on("updatePlayers", (players) => setPlayers(players));

        playerSocket.on("leaderboardUpdate", (details) =>
            setLeaderBoardData(details)
        );

        return () => {
            playerSocket.off("updatePlayers");

            playerSocket.off("leaderboardUpdate");

        };
    }, [])

    return (

        <ContextAPI.Provider value={{
            play,
            players,
            leaderBoardData,
            setPlay,
        }}>
            {props.children}
        </ContextAPI.Provider>

    )
}

export default Context
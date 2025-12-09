import { createContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';

import { playerSocket } from "./socket";
const allQuestions = [

    {
        qno: 2,
        question: "Which HTML tag is used to define an unordered list?",
        options: ["<ol>", "<ul>", "<li>", "<list>"],
        correctIndex: 1,
        explanation: "<ul> defines an unordered list; <ol> is ordered and <li> is a list item."
    },
    {
        qno: 3,
        question: "What is the value of 2 + '2' in JavaScript?",
        options: ["4", "'22'", "NaN", "undefined"],
        correctIndex: 1,
        explanation: "When adding a number and a string, JavaScript coerces the number to string and concatenates, resulting in '22'."
    },
    {
        qno: 4,
        question: "Which data structure uses FIFO (First In First Out)?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        correctIndex: 1,
        explanation: "A Queue follows FIFO order: the first element added is the first removed."
    },
    {
        qno: 5,
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Cascading Simple Sheets"],
        correctIndex: 1,
        explanation: "CSS stands for Cascading Style Sheets, used for styling HTML."
    },
    {
        qno: 6,
        question: "Which HTTP status code means 'Not Found'?",
        options: ["200", "301", "404", "500"],
        correctIndex: 2,
        explanation: "404 is the standard HTTP response code indicating the requested resource was not found."
    },
    {
        qno: 7,
        question: "What is the derivative of x^2?",
        options: ["2x", "x", "x^2", "1"],
        correctIndex: 0,
        explanation: "Using basic differentiation, d/dx(x^2) = 2x."
    },
    {
        qno: 8,
        question: "Which keyword is used to create an immutable variable in JavaScript?",
        options: ["var", "let", "const", "immutable"],
        correctIndex: 2,
        explanation: "const declares a variable whose binding cannot be reassigned (immutable reference)."
    },
    {
        qno: 9,
        question: "In Git, which command creates a new branch?",
        options: ["git checkout -b <name>", "git push origin <name>", "git merge <name>", "git init <name>"],
        correctIndex: 0,
        explanation: "git checkout -b <name> creates and switches to a new branch in a single step. (Alternatively git branch <name> then checkout.)"
    },
    {
        qno: 10,
        question: "Which algorithmic time complexity is better (faster) for large n?",
        options: ["O(n^2)", "O(n log n)", "O(2^n)", "O(n!)"],
        correctIndex: 1,
        explanation: "O(n log n) grows much slower than O(n^2), O(2^n), or O(n!), so it's better for large inputs."
    }

];
// we for now using ContextAPI for state management later we can upgrade it to redux(i dont think we need too )
// bcoz it is used for larger apps which has to do with lot of state variables

export const ContextAPI = createContext();
const Context = (props) => {
   const [userData,setUserData] = useState({});

   useEffect(()=>{
    console.log("heher in context")
        const userDetails = localStorage.getItem('user_info');
        if(userData){
            const parseData = JSON.parse(userDetails);
            console.log(parseData)
            setUserData(parseData);
        }
     
   },[])
   const logout = () => {
        setUserData(null);
        localStorage.removeItem('user_info');
       
    };
    return (

        <ContextAPI.Provider value={{
          userData,
          setUserData,
          logout
            
        }}>
            {props.children}
        </ContextAPI.Provider>

    )
}

export default Context
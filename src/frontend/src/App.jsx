import { useState } from 'react'

import './App.css'
import { Route, Routes } from 'react-router-dom'
import Player from './pages/Player'
import Admin from './pages/Admin'
import EducatorDashboard from './pages/Educator/Dashboard'
import LiveQuiz from './pages/Educator/LiveQuiz'
import GeneratedQuizzes from './pages/Educator/GeneratedQuizzes'
import Chat from './pages/Educator/chat'
import AttendQuiz from './pages/Student/AttendQuiz'
import LandingPage from './pages/Landing/LandingPage'
import Login from './pages/Auth/login'
import Register from './pages/Auth/Register'
import StudentDashboard from './pages/Student/StudentDashboard'
import Reports from './pages/Educator/Reports'


function App() {
  

  return (
    <>

      <Routes>
        
        <Route path="/educator/dashboard" element = {<EducatorDashboard/>}></Route> 
        <Route path="/educator/live-quiz" element = {<LiveQuiz/>}></Route> 
        <Route path="/generatedQuiz" element = {<GeneratedQuizzes/>}></Route> 
        <Route path="/educator/chat" element = {<Chat/>}></Route> 
        <Route path="/attend-quiz" element = {<AttendQuiz/>}></Route> 
        <Route path="/" element = {<LandingPage/>}></Route> 
        <Route path="/login" element = {<Login/>}></Route> 
        <Route path="/register" element = {<Register/>}></Route> 
        <Route path="/student/dashboard" element = {<StudentDashboard/>}></Route> 
        <Route path="/educator/reports" element = {<Reports/>}></Route> 
       
      </Routes>
    </>
  ) 
}

export default App

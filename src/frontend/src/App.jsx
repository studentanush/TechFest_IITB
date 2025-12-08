import { useState } from 'react'

import './App.css'
import { Route, Routes } from 'react-router-dom'
import Player from './pages/Player'
import Admin from './pages/Admin'

function App() {
  

  return (
    <>

      <Routes>
        
        <Route path = "/player" element = {<Player/>}></Route>
        <Route path="/admin" element = {<Admin/>}></Route>
        <Route></Route> 
      </Routes>
    </>
  )
}

export default App

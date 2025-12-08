import React from 'react'
import ReactDOM from 'react-dom/client'
import './q.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import Context from './Context'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Context>
           <App />

      </Context>
    
    </BrowserRouter>
   
  </React.StrictMode>,
)

import React, { useEffect, useState } from 'react'
import '../q.css'

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose?.(), 300)
    }, duration)
    
    return () => clearTimeout(timer)
  }, [duration, onClose])
  
  const getIcon = () => {
    switch(type) {
      case 'success': return 'fa-check-circle'
      case 'error': return 'fa-exclamation-circle'
      case 'info': return 'fa-info-circle'
      default: return 'fa-info-circle'
    }
  }
  
  if (!isVisible) return null
  
  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <i className={`fas ${getIcon()}`}></i>
        <span>{message}</span>
      </div>
      <button className="toast-close" onClick={() => setIsVisible(false)}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  )
}

export default Toast

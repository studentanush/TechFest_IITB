import { useEffect, useRef, useState } from 'react'

// Hook for scroll animations
export const useScrollAnimation = () => {
  const elementRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [])

  return [elementRef, isVisible]
}

// Hook for animated counters
export const useCounter = (target) => {
  const [count, setCount] = useState(0)
  const elementRef = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const duration = 2000
            const frameDuration = 1000 / 60
            const totalFrames = Math.round(duration / frameDuration)
            const easeOut = (t) => t * (2 - t)
            
            let frame = 0
            
            const counterInterval = setInterval(() => {
              frame++
              const progress = frame / totalFrames
              const easedProgress = easeOut(progress)
              const currentValue = Math.round(target * easedProgress)
              
              setCount(currentValue)
              
              if (frame === totalFrames) {
                clearInterval(counterInterval)
                setCount(target)
              }
            }, frameDuration)
            
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.5 }
    )
    
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }
    
    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [target])
  
  return [count, elementRef]
}

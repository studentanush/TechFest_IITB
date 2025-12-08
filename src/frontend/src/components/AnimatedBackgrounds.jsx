import React from 'react';
import './AnimatedBackgrounds.css';

const AnimatedBackgrounds = () => {
  return (
    <div className="educational-background">
      {/* Subtle geometric pattern */}
      <div className="geometric-pattern">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>
      
      {/* Knowledge flow lines */}
      <div className="knowledge-flow">
        <div className="flow-line line-1"></div>
        <div className="flow-line line-2"></div>
        <div className="flow-line line-3"></div>
        <div className="flow-line line-4"></div>
      </div>
      
      {/* Subtle academic icons */}
      <div className="academic-icons">
        <div className="icon icon-1">📚</div>
        <div className="icon icon-2">✏️</div>
        <div className="icon icon-3">🎓</div>
        <div className="icon icon-4">📝</div>
        <div className="icon icon-5">🔍</div>
      </div>
    </div>
  );
};

export default AnimatedBackgrounds;

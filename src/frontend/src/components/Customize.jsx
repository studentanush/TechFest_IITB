import React from 'react'

const Customize = () => {
  return (
    <section className="section section-3" id="section3">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title custom-heading-size">
            <span className="text-highlight">Customized</span> Questions
          </h2>
         {/* <p className="section-description custom-text-width">
            Tailor quizzes to your exact requirements. Choose question formats, 
            difficulty levels, and customize every aspect of your assessment.
          </p>*/}
        </div>
        
        {/* Rest of your boxes remain exactly the same */}
        <div className="customization-grid">
          <div className="customization-card scale-in" data-delay="100">
            <div className="card-icon-large">
              <i className="fas fa-sliders-h"></i>
            </div>
            <h3>Difficulty Control</h3>
            <p>Adjust from beginner to expert levels with precision</p>
            <div className="slider-demo">
              <div className="slider-track">
                <div className="slider-fill" style={{width: '70%'}}></div>
                <div className="slider-handle"></div>
              </div>
              <div className="slider-labels">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
          
          <div className="customization-card scale-in" data-delay="200">
            <div className="card-icon-large">
              <i className="fas fa-shapes"></i>
            </div>
            <h3>Multiple Formats</h3>
            <p>MCQ, True/False, Voice, and more question types</p>
            <div className="format-icons">
              <span className="format-icon"><i className="fas fa-check-circle"></i> MCQ</span>
              <span className="format-icon"><i className="fas fa-times-circle"></i> True/False</span>
              <span className="format-icon"><i className="fas fa-microphone"></i> Voice</span>
              <span className="format-icon"><i className="fas fa-keyboard"></i> Text</span>
            </div>
          </div>
          
          <div className="customization-card scale-in" data-delay="300">
            <div className="card-icon-large">
              <i className="fas fa-edit"></i>
            </div>
            <h3>Easy Editing</h3>
            <p>Modify questions anytime with our intuitive editor</p>
            <div className="editor-preview">
              <div className="editor-line"></div>
              <div className="editor-line"></div>
              <div className="editor-line short"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Customize

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  useEffect(() => {
    // Create stars for the background
    const createStars = () => {
      const starsContainer = document.querySelector('.stars-container');
      if (starsContainer) {
        starsContainer.innerHTML = '';
        const count = window.innerWidth < 768 ? 50 : 100;
        
        for (let i = 0; i < count; i++) {
          const star = document.createElement('div');
          star.classList.add('star');
          star.style.top = `${Math.random() * 100}%`;
          star.style.left = `${Math.random() * 100}%`;
          star.style.animationDuration = `${Math.random() * 3 + 2}s`;
          star.style.animationDelay = `${Math.random() * 2}s`;
          starsContainer.appendChild(star);
        }
      }
    };

    createStars();
    window.addEventListener('resize', createStars);
    
    return () => {
      window.removeEventListener('resize', createStars);
    };
  }, []);

  return (
    <div className="landing-page">
      <div className="stars-container"></div>
      <div className="animated-gradient"></div>
      
      <motion.div 
        className="landing-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="landing-header">
          <motion.div 
            className="logo-container"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <div className="logo-icon">
              <div className="weather-icon-sun"></div>
              <div className="weather-icon-cloud"></div>
            </div>
            <motion.h1 
              className="landing-title"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              WeatherPro
            </motion.h1>
          </motion.div>
          
          <motion.p 
            className="landing-tagline"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Your intelligent weather companion for smarter planning
          </motion.p>
        </div>
        
        <motion.div 
          className="feature-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, staggerChildren: 0.1 }}
        >
          <motion.div 
            className="feature-item"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Smart Trip Planning</h3>
            <p>Plan your activities with weather-intelligent recommendations</p>
          </motion.div>
          
          <motion.div 
            className="feature-item"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <h3>Hourly Insights</h3>
            <p>Track detailed weather patterns throughout your day</p>
          </motion.div>
          
          <motion.div 
            className="feature-item"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3>City Comparison</h3>
            <p>Compare weather across multiple locations</p>
          </motion.div>
          
          <motion.div 
            className="feature-item"
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3>Real-time Updates</h3>
            <p>Stay informed with live weather data</p>
          </motion.div>
        </motion.div>

        <motion.div 
          className="cta-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button 
            className="get-started-btn"
            onClick={onGetStarted}
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(37, 117, 252, 0.6)" }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Get Started</span>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </motion.button>
          
          <div className="scroll-indicator">
            <p>Scroll to explore</p>
            <div className="scroll-arrow">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <div className="floating-elements">
        <div className="floating-cloud cloud-1"></div>
        <div className="floating-cloud cloud-2"></div>
        <div className="floating-cloud cloud-3"></div>
        <div className="floating-particle particle-1"></div>
        <div className="floating-particle particle-2"></div>
        <div className="floating-particle particle-3"></div>
      </div>
    </div>
  );
};

export default LandingPage; 
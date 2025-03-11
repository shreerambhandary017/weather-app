import React from 'react';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  return (
    <motion.div 
      className="landing-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="landing-content">
        <motion.h1 
          className="landing-title"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          WeatherPro
        </motion.h1>
        
        <motion.p 
          className="landing-tagline"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your intelligent weather companion for smarter planning
        </motion.p>
        
        <motion.div 
          className="feature-grid"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="feature-item">
            <i className="fas fa-map-marked-alt"></i>
            <h3>Smart Trip Planning</h3>
            <p>Plan your activities with weather-intelligent recommendations</p>
          </div>
          <div className="feature-item">
            <i className="fas fa-chart-line"></i>
            <h3>Hourly Insights</h3>
            <p>Track detailed weather patterns throughout your day</p>
          </div>
          <div className="feature-item">
            <i className="fas fa-city"></i>
            <h3>City Comparison</h3>
            <p>Compare weather across multiple locations</p>
          </div>
          <div className="feature-item">
            <i className="fas fa-clock"></i>
            <h3>Real-time Updates</h3>
            <p>Stay informed with live weather data</p>
          </div>
        </motion.div>

        <motion.button 
          className="get-started-btn"
          onClick={onGetStarted}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Get Started
          <i className="fas fa-arrow-right"></i>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LandingPage; 
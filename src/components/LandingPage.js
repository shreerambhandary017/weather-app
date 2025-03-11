import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check if user prefers reduced motion
    const checkReducedMotion = () => {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    
    checkMobile();
    checkReducedMotion();
    
    window.addEventListener('resize', checkMobile);
    
    // Create stars for the background - optimized for device capabilities
    const createStars = () => {
      const starsContainer = document.querySelector('.stars-container');
      if (starsContainer) {
        starsContainer.innerHTML = '';
        
        // Adjust star count based on device and preferences
        let count = 100;
        if (prefersReducedMotion) {
          count = 20; // Minimal stars for reduced motion
        } else if (isMobile) {
          count = 40; // Fewer stars for mobile
        } else if (window.innerWidth <= 992) {
          count = 60; // Medium amount for tablets
        }
        
        for (let i = 0; i < count; i++) {
          const star = document.createElement('div');
          star.classList.add('star');
          star.style.top = `${Math.random() * 100}%`;
          star.style.left = `${Math.random() * 100}%`;
          
          // Optimize animation duration for performance
          if (!prefersReducedMotion) {
            star.style.animationDuration = `${Math.random() * 3 + 2}s`;
            star.style.animationDelay = `${Math.random() * 2}s`;
          }
          
          starsContainer.appendChild(star);
        }
      }
    };

    createStars();
    window.addEventListener('resize', createStars);
    
    // Listen for changes in reduced motion preference
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionMediaQuery.addEventListener('change', () => {
      checkReducedMotion();
      createStars();
    });
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', createStars);
      motionMediaQuery.removeEventListener('change', checkReducedMotion);
    };
  }, [isMobile, prefersReducedMotion]);

  // Optimize animations based on device capabilities
  const getAnimationProps = (delay = 0) => {
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        transition: { duration: 0 }
      };
    }
    
    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { 
        delay: delay,
        duration: isMobile ? 0.5 : 0.8
      }
    };
  };

  return (
    <div className="landing-page">
      <div className="stars-container"></div>
      <div className={`animated-gradient ${prefersReducedMotion ? 'reduced-motion' : ''}`}></div>
      
      <motion.div 
        className="landing-content"
        {...getAnimationProps()}
      >
        <div className="landing-header">
          <motion.div 
            className="logo-container"
            initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: 0.2, 
              type: "spring", 
              stiffness: prefersReducedMotion ? 50 : 100,
              duration: prefersReducedMotion ? 0.3 : undefined
            }}
          >
            <div className={`logo-icon ${prefersReducedMotion ? 'reduced-motion' : ''}`}>
              <div className="weather-icon-sun"></div>
              <div className="weather-icon-cloud"></div>
            </div>
            <motion.h1 
              className="landing-title"
              {...getAnimationProps(0.4)}
            >
              WeatherPro
            </motion.h1>
          </motion.div>
          
          <motion.p 
            className="landing-tagline"
            {...getAnimationProps(0.6)}
          >
            Your intelligent weather companion for smarter planning
          </motion.p>
        </div>
        
        <motion.div 
          className="feature-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: prefersReducedMotion ? 0 : 0.8, 
            staggerChildren: prefersReducedMotion ? 0 : 0.1,
            duration: prefersReducedMotion ? 0.3 : 0.8
          }}
        >
          {[
            {
              title: "Smart Trip Planning",
              description: "Plan your activities with weather-intelligent recommendations",
              icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            },
            {
              title: "Hourly Insights",
              description: "Track detailed weather patterns throughout your day",
              icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            },
            {
              title: "City Comparison",
              description: "Compare weather across multiple locations",
              icon: (
                <>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </>
              )
            },
            {
              title: "Real-time Updates",
              description: "Stay informed with live weather data",
              icon: (
                <>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </>
              )
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-item"
              whileHover={prefersReducedMotion ? {} : { scale: 1.05, y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  {feature.icon}
                </svg>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="cta-container"
          {...getAnimationProps(1.2)}
        >
          <motion.button 
            className="get-started-btn"
            onClick={onGetStarted}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05, boxShadow: "0 0 25px rgba(37, 117, 252, 0.6)" }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          >
            <span>Get Started</span>
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </motion.button>
          
          {!isMobile && !prefersReducedMotion && (
            <div className="scroll-indicator">
              <p>Scroll to explore</p>
              <div className="scroll-arrow">
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
      
      {!prefersReducedMotion && (
        <div className={`floating-elements ${isMobile ? 'reduced' : ''}`}>
          <div className="floating-cloud cloud-1"></div>
          <div className="floating-cloud cloud-2"></div>
          {!isMobile && <div className="floating-cloud cloud-3"></div>}
          <div className="floating-particle particle-1"></div>
          <div className="floating-particle particle-2"></div>
          {!isMobile && <div className="floating-particle particle-3"></div>}
        </div>
      )}
    </div>
  );
};

export default LandingPage; 
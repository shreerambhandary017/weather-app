import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import "./App.css";
import HourlyChart from "./components/HourlyChart";
import LandingPage from "./components/LandingPage";

// Use environment variable for API Key
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

// Add a warning if API key is not properly set
if (!API_KEY || API_KEY === "your_actual_openweathermap_api_key_here") {
  console.warn(
    "⚠️ OpenWeatherMap API key is missing or using placeholder value. " +
    "Please set your API key in the .env file as REACT_APP_WEATHER_API_KEY. " +
    "Get your API key from https://openweathermap.org/api"
  );
}

// Fallback mechanism for development (REMOVE IN PRODUCTION)
const getApiKey = () => {
  if (!API_KEY || API_KEY === "your_actual_openweathermap_api_key_here") {
    // For development only - NEVER use hardcoded API keys in production code
    return "2edbb872f491c59c5aafcd5fd49f1d06"; // This should be replaced with proper env variable
  }
  return API_KEY;
};

// Utility function to get user-friendly error messages
const getErrorMessage = (status, message) => {
  switch (status) {
    case 401:
      return "API key is invalid. Please check your OpenWeatherMap API key.";
    case 404:
      return "City not found. Please check the spelling and try again.";
    case 429:
      return "Too many requests. Please try again later.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Weather service is temporarily unavailable. Please try again later.";
    default:
      return message || "An unexpected error occurred. Please try again.";
  }
};

// Utility function to safely access nested properties
const safelyAccess = (obj, path, fallback = '') => {
  try {
    return path.split('.').reduce((o, key) => (o && o[key] !== undefined && o[key] !== null) ? o[key] : null, obj) || fallback;
  } catch (e) {
    return fallback;
  }
};

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [city, setCity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [error, setError] = useState("");
  const [compareCity, setCompareCity] = useState("");
  const [compareSearchTerm, setCompareSearchTerm] = useState("");
  const [compareCities, setCompareCities] = useState([]);
  const [unit, setUnit] = useState("metric"); // Already set to metric (Celsius)
  const [showForecastDetails, setShowForecastDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [aqiData, setAqiData] = useState(null);
  const [currentDate, setCurrentDate] = useState("");
  const [visibleDetails, setVisibleDetails] = useState([false, false, false, false]); // Track which details are visible
  const [visibleSection, setVisibleSection] = useState(null); // Track which section is visible
  const [selectedForecastDay, setSelectedForecastDay] = useState(null);

  // Set current date on component mount
  useEffect(() => {
    const date = new Date();
    setCurrentDate(
      date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    // Load saved unit preference from localStorage if available
    const savedUnit = localStorage.getItem("unitPreference");
    if (savedUnit) {
      setUnit(savedUnit);
    }

    // Initialize all UI elements as visible
    setVisibleSection(activeTab);
  }, [activeTab]);

  // Toggle between °C and °F
  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);
    localStorage.setItem("unitPreference", newUnit); // Save to local storage
  };

  // Use effect to reset visible details when changing tabs
  useEffect(() => {
    setVisibleSection(activeTab);
    // Reset visible details when changing tabs
    setVisibleDetails([false, false, false, false]);
  }, [activeTab]);

  // Function to convert temperature based on unit
  const convertTemp = useCallback((temp) => {
      if (unit === "metric") {
      return Math.round(temp);
      }
      return Math.round((temp * 9) / 5 + 32);
  }, [unit]);

  // Function to get wind speed with correct unit
  const getWindSpeed = useCallback((speed) => {
    if (unit === "metric") {
      return `${speed.toFixed(1)} m/s`;
    }
    // Convert from m/s to mph
    return `${(speed * 2.237).toFixed(1)} mph`;
  }, [unit]);

  // Get AQI description based on index
  const getAQIDescription = useCallback((aqi) => {
    switch (aqi) {
      case 1:
        return "Good";
      case 2:
        return "Fair";
      case 3:
        return "Moderate";
      case 4:
        return "Poor";
      case 5:
        return "Very Poor";
      default:
        return "Unknown";
    }
  }, []);

  // Get AQI color based on index
  const getAQIColor = useCallback((aqi) => {
    switch (aqi) {
      case 1:
        return "#4CAF50"; // Green
      case 2:
        return "#8BC34A"; // Light Green
      case 3:
        return "#FFC107"; // Amber
      case 4:
        return "#FF9800"; // Orange
      case 5:
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Grey
    }
  }, []);

  // Use effect to handle debounced search
  // Removed automatic city setting on typing
  // Now city will only be set when form is submitted

  // Use effect to handle debounced compare search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (compareSearchTerm.trim() !== "") {
      setCompareCity(compareSearchTerm);
      }
    }, 500); // Increased debounce time for better performance

    return () => {
      clearTimeout(handler);
    };
  }, [compareSearchTerm]);

  // Function to fetch weather data & 5-day forecast
  const fetchWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError("");

    try {
      // Current weather
      const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${getApiKey()}&units=metric`; // Always fetch in metric
      const weatherResponse = await fetch(weatherURL);
      
      if (!weatherResponse.ok) {
        throw new Error(getErrorMessage(weatherResponse.status, `HTTP error! status: ${weatherResponse.status}`));
      }
      
      const weatherData = await weatherResponse.json();

      if (weatherData.cod === 200) {
        setWeatherData(weatherData);

        // Get coordinates for forecast
        const { lat, lon } = weatherData.coord;

        // Fetch AQI data
        fetchAQI(lat, lon);

        try {
        // 5-day forecast
          const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${getApiKey()}&units=metric`; // Always fetch in metric
        const forecastResponse = await fetch(forecastURL);
          
          if (!forecastResponse.ok) {
            throw new Error(getErrorMessage(forecastResponse.status, forecastResponse.statusText));
          }
          
        const forecastData = await forecastResponse.json();

        if (forecastData.cod === "200") {
          // Process forecast data - get one forecast per day
          const dailyForecasts = [];
          const processedDates = new Set();

          forecastData.list.forEach((item) => {
            const date = new Date(item.dt * 1000).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            if (!processedDates.has(date) && dailyForecasts.length < 5) {
              processedDates.add(date);
              dailyForecasts.push({
                date,
                temp: item.main.temp,
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                humidity: item.main.humidity,
                wind: item.wind.speed,
                  pressure: item.main.pressure,
                  feels_like: item.main.feels_like,
                  dt: item.dt,
              });
            }
          });

          setForecastData(dailyForecasts);

            // Process hourly data
            setHourlyData(forecastData.list);
          } else {
            setError(getErrorMessage(forecastData.cod, forecastData.message));
          }
        } catch (forecastError) {
          console.error("Error fetching forecast data:", forecastError);
          setError("Failed to fetch forecast data. Please try again.");
        }
      } else {
        setError(getErrorMessage(weatherData.cod, weatherData.message || "Please try again"));
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError(error.message || "Failed to fetch weather data. Please check your connection and try again.");
    } finally {
    setLoading(false);
    }
  };

  // Function to fetch Air Quality Index
  const fetchAQI = async (lat, lon) => {
    try {
      const aqiURL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${getApiKey()}`;
      const response = await fetch(aqiURL);
      
      if (!response.ok) {
        throw new Error(getErrorMessage(response.status, response.statusText));
      }
      
      const data = await response.json();

      if (data && data.list && data.list.length > 0) {
        setAqiData(data.list[0]);
      } else {
        console.warn("No AQI data available for this location");
      }
    } catch (error) {
      console.error("Failed to fetch AQI data:", error);
      // Don't set error state here to avoid disrupting the main weather display
    }
  };

  // Fetch weather for compare cities
  const fetchCompareWeather = async () => {
    if (!compareCity) {
      setError("Please enter a city name to compare");
      return;
    }

    // Check if city is already in the list (case-insensitive)
    if (compareCities.some((city) => city.name.toLowerCase() === compareCity.toLowerCase())) {
      setError("City already added!");
      return;
    }

    if (compareCities.length >= 5) {
      setError("Maximum of 5 cities can be compared!");
      return;
    }

    setCompareLoading(true);
    setError(""); // Clear any previous errors

    try {
      const compareWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${compareCity}&appid=${getApiKey()}&units=metric`; // Always fetch in metric

      const response = await fetch(compareWeatherURL);
      
      if (!response.ok) {
        throw new Error(getErrorMessage(response.status, response.statusText));
      }
      
      const data = await response.json();

      if (data.cod === 200) {
        const newCity = {
          id: Date.now(), // Add a unique ID to each city for better tracking
          name: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          weather: data.weather[0],
          humidity: data.main.humidity,
          wind: data.wind.speed,
          icon: data.weather[0].icon,
          main: data.main,
        };

        // Add the new city to the list
        setCompareCities(prev => [...prev, newCity]);
        
        // Clear input fields
        setCompareCity("");
        setCompareSearchTerm("");
      } else {
        setError(getErrorMessage(data.cod, data.message || "Please try again"));
      }
    } catch (error) {
      console.error("Error fetching compare city weather:", error);
      setError("Failed to fetch city weather. Please try again.");
    } finally {
      setCompareLoading(false);
    }
  };

  // Remove city from compare list with animation
  const removeCity = (index) => {
    // Get the city element for animation
    const cityElement = document.getElementById(`city-${index}`);
    
    if (cityElement) {
      // Add removing class to trigger animation
      cityElement.classList.add('removing');
      
      // Wait for animation to complete before removing from state
      setTimeout(() => {
        const updatedCities = [...compareCities];
        updatedCities.splice(index, 1);
        setCompareCities(updatedCities);
        
        // Apply repositioning class to remaining cards
        // Use requestAnimationFrame to ensure DOM updates before applying the animation
        requestAnimationFrame(() => {
          document.querySelectorAll('.compare-card').forEach(card => {
            card.classList.add('repositioning');
          });
          
          // Remove repositioning class after transition completes
          setTimeout(() => {
            document.querySelectorAll('.compare-card').forEach(card => {
              card.classList.remove('repositioning');
            });
          }, 300);
        });
      }, 300); // Match transition duration from CSS
    } else {
      // Fallback if element not found
      const updatedCities = [...compareCities];
      updatedCities.splice(index, 1);
      setCompareCities(updatedCities);
    }
  };

  // Add a function to clear error message
  const clearError = () => {
    setError("");
  };

  // Function to toggle detail visibility
  const toggleDetailVisibility = (index) => {
    setVisibleDetails((prev) => {
      const newVisibleDetails = [...prev];
      // Close all other details first
      for (let i = 0; i < newVisibleDetails.length; i++) {
        if (i !== index) newVisibleDetails[i] = false;
      }
      // Toggle the selected detail
      newVisibleDetails[index] = !newVisibleDetails[index];
      return newVisibleDetails;
    });
  };

  // Cleanup function for API calls
  useEffect(() => {
    let isMounted = true;

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper function to calculate daylight progress percentage
  const calculateDaylightProgress = (sunrise, sunset) => {
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const dayLength = sunset - sunrise; // Total day length in seconds

    if (now < sunrise) return 0; // Before sunrise
    if (now > sunset) return 100; // After sunset

    // Calculate progress percentage
    return Math.min(100, Math.max(0, ((now - sunrise) / dayLength) * 100));
  };

  // Function to handle forecast day selection
  const selectForecastDay = (index) => {
    if (selectedForecastDay === index) {
      setSelectedForecastDay(null); // Toggle off if already selected
    } else {
      setSelectedForecastDay(index); // Select the day
    }
  };

  // Function to handle Get Started click
  const handleGetStarted = () => {
    setShowLanding(false);
  };

  // Update useEffect for dynamic city updates
  useEffect(() => {
    // Only fetch weather if city was set through form submission
    if (city && city === searchTerm) {
      fetchWeather();
    }
  }, [city]); // This will trigger whenever city changes

  // Render landing page or main app
  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">WeatherPro</div>

        {/* Search Section */}
        <div className="search-section">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim() !== "") {
                setCity(searchTerm);
                fetchWeather();
              }
            }}
          >
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter city name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search for a city"
                aria-describedby="search-button"
              />
              <button 
                type="submit"
                id="search-button"
                aria-label="Search"
              >
                🔍
              </button>
            </div>
          </form>
        </div>

        {/* Primary Weather Display */}
        {weatherData && (
          <div className="primary-weather">
            <div className="city-name">{weatherData.name}</div>
            <div className="date-time">{currentDate}</div>

            <div className="weather-icon">
              <img
                src={`https://openweathermap.org/img/wn/${safelyAccess(weatherData, 'weather[0].icon', '01d')}@2x.png`}
                alt={safelyAccess(weatherData, 'weather[0].description', 'weather')}
              />
            </div>

            <div className="weather-condition">
              {safelyAccess(weatherData, 'weather[0].description', 'Unknown weather condition')}
            </div>

            <div className="temperature-display">
              <div className="temperature">
                {Math.round(convertTemp(weatherData.main.temp))}
              </div>
              <div className="temp-unit">{unit === "metric" ? "°C" : "°F"}</div>
            </div>

            {/* Unit Toggle */}
            <div className="unit-toggle">
              <span>°C</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={unit === "imperial"}
                  onChange={toggleUnit}
                />
                <span className="slider round"></span>
              </label>
              <span>°F</span>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-item">
                <div className="stat-icon">💧</div>
                <div className="stat-value">{weatherData.main.humidity}%</div>
                <div className="stat-label">Humidity</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">💨</div>
                <div className="stat-value">
                  {getWindSpeed(weatherData.wind.speed)}
                </div>
                <div className="stat-label">Wind</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">🌡️</div>
                <div className="stat-value">
                  {convertTemp(weatherData.main.feels_like)}°{unit === "metric" ? "C" : "F"}
                </div>
                <div className="stat-label">Feels Like</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">☁️</div>
                <div className="stat-value">{safelyAccess(weatherData, 'clouds.all', 0)}%</div>
                <div className="stat-label">Clouds</div>
              </div>
            </div>

            {/* AQI Display */}
            {aqiData && (
              <div className="aqi-display">
                <div className="aqi-title">Air Quality Index</div>
                <div className="aqi-indicator">
                  <div
                    className="aqi-circle"
                    style={{ background: getAQIColor(aqiData.main.aqi) }}
                  >
                    <div className="aqi-value">{aqiData.main.aqi}</div>
                  </div>
                  <div className="aqi-label">
                    {getAQIDescription(aqiData.main.aqi)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {error && (
          <div 
            className="error-message" 
            role="alert" 
            aria-live="assertive"
          >
            {error}
            <button 
              className="error-close" 
              onClick={clearError}
              aria-label="Close error message"
            >
              ×
            </button>
          </div>
        )}

        {weatherData ? (
          <>
            {/* Tabs Navigation */}
            <div className="tabs" data-active={activeTab} role="tablist" aria-label="Weather information tabs">
              <button
                className={activeTab === "details" ? "active" : ""}
                onClick={() => setActiveTab("details")}
                role="tab"
                aria-selected={activeTab === "details"}
                aria-controls="details-panel"
                id="details-tab"
              >
                Weather Details
              </button>
              <button
                className={activeTab === "forecast" ? "active" : ""}
                onClick={() => setActiveTab("forecast")}
                role="tab"
                aria-selected={activeTab === "forecast"}
                aria-controls="forecast-panel"
                id="forecast-tab"
              >
                5-Day Forecast
              </button>
              <button
                className={activeTab === "hourly" ? "active" : ""}
                onClick={() => setActiveTab("hourly")}
                role="tab"
                aria-selected={activeTab === "hourly"}
                aria-controls="hourly-panel"
                id="hourly-tab"
              >
                Hourly Trends
              </button>
              <button
                className={activeTab === "planner" ? "active" : ""}
                onClick={() => setActiveTab("planner")}
                role="tab"
                aria-selected={activeTab === "planner"}
                aria-controls="planner-panel"
                id="planner-tab"
              >
                Trip Planner
              </button>
              <button
                className={activeTab === "compare" ? "active" : ""}
                onClick={() => setActiveTab("compare")}
                role="tab"
                aria-selected={activeTab === "compare"}
                aria-controls="compare-panel"
                id="compare-tab"
              >
                Compare Cities
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "details" && (
                <div 
                  id="details-panel" 
                  role="tabpanel" 
                  aria-labelledby="details-tab"
                  tabIndex="0"
                >
                  {/* Weather Details Grid */}
                  <div className={`weather-details-grid ${weatherData ? "visible" : ""}`}>
                    {/* Detail Cards with expandable content */}
                    <div className="detail-card-container">
                      <div className="detail-card" onClick={() => toggleDetailVisibility(0)}>
                        <div className="detail-card-title">Temperature</div>
                        <div className="detail-preview">
                          {weatherData && `${convertTemp(safelyAccess(weatherData, 'main.temp', 0))}°${unit === "metric" ? "C" : "F"}`}
                        </div>
                      </div>
                      {visibleDetails[0] && weatherData && (
                        <div className="detail-expanded" data-type="temperature">
                          <h3 className="detail-expanded-title">Temperature Details</h3>
                          <div className="detail-expanded-grid">
                            <div className="detail-item">
                              <span className="detail-label">Current</span>
                              <span className="detail-value">
                                {convertTemp(weatherData.main.temp)}°{unit === "metric" ? "C" : "F"}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Feels Like</span>
                              <span className="detail-value">
                                {convertTemp(weatherData.main.feels_like)}°{unit === "metric" ? "C" : "F"}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Min</span>
                              <span className="detail-value">
                                {convertTemp(weatherData.main.temp_min)}°{unit === "metric" ? "C" : "F"}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Max</span>
                              <span className="detail-value">
                                {convertTemp(weatherData.main.temp_max)}°{unit === "metric" ? "C" : "F"}
                              </span>
                            </div>
                          </div>
                          <div className="detail-recommendations">
                            <h4>Today's Temperature</h4>
                            <p>
                              {safelyAccess(weatherData, 'main.temp', 0) > 30
                                ? "Very hot conditions today. Stay hydrated, wear light clothing, and limit outdoor activities during peak hours."
                                : safelyAccess(weatherData, 'main.temp', 0) > 25
                                ? "Warm conditions today. Stay hydrated and use sun protection if going outside."
                                : safelyAccess(weatherData, 'main.temp', 0) > 15
                                ? "Pleasant temperature today. Great for outdoor activities."
                                : safelyAccess(weatherData, 'main.temp', 0) > 5
                                ? "Cool conditions today. Consider wearing a light jacket."
                                : "Cold conditions today. Dress warmly with layers."}
                            </p>
                            <p>
                              {safelyAccess(weatherData, 'main.feels_like', 0) < safelyAccess(weatherData, 'main.temp', 0) - 5
                                ? "Note: It feels significantly colder than the actual temperature due to wind or humidity factors."
                                : safelyAccess(weatherData, 'main.feels_like', 0) > safelyAccess(weatherData, 'main.temp', 0) + 5
                                ? "Note: It feels significantly warmer than the actual temperature due to humidity factors."
                                : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="detail-card-container">
                      <div className="detail-card" onClick={() => toggleDetailVisibility(1)}>
                        <div className="detail-card-title">Wind</div>
                        <div className="detail-preview">
                          {weatherData && getWindSpeed(safelyAccess(weatherData, 'wind.speed', 0))}
                        </div>
                      </div>
                      {visibleDetails[1] && weatherData && (
                        <div className="detail-expanded" data-type="wind">
                          <h3 className="detail-expanded-title">Wind Details</h3>
                          <div className="detail-expanded-grid">
                            <div className="detail-item">
                              <span className="detail-label">Speed</span>
                              <span className="detail-value">{getWindSpeed(safelyAccess(weatherData, 'wind.speed', 0))}</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Direction</span>
                              <span className="detail-value">{safelyAccess(weatherData, 'wind.deg', 0)}°</span>
                            </div>
                            <div className="detail-item wind-direction">
                              <span className="detail-label">Wind Direction</span>
                              <div className="wind-arrow" style={{ transform: `rotate(${safelyAccess(weatherData, 'wind.deg', 0)}deg)` }}>
                                <i className="arrow"></i>
                              </div>
                            </div>
                          </div>
                          <div className="detail-recommendations">
                            <h4>Wind Conditions</h4>
                            <p>
                              {safelyAccess(weatherData, 'wind.speed', 0) > 10
                                ? "Strong winds today. Secure loose items outdoors and be cautious when driving."
                                : safelyAccess(weatherData, 'wind.speed', 0) > 5
                                ? "Moderate winds today. Light objects may be blown around."
                                : "Light winds today. Ideal for most outdoor activities."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="detail-card-container">
                      <div className="detail-card" onClick={() => toggleDetailVisibility(2)}>
                        <div className="detail-card-title">Atmosphere</div>
                        <div className="detail-preview">
                          {weatherData && `${safelyAccess(weatherData, 'main.humidity', 0)}% humidity`}
                        </div>
                      </div>
                      {visibleDetails[2] && weatherData && (
                        <div className="detail-expanded" data-type="atmosphere">
                          <h3 className="detail-expanded-title">Atmospheric Details</h3>
                          <div className="detail-expanded-grid">
                            <div className="detail-item">
                              <span className="detail-label">Humidity</span>
                              <span className="detail-value">{safelyAccess(weatherData, 'main.humidity', 0)}%</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Pressure</span>
                              <span className="detail-value">{safelyAccess(weatherData, 'main.pressure', 0)} hPa</span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Visibility</span>
                              <span className="detail-value">
                                {(safelyAccess(weatherData, 'visibility', 0) / 1000).toFixed(1)} km
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Clouds</span>
                              <span className="detail-value">{safelyAccess(weatherData, 'clouds.all', 0)}%</span>
                            </div>
                          </div>
                          <div className="detail-recommendations">
                            <h4>Atmospheric Conditions</h4>
                            <p>
                              {safelyAccess(weatherData, 'main.humidity', 0) > 80
                                ? "High humidity today. It may feel more uncomfortable than the temperature suggests."
                                : safelyAccess(weatherData, 'main.humidity', 0) < 30
                                ? "Low humidity today. Stay hydrated and moisturize your skin if needed."
                                : "Comfortable humidity levels today."}
                            </p>
                            <p>
                              {safelyAccess(weatherData, 'visibility', 0) < 1000
                                ? "Very poor visibility. Take extreme caution when driving."
                                : safelyAccess(weatherData, 'visibility', 0) < 5000
                                ? "Reduced visibility. Take caution when driving."
                                : "Good visibility conditions."}
                            </p>
                            <p>
                              {safelyAccess(weatherData, 'clouds.all', 0) > 80
                                ? "Heavily cloudy skies today."
                                : safelyAccess(weatherData, 'clouds.all', 0) > 50
                                ? "Partly cloudy skies today."
                                : safelyAccess(weatherData, 'clouds.all', 0) > 20
                                ? "Mostly clear skies with some clouds."
                                : "Clear skies today."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="detail-card-container">
                      <div className="detail-card" onClick={() => toggleDetailVisibility(3)}>
                        <div className="detail-card-title">Sun & Moon</div>
                        <div className="detail-preview">
                          {weatherData && `${new Date(safelyAccess(weatherData, 'sys.sunset', 0) * 1000).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} sunset`}
                        </div>
                      </div>
                      {visibleDetails[3] && weatherData && (
                        <div className="detail-expanded" data-type="sun-moon">
                          <h3 className="detail-expanded-title">Sun & Moon Details</h3>
                          <div className="detail-expanded-grid">
                            <div className="detail-item">
                              <span className="detail-label">Sunrise</span>
                              <span className="detail-value">
                                {new Date(safelyAccess(weatherData, 'sys.sunrise', 0) * 1000).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Sunset</span>
                              <span className="detail-value">
                                {new Date(safelyAccess(weatherData, 'sys.sunset', 0) * 1000).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Daylight</span>
                              <span className="detail-value">
                                {(() => {
                                  const daylightSeconds = safelyAccess(weatherData, 'sys.sunset', 0) - safelyAccess(weatherData, 'sys.sunrise', 0);
                                  const hours = Math.floor(daylightSeconds / 3600);
                                  const minutes = Math.floor((daylightSeconds % 3600) / 60);
                                  return `${hours}h ${minutes}m`;
                                })()}
                              </span>
                            </div>
                          </div>
                          <div className="sun-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress" 
                                style={{ width: `${calculateDaylightProgress(safelyAccess(weatherData, 'sys.sunrise', 0), safelyAccess(weatherData, 'sys.sunset', 0))}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="detail-recommendations">
                            <h4>Daylight Information</h4>
                            <p>
                              {calculateDaylightProgress(safelyAccess(weatherData, 'sys.sunrise', 0), safelyAccess(weatherData, 'sys.sunset', 0)) < 1
                                ? "Pre-dawn hours. The sun will rise soon."
                                : calculateDaylightProgress(safelyAccess(weatherData, 'sys.sunrise', 0), safelyAccess(weatherData, 'sys.sunset', 0)) < 25
                                ? "Early morning hours. Good time for morning activities."
                                : calculateDaylightProgress(safelyAccess(weatherData, 'sys.sunrise', 0), safelyAccess(weatherData, 'sys.sunset', 0)) < 50
                                ? "Morning to mid-day. UV exposure increases during these hours."
                                : calculateDaylightProgress(safelyAccess(weatherData, 'sys.sunrise', 0), safelyAccess(weatherData, 'sys.sunset', 0)) < 75
                                ? "Afternoon hours. Be mindful of UV exposure."
                                : "Late afternoon to evening. The sun will set soon."}
                            </p>
                            <p>
                              Total daylight duration: {
                                (() => {
                                  const daylightSeconds = safelyAccess(weatherData, 'sys.sunset', 0) - safelyAccess(weatherData, 'sys.sunrise', 0);
                                  const hours = Math.floor(daylightSeconds / 3600);
                                  const minutes = Math.floor((daylightSeconds % 3600) / 60);
                                  return `${hours} hours and ${minutes} minutes`;
                                })()
                              }
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Daily Weather Overview */}
                  <div className="daily-weather-overview">
                    <h3 className="overview-title">Today's Weather Overview</h3>
                    <div className="overview-content">
                      <div className="overview-icon">
                        <img
                          src={`https://openweathermap.org/img/wn/${safelyAccess(weatherData, 'weather[0].icon', '01d')}@4x.png`}
                          alt={safelyAccess(weatherData, 'weather[0].description', 'weather')}
                        />
                      </div>
                      <div className="overview-details">
                        <div className="overview-condition">{safelyAccess(weatherData, 'weather[0].description', 'Unknown weather condition')}</div>
                        <div className="overview-temp">{convertTemp(safelyAccess(weatherData, 'main.temp', 0))}°{unit === "metric" ? "C" : "F"}</div>
                        <div className="overview-feels-like">Feels like {convertTemp(safelyAccess(weatherData, 'main.feels_like', 0))}°{unit === "metric" ? "C" : "F"}</div>
                        <div className="overview-stats">
                          <div className="overview-stat">
                            <span className="overview-stat-label">Humidity</span>
                            <span className="overview-stat-value">{safelyAccess(weatherData, 'main.humidity', 0)}%</span>
                          </div>
                          <div className="overview-stat">
                            <span className="overview-stat-label">Wind</span>
                            <span className="overview-stat-value">{getWindSpeed(safelyAccess(weatherData, 'wind.speed', 0))}</span>
                          </div>
                          <div className="overview-stat">
                            <span className="overview-stat-label">Pressure</span>
                            <span className="overview-stat-value">{safelyAccess(weatherData, 'main.pressure', 0)} hPa</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="overview-recommendations">
                      <h4>Today's Recommendations</h4>
                      <ul className="recommendations-list">
                        <li>
                          {safelyAccess(weatherData, 'weather[0].main') === "Rain" || safelyAccess(weatherData, 'weather[0].main') === "Drizzle"
                            ? "🌧️ Carry an umbrella and wear waterproof clothing."
                            : safelyAccess(weatherData, 'weather[0].main') === "Snow"
                            ? "❄️ Dress warmly with layers and wear appropriate footwear."
                            : safelyAccess(weatherData, 'weather[0].main') === "Thunderstorm"
                            ? "⛈️ Stay indoors and avoid open areas during thunderstorms."
                            : safelyAccess(weatherData, 'weather[0].main') === "Clear" && safelyAccess(weatherData, 'main.temp', 0) > 25
                            ? "☀️ Use sunscreen and stay hydrated in the hot weather."
                            : safelyAccess(weatherData, 'weather[0].main') === "Clear" && safelyAccess(weatherData, 'main.temp', 0) < 10
                            ? "❄️ Dress warmly despite the clear skies as it's cold outside."
                            : safelyAccess(weatherData, 'weather[0].main') === "Clouds" && safelyAccess(weatherData, 'clouds.all', 0) > 80
                            ? "☁️ Overcast conditions today, consider indoor activities."
                            : safelyAccess(weatherData, 'weather[0].main') === "Mist" || safelyAccess(weatherData, 'weather[0].main') === "Fog"
                            ? "🌫️ Reduced visibility, drive carefully if traveling."
                            : "🌤️ Good conditions for outdoor activities."}
                        </li>
                        <li>
                          {safelyAccess(weatherData, 'main.humidity', 0) > 80
                            ? "💧 High humidity may make it feel warmer. Dress accordingly and stay hydrated."
                            : safelyAccess(weatherData, 'main.humidity', 0) < 30
                            ? "🏜️ Low humidity may cause dry skin and throat. Stay hydrated."
                            : "👌 Comfortable humidity levels today."}
                        </li>
                        <li>
                          {safelyAccess(weatherData, 'wind.speed', 0) > 10
                            ? "💨 Strong winds today. Secure loose objects outdoors."
                            : safelyAccess(weatherData, 'wind.speed', 0) > 5
                            ? "🍃 Moderate breeze today. Light objects may be blown around."
                            : "🌬️ Light winds today, perfect for most outdoor activities."}
                        </li>
                        <li>
                          {new Date().getHours() >= 6 && new Date().getHours() < 12
                            ? "🌅 Morning hours are great for outdoor exercise."
                            : new Date().getHours() >= 12 && new Date().getHours() < 15
                            ? "☀️ Midday sun can be strong, seek shade when needed."
                            : new Date().getHours() >= 15 && new Date().getHours() < 19
                            ? "🌇 Afternoon activities should be planned with weather in mind."
                            : "🌙 Evening hours may be cooler, consider bringing a light jacket."}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "forecast" && (
                <div 
                  id="forecast-panel" 
                  role="tabpanel" 
                  aria-labelledby="forecast-tab"
                  tabIndex="0"
                  className="forecast-section"
                >
                  {loading ? (
                    <div className="forecast-container">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="skeleton skeleton-card"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="forecast-container">
                      {forecastData.map((day, index) => (
                        <div 
                          key={index} 
                          className={`forecast-card ${selectedForecastDay === index ? 'selected' : ''}`}
                          onClick={() => selectForecastDay(index)}
                        >
                          <div className="forecast-date">{day.date.split(",")[0]}</div>
                          <img
                            className="forecast-icon"
                            src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                            alt={day.description}
                          />
                          <div className="forecast-temp">
                            {convertTemp(day.temp)}°{unit === "metric" ? "C" : "F"}
                          </div>
                          <div className="forecast-condition">{day.description}</div>
                          <div className={`forecast-details ${showForecastDetails ? "expanded" : ""}`}>
                            <div className="forecast-detail-item">
                              <span className="forecast-detail-label">Humidity</span>
                              <span className="forecast-detail-value">{day.humidity}%</span>
                            </div>
                            <div className="forecast-detail-item">
                              <span className="forecast-detail-label">Wind</span>
                              <span className="forecast-detail-value">{getWindSpeed(day.wind)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Detailed forecast view for selected day */}
                  {selectedForecastDay !== null && forecastData[selectedForecastDay] && (
                    <div className="forecast-day-details">
                      <h3 className="forecast-day-title">
                        {forecastData[selectedForecastDay].date} - {forecastData[selectedForecastDay].description}
                      </h3>
                      <div className="forecast-day-content">
                        <div className="forecast-day-main">
                          <div className="forecast-day-icon">
                            <img
                              src={`https://openweathermap.org/img/wn/${forecastData[selectedForecastDay].icon}@4x.png`}
                              alt={forecastData[selectedForecastDay].description}
                            />
                          </div>
                          <div className="forecast-day-temp">
                            {convertTemp(forecastData[selectedForecastDay].temp)}°{unit === "metric" ? "C" : "F"}
                          </div>
                        </div>
                        
                        <div className="forecast-day-stats">
                          <div className="forecast-stat-item">
                            <div className="forecast-stat-icon">💧</div>
                            <div className="forecast-stat-value">{forecastData[selectedForecastDay].humidity}%</div>
                            <div className="forecast-stat-label">Humidity</div>
                          </div>
                          <div className="forecast-stat-item">
                            <div className="forecast-stat-icon">💨</div>
                            <div className="forecast-stat-value">{getWindSpeed(forecastData[selectedForecastDay].wind)}</div>
                            <div className="forecast-stat-label">Wind</div>
                          </div>
                          <div className="forecast-stat-item">
                            <div className="forecast-stat-icon">🌡️</div>
                            <div className="forecast-stat-value">
                              {convertTemp(forecastData[selectedForecastDay].temp)}°{unit === "metric" ? "C" : "F"}
                            </div>
                            <div className="forecast-stat-label">Temperature</div>
                          </div>
                        </div>
                        
                        <div className="forecast-day-description">
                          <h4>Weather Conditions</h4>
                          <p>
                            {forecastData[selectedForecastDay].date.split(",")[0]} will have {forecastData[selectedForecastDay].description} conditions.
                            {forecastData[selectedForecastDay].humidity > 80 
                              ? " High humidity may make it feel more uncomfortable." 
                              : forecastData[selectedForecastDay].humidity < 30 
                                ? " Low humidity may cause dry conditions." 
                                : ""}
                            {forecastData[selectedForecastDay].wind > 5 
                              ? " Expect breezy conditions." 
                              : forecastData[selectedForecastDay].wind > 10 
                                ? " Windy conditions expected." 
                                : ""}
                          </p>
                          <h4>Recommendations</h4>
                          <p>
                            {forecastData[selectedForecastDay].description.includes("rain") 
                              ? "Don't forget your umbrella and waterproof clothing." 
                              : forecastData[selectedForecastDay].description.includes("cloud") 
                                ? "Partly cloudy conditions, but rain is unlikely." 
                                : forecastData[selectedForecastDay].description.includes("clear") 
                                  ? "Clear skies expected. Great day for outdoor activities!" 
                                  : forecastData[selectedForecastDay].description.includes("snow") 
                                    ? "Snowy conditions expected. Dress warmly and be careful on roads." 
                                    : "Check back for more detailed weather information."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "hourly" && (
                <div 
                  id="hourly-panel" 
                  role="tabpanel" 
                  aria-labelledby="hourly-tab"
                  tabIndex="0"
                  className="chart-container"
                >
                  {loading ? (
                    <>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-chart"></div>
                    </>
                  ) : (
                    <>
                      <div className="chart-title">Today's Hourly Temperature Trends</div>
                      {hourlyData.length > 0 ? (
                        <div style={{ flex: 1, width: "100%", height: "400px" }}>
                          <HourlyChart hourlyData={hourlyData} unit={unit} showOnlyChart={true} />
                        </div>
                      ) : (
                        <div className="empty-state">
                          <p>No hourly data available for this location</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === "planner" && (
                <div 
                  id="planner-panel" 
                  role="tabpanel" 
                  aria-labelledby="planner-tab"
                  tabIndex="0"
                  className="planner-container"
                >
                  {loading ? (
                    <div className="skeleton-loader">
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-text short"></div>
                      <div className="skeleton skeleton-card"></div>
                      <div className="skeleton skeleton-card"></div>
                      <div className="skeleton skeleton-card"></div>
                    </div>
                  ) : (
                    hourlyData.length > 0 ? (
                      <div style={{ flex: 1, width: "100%" }}>
                        <HourlyChart hourlyData={hourlyData} unit={unit} showOnlyChart={false} />
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>No hourly data available for this location</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {activeTab === "compare" && (
                <div
                  id="compare-panel" 
                  role="tabpanel" 
                  aria-labelledby="compare-tab"
                  tabIndex="0"
                  className={`compare-container ${
                    activeTab === "compare" ? "visible" : ""
                  }`}
                >
                  <div className="compare-input">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Enter city to compare"
                        value={compareSearchTerm}
                        onChange={(e) => setCompareSearchTerm(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && fetchCompareWeather()
                        }
                      />
                      <button onClick={fetchCompareWeather}>Add</button>
                    </div>
                  </div>

                  <div className="compare-results">
                    {compareLoading && (
                      <div className="skeleton-loader">
                        <div className="skeleton-compare-card skeleton">
                          <div className="skeleton-text skeleton" style={{ height: '24px', width: '80%', marginBottom: '10px' }}></div>
                          <div className="skeleton-text skeleton" style={{ height: '32px', width: '50%', marginBottom: '10px' }}></div>
                          <div className="skeleton-text skeleton" style={{ height: '20px', width: '70%', marginBottom: '15px' }}></div>
                          <div className="skeleton-text skeleton" style={{ height: '18px', width: '90%', marginBottom: '8px' }}></div>
                          <div className="skeleton-text skeleton" style={{ height: '18px', width: '90%' }}></div>
                        </div>
                      </div>
                    )}
                    {compareCities.map((city, index) => (
                      <div 
                        key={city.id || `city-${index}-${city.name}`} 
                        id={`city-${index}`} 
                        className="compare-card"
                        style={{ animationDelay: `${index * 0.1}s` }}
                        data-city-name={city.name.toLowerCase()}
                      >
                        <div className="compare-city">
                          {city.name}, {city.country}
                        </div>
                        <div className="compare-temp">
                          {convertTemp(city.temp)}°{unit === "metric" ? "C" : "F"}
                        </div>
                        <div className="compare-condition">
                          {city.weather.description}
                        </div>
                        <div className="compare-details">
                          <div className="compare-detail-item">
                            <span className="compare-detail-label">
                              Humidity
                            </span>
                            <span className="compare-detail-value">
                              {city.humidity}%
                            </span>
                          </div>
                          <div className="compare-detail-item">
                            <span className="compare-detail-label">Wind</span>
                            <span className="compare-detail-value">{getWindSpeed(city.wind)}</span>
                          </div>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => removeCity(index)}
                          aria-label={`Remove ${city.name}`}
                        >
                          <span>×</span>
                        </button>
                      </div>
                    ))}

                    {compareCities.length === 0 && (
                      <div className="empty-state">
                        <p>Add cities to compare their weather</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="content-placeholder">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">Fetching weather data...</div>
                <div className="skeleton-loader">
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text short"></div>
                  <div className="skeleton skeleton-circle"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="logo">WeatherPro</div>
                <p>
                  Enter a city name in the search bar to get detailed weather
                  information.
                </p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Unique Footer with Creative Design */}
      <footer className="unique-footer">
        <div className="footer-background"></div>
        <div className="footer-content">
          <div className="footer-profile">
            <div className="profile-image">
              <div className="profile-glow"></div>
              <span>SB</span>
            </div>
            <h3 className="creator-name" data-text="Shreeram Bhandary">Shreeram Bhandary</h3>
          </div>
          
          <div className="social-links">
            <a href="https://www.linkedin.com/in/shreeram-bhandary/" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
              <span className="hover-label">Connect on LinkedIn</span>
              <span className="social-icon">in</span>
              <span className="social-text">Shreeram Bhandary</span>
            </a>
            
            <a href="https://github.com/shreerambhandary017" target="_blank" rel="noopener noreferrer" className="social-link github">
              <span className="hover-label">Follow on GitHub</span>
              <span className="social-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </span>
              <span className="social-text">shreerambhandary017</span>
            </a>
            
            <a href="https://www.instagram.com/shutter.surprizz/" target="_blank" rel="noopener noreferrer" className="social-link instagram">
              <span className="hover-label">Follow on Instagram</span>
              <span className="social-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </span>
              <span className="social-text">shutter.surprizz</span>
            </a>
          </div>
        </div>
        <div className="footer-particles"></div>
      </footer>
    </div>
  );
}

export default App;

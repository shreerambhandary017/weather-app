import React, { useState } from "react";
import "./App.css";
import HourlyChart from "./components/HourlyChart";

const API_KEY = "2edbb872f491c59c5aafcd5fd49f1d06"; // Replace with your OpenWeatherMap API Key

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [activeTab, setActiveTab] = useState("forecast");
  const [error, setError] = useState("");
  const [compareCity, setCompareCity] = useState("");
  const [compareCities, setCompareCities] = useState([]);


  // Function to fetch weather data & 5-day forecast
  const fetchWeather = async () => {
    if (!city) {
      setError("Please enter a city name!");
      return;
    }
    setError("");

    const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        fetch(weatherURL),
        fetch(forecastURL),
      ]);

      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();

      if (weatherData.cod === 200 && forecastData.cod === "200") {
        setWeatherData(weatherData);

        // Extract 5-day forecast (one per day at 12:00 PM)
        const dailyForecast = {};
        forecastData.list.forEach((item) => {
          const date = item.dt_txt.split(" ")[0]; // Get YYYY-MM-DD
          if (!dailyForecast[date] && item.dt_txt.includes("12:00:00")) {
            dailyForecast[date] = item;
          }
        });

        setForecastData(Object.values(dailyForecast));

        // Extract hourly forecast for the next 12 hours
        const next12Hours = forecastData.list.slice(0, 12).map((hour) => ({
          time: new Date(hour.dt_txt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          temp: hour.main.temp,
        }));

        setHourlyData(next12Hours);
      } else {
        setError("City not found. Try again!");
      }
    } catch (error) {
      setError("Failed to fetch weather data.");
    }
  };

  const fetchCompareWeather = async () => {
    if (!compareCity) return;
  
    const compareWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${compareCity}&appid=${API_KEY}&units=metric`;
  
    try {
      const response = await fetch(compareWeatherURL);
      const data = await response.json();
  
      if (data.cod === 200) {
        const newCity = {
          name: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          weather: data.weather[0].main,
          humidity: data.main.humidity,
          wind: data.wind.speed,
          icon: data.weather[0].icon,
        };
  
        setCompareCities([...compareCities, newCity]);
        setCompareCity("");
      }
    } catch (error) {
      console.error("Failed to fetch compare city weather:", error);
    }
  };
  

  return (
    <div className="container">
      {/* Left Box - Weather Display */}
      <div className="weather-box">
        <h2 className="box-title">Weather Info</h2>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={fetchWeather}>Get Weather</button>
        </div>

        {error && <p className="error">{error}</p>}

        {weatherData && (
          <div className="weather-info">
            <img
              className="weather-icon"
              src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
              alt="Weather Icon"
            />
            <h3>{weatherData.name}, {weatherData.sys.country}</h3>
            <p><strong>Temperature:</strong> {weatherData.main.temp}°C</p>
            <p><strong>Weather:</strong> {weatherData.weather[0].main}</p>
            <p><strong>Humidity:</strong> {weatherData.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> {weatherData.wind.speed} m/s</p>
          </div>
        )}
      </div>

      {/* Right Box - Additional Features */}
      <div className="features-box">
        <h2 className="box-title">Additional Features</h2>
        <div className="tabs">
          <button className={activeTab === "forecast" ? "active" : ""} onClick={() => setActiveTab("forecast")}>
            5-Day Forecast
          </button>
          <button className={activeTab === "hourly" ? "active" : ""} onClick={() => setActiveTab("hourly")}>
            Hourly Trends
          </button>
          <button className={activeTab === "compare" ? "active" : ""} onClick={() => setActiveTab("compare")}>
            Compare Cities
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "forecast" && (
            <div className="forecast-container">
              {forecastData.length > 0 ? (
                forecastData.map((day, index) => (
                  <div key={index} className="forecast-card">
                    <p>{new Date(day.dt_txt).toDateString()}</p>
                    <img
                      src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                      alt={day.weather[0].description}
                    />
                    <p><strong>{day.main.temp}°C</strong></p>
                    <p>{day.weather[0].main}</p>
                  </div>
                ))
              ) : (
                <p>Enter a city to see the 5-day forecast.</p>
              )}
            </div>
          )}

          {activeTab === "hourly" && (hourlyData.length > 0 ? <HourlyChart hourlyData={hourlyData} /> : <p>Enter a city to see hourly trends.</p>)}

          {activeTab === "compare" && (
  <div className="compare-container">
    <div className="input-group">
      <input
        type="text"
        placeholder="Enter city name"
        value={compareCity}
        onChange={(e) => setCompareCity(e.target.value)}
      />
      <button onClick={fetchCompareWeather}>Add City</button>
    </div>

    <div className="compare-results">
      {compareCities.length > 0 ? (
        compareCities.map((city, index) => (
          <div key={index} className="compare-card">
            <h3>{city.name}, {city.country}</h3>
            <img
              src={`https://openweathermap.org/img/wn/${city.icon}@2x.png`}
              alt="Weather Icon"
            />
            <p><strong>Temperature:</strong> {city.temp}°C</p>
            <p><strong>Weather:</strong> {city.weather}</p>
            <p><strong>Humidity:</strong> {city.humidity}%</p>
            <p><strong>Wind Speed:</strong> {city.wind} m/s</p>
          </div>
        ))
      ) : (
        <p>Enter a city to compare weather data.</p>
      )}
    </div>
  </div>
)}

        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from "react";
import WeatherChart from "./WeatherChart";
import TimeSelector from "./TimeSelector";
import SelectedTimeWeather from "./SelectedTimeWeather";

function HourlyChart({ hourlyData, unit, showOnlyChart = false }) {
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedHourData, setSelectedHourData] = useState(null);
  const [timeOptions, setTimeOptions] = useState([]);
  const [activeTimeSlot, setActiveTimeSlot] = useState(null);

  // Function to convert temperature based on unit
  const convertTemp = (temp) => {
    if (temp === null || temp === undefined) {
      return "--";
    }
    
    if (unit === "metric") {
      return Math.round(temp);
    }
    return Math.round((temp * 9) / 5 + 32);
  };

  // Generate time options from hourly data
  useEffect(() => {
    if (!hourlyData || hourlyData.length === 0) {
      return;
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Filter and sort hourly data for today
    const todayData = hourlyData
      .filter(hour => {
        const hourDate = new Date(hour.dt * 1000);
        return hourDate >= today && hourDate < tomorrow;
      })
      .sort((a, b) => a.dt - b.dt);

    // Create a map for quick lookup of hourly data
    const hourDataMap = new Map();
    todayData.forEach(hour => {
      const hourDate = new Date(hour.dt * 1000);
      const hourOfDay = hourDate.getHours();
      hourDataMap.set(hourOfDay, hour);
    });

    // Create 24 hour slots
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const date = new Date(today);
      date.setHours(hour);
      
      // Format time as 12-hour with AM/PM
      const timeString = date.toLocaleTimeString([], { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true 
      });
      
      // Find matching data or create placeholder
      const hourData = hourDataMap.get(hour);

      if (hourData) {
        options.push({
          value: timeString,
          label: timeString,
          dt: hourData.dt,
          data: hourData
        });
      } else {
        // Create placeholder data for missing hours
        options.push({
          value: timeString,
          label: timeString,
          dt: date.getTime() / 1000,
          data: {
            temp: null,
            description: "No data available",
            icon: null,
            dt: date.getTime() / 1000
          }
        });
      }
    }
    
    setTimeOptions(options);
  }, [hourlyData]);

  // Function to handle time selection
  const handleTimeSelect = (option, index) => {
    if (!option || !option.data) {
      return;
    }
    
    setSelectedTime(option.value);
    setSelectedHourData(option.data);
    setActiveTimeSlot(index);
  };

  // If showOnlyChart is true, return only the chart
  if (showOnlyChart) {
    return <WeatherChart hourlyData={hourlyData} unit={unit} />;
  }

  // If no hourly data, show a prompt
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="trip-planning-prompt">
        <div className="prompt-icon">🌤️</div>
        <p>Enter a city to get trip planning recommendations based on hourly weather.</p>
      </div>
    );
  }

  return (
    <div className="trip-planner-container">
      <div className="planning-overview">
        <div className="planning-overview-header">
          <h4>Trip Weather Planner</h4>
          <p>Plan your day based on hourly weather conditions</p>
        </div>
      </div>
      
      <TimeSelector 
        timeOptions={timeOptions}
        activeTimeSlot={activeTimeSlot}
        handleTimeSelect={handleTimeSelect}
        unit={unit}
      />
      
      {selectedHourData ? (
        <SelectedTimeWeather 
          selectedHourData={selectedHourData} 
          selectedTime={selectedTime}
          unit={unit}
          convertTemp={convertTemp}
        />
      ) : (
        <div className="trip-planning-prompt">
          <div className="prompt-icon">👆</div>
          <p>Select a time slot above to see detailed weather and recommendations.</p>
        </div>
      )}
    </div>
  );
}

export default HourlyChart;

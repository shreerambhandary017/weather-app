import React from "react";

/**
 * TimeSlot component for displaying individual time slots in the hourly weather view
 * @param {Object} option - Time slot data
 * @param {number} index - Index of the time slot
 * @param {boolean} isActive - Whether this time slot is currently active
 * @param {function} onSelect - Function to call when time slot is selected
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 */
function TimeSlot({ option, index, isActive, onSelect, unit }) {
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

  // Get weather condition icon URL
  const getWeatherIconUrl = (icon) => {
    if (!icon) {
      // Return a default icon or placeholder
      return "https://openweathermap.org/img/wn/01d@2x.png";
    }
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  // Check if this time slot has data
  const hasData = option.data && option.data.temp !== null;

  return (
    <div
      className={`time-slot ${isActive ? "active" : ""}`}
      data-no-data={!hasData}
      onClick={() => hasData ? onSelect(option, index) : null}
    >
      <div className="time-slot-time">{option.label}</div>
      <div className="time-slot-icon">
        <img
          src={getWeatherIconUrl(option.data.icon)}
          alt={option.data.description || "Weather"}
        />
      </div>
      <div className="time-slot-temp">
        {hasData ? `${convertTemp(option.data.temp)}°` : "--"}
      </div>
    </div>
  );
}

export default React.memo(TimeSlot); 
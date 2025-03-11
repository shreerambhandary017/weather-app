import React from "react";
import TimeSlot from "./TimeSlot";

/**
 * TimeSelector component for displaying a scrollable list of time slots
 * @param {Array} timeOptions - Array of time options
 * @param {number} activeTimeSlot - Index of the currently active time slot
 * @param {function} handleTimeSelect - Function to call when a time slot is selected
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 */
function TimeSelector({ timeOptions, activeTimeSlot, handleTimeSelect, unit }) {
  if (!timeOptions || timeOptions.length === 0) {
    return (
      <div className="time-slots-container">
        <div className="time-slots-header">
          <h3>Select Time</h3>
        </div>
        <div className="trip-planning-prompt">
          <div className="prompt-icon">⏰</div>
          <p>No hourly data available. Please enter a city to see hourly weather.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="time-slots-container">
      <div className="time-slots-header">
        <h3>Select Time</h3>
      </div>
      <div className="time-slots-scroll">
        {timeOptions.map((option, index) => (
          <TimeSlot
            key={index}
            option={option}
            index={index}
            isActive={activeTimeSlot === index}
            onSelect={handleTimeSelect}
            unit={unit}
          />
        ))}
      </div>
    </div>
  );
}

export default React.memo(TimeSelector); 
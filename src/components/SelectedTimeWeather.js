import React from "react";

/**
 * SelectedTimeWeather component for displaying weather details for the selected time
 * @param {Object} selectedHourData - Weather data for the selected hour
 * @param {string} selectedTime - Selected time string
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 * @param {function} convertTemp - Function to convert temperature based on unit
 */
function SelectedTimeWeather({ selectedHourData, selectedTime, unit, convertTemp }) {
  // Get weather condition icon URL
  const getWeatherIconUrl = (icon) => {
    if (!icon) {
      // Return a default icon or placeholder
      return "https://openweathermap.org/img/wn/01d@2x.png";
    }
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  // Get weather recommendation based on conditions
  const getWeatherRecommendation = (description, temp) => {
    if (!description || temp === null || temp === undefined) {
      return "Weather data unavailable";
    }
    
    const desc = description.toLowerCase();
    
    if (desc.includes("rain")) {
      return "Bring an umbrella and waterproof clothing.";
    } else if (desc.includes("snow")) {
      return "Dress warmly and wear appropriate footwear.";
    } else if (desc.includes("cloud")) {
      return "Partly cloudy conditions, but rain is unlikely.";
    } else if (desc.includes("clear")) {
      if (temp > 30) {
        return "Very hot conditions. Stay hydrated and use sun protection.";
      } else if (temp > 25) {
        return "Warm and clear. Great for outdoor activities, but use sun protection.";
      } else {
        return "Clear skies. Perfect for outdoor activities.";
      }
    } else if (desc.includes("fog") || desc.includes("mist")) {
      return "Reduced visibility. Drive carefully if traveling.";
    } else {
      return "Check forecast for updates as conditions may change.";
    }
  };

  // Get weather condition emoji
  const getWeatherEmoji = (description) => {
    if (!description) {
      return "❓";
    }
    
    const desc = description.toLowerCase();
    
    if (desc.includes("rain") || desc.includes("drizzle")) {
      return "🌧️";
    } else if (desc.includes("snow")) {
      return "❄️";
    } else if (desc.includes("cloud")) {
      return "☁️";
    } else if (desc.includes("clear")) {
      return "☀️";
    } else if (desc.includes("fog") || desc.includes("mist")) {
      return "🌫️";
    } else if (desc.includes("thunder")) {
      return "⛈️";
    } else {
      return "🌤️";
    }
  };

  return (
    <div className="selected-time-weather">
      <div className="selected-time-header">
        <div className="selected-time-icon">
          <img
            src={getWeatherIconUrl(selectedHourData.icon)}
            alt={selectedHourData.description || "Weather"}
          />
        </div>
        <div>
          <div className="selected-time-temp">
            {selectedHourData.temp !== null ? `${convertTemp(selectedHourData.temp)}°` : "--"}
            {unit === "metric" ? "C" : "F"}
          </div>
          <div className="selected-time-condition">
            {selectedHourData.description || "No data available"}
          </div>
        </div>
      </div>
      
      <div className="selected-time-details">
        <div className="selected-time-recommendation">
          <h4>
            {getWeatherEmoji(selectedHourData.description)} Weather at {selectedTime}
          </h4>
          <p>
            {getWeatherRecommendation(
              selectedHourData.description,
              selectedHourData.temp
            )}
          </p>
        </div>
        
        {/* Activity Recommendations Section */}
        <div className="planning-section">
          <h3 className="planning-section-title">
            <span className="planning-icon">🏃‍♂️</span> Activity Recommendations
          </h3>
          <div className="activity-recommendations">
            {getActivityRecommendations(selectedHourData).map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-rating" data-rating={activity.rating}>
                  {activity.rating}
                </div>
                <div className="activity-name">{activity.name}</div>
                <div className="activity-note">{activity.note}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Clothing & Gear Section */}
        <div className="planning-section">
          <h3 className="planning-section-title">
            <span className="planning-icon">👕</span> Clothing & Gear
          </h3>
          <div className="clothing-recommendations">
            <div className="clothing-essentials">
              {getClothingRecommendations(selectedHourData).map((item, index) => (
                <div key={index} className="clothing-item">
                  <div className="item-icon">{item.icon}</div>
                  <div className="item-name">{item.name}</div>
                </div>
              ))}
            </div>
            <div className="gear-checklist">
              <h5>Essential Gear</h5>
              {getGearChecklist(selectedHourData).map((item, index) => (
                <div key={index} className="gear-item">
                  <div className="gear-icon">{item.icon}</div>
                  <div className="gear-name">{item.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate activity recommendations based on weather
function getActivityRecommendations(weatherData) {
  if (!weatherData || weatherData.temp === null) {
    return [
      { name: "Data unavailable", rating: "N/A", note: "Weather data is not available for this time." }
    ];
  }

  const temp = weatherData.temp;
  const desc = (weatherData.description || "").toLowerCase();
  const activities = [];

  // Outdoor activities
  if (desc.includes("clear") || desc.includes("sun")) {
    if (temp > 25) {
      activities.push({ 
        name: "Swimming", 
        rating: "Excellent", 
        note: "Perfect weather for water activities." 
      });
      activities.push({ 
        name: "Picnic", 
        rating: "Good", 
        note: "Find a shaded area and bring plenty of water." 
      });
    } else if (temp > 15) {
      activities.push({ 
        name: "Hiking", 
        rating: "Excellent", 
        note: "Ideal temperature for outdoor trails." 
      });
      activities.push({ 
        name: "Cycling", 
        rating: "Excellent", 
        note: "Great conditions for a bike ride." 
      });
    } else {
      activities.push({ 
        name: "Walking Tour", 
        rating: "Good", 
        note: "Comfortable temperature for exploring." 
      });
    }
  } else if (desc.includes("cloud")) {
    activities.push({ 
      name: "Sightseeing", 
      rating: "Good", 
      note: "Overcast conditions are good for photography." 
    });
    activities.push({ 
      name: "Outdoor Dining", 
      rating: "Good", 
      note: "Not too sunny, comfortable for outdoor meals." 
    });
  } else if (desc.includes("rain") || desc.includes("drizzle")) {
    activities.push({ 
      name: "Museum Visit", 
      rating: "Excellent", 
      note: "Stay dry while enjoying cultural attractions." 
    });
    activities.push({ 
      name: "Shopping", 
      rating: "Good", 
      note: "Good time to explore indoor markets or malls." 
    });
  } else if (desc.includes("snow")) {
    activities.push({ 
      name: "Snow Activities", 
      rating: "Excellent", 
      note: "Great conditions for winter sports if available." 
    });
    activities.push({ 
      name: "Cozy Café Visit", 
      rating: "Excellent", 
      note: "Warm up with hot drinks and enjoy the snow views." 
    });
  } else if (desc.includes("fog") || desc.includes("mist")) {
    activities.push({ 
      name: "Indoor Activities", 
      rating: "Good", 
      note: "Limited visibility outdoors, better to stay inside." 
    });
  } else if (desc.includes("thunder")) {
    activities.push({ 
      name: "Indoor Entertainment", 
      rating: "Excellent", 
      note: "Stay safe indoors during thunderstorms." 
    });
  }

  // Add some indoor options regardless of weather
  activities.push({ 
    name: "Local Cuisine", 
    rating: "Good", 
    note: "Any weather is good for trying local food." 
  });

  return activities.slice(0, 4); // Limit to 4 activities
}

// Helper function to generate clothing recommendations based on weather
function getClothingRecommendations(weatherData) {
  if (!weatherData || weatherData.temp === null) {
    return [{ icon: "👕", name: "Weather data unavailable" }];
  }

  const temp = weatherData.temp;
  const desc = (weatherData.description || "").toLowerCase();
  const clothing = [];

  // Temperature-based recommendations
  if (temp > 30) {
    clothing.push({ icon: "👕", name: "Light, breathable clothing" });
    clothing.push({ icon: "👒", name: "Sun hat" });
    clothing.push({ icon: "🕶️", name: "Sunglasses" });
  } else if (temp > 20) {
    clothing.push({ icon: "👕", name: "Light clothing" });
    clothing.push({ icon: "🧢", name: "Cap or hat" });
  } else if (temp > 10) {
    clothing.push({ icon: "🧥", name: "Light jacket or sweater" });
    clothing.push({ icon: "👖", name: "Long pants" });
  } else if (temp > 0) {
    clothing.push({ icon: "🧥", name: "Warm jacket" });
    clothing.push({ icon: "🧣", name: "Scarf" });
    clothing.push({ icon: "🧤", name: "Gloves" });
  } else {
    clothing.push({ icon: "🧥", name: "Heavy winter coat" });
    clothing.push({ icon: "🧣", name: "Warm scarf" });
    clothing.push({ icon: "🧤", name: "Insulated gloves" });
    clothing.push({ icon: "👢", name: "Winter boots" });
  }

  // Weather-specific recommendations
  if (desc.includes("rain") || desc.includes("drizzle")) {
    clothing.push({ icon: "☂️", name: "Umbrella" });
    clothing.push({ icon: "🧥", name: "Waterproof jacket" });
  } else if (desc.includes("snow")) {
    clothing.push({ icon: "👢", name: "Waterproof boots" });
    clothing.push({ icon: "🧦", name: "Warm socks" });
  } else if (desc.includes("wind")) {
    clothing.push({ icon: "🧥", name: "Windbreaker" });
  } else if (desc.includes("clear") && temp > 20) {
    clothing.push({ icon: "🧴", name: "Sunscreen" });
  }

  return clothing;
}

// Helper function to generate gear checklist based on weather
function getGearChecklist(weatherData) {
  if (!weatherData || weatherData.temp === null) {
    return [{ icon: "❓", name: "Weather data unavailable" }];
  }

  const temp = weatherData.temp;
  const desc = (weatherData.description || "").toLowerCase();
  const gear = [];

  // Essential gear for all conditions
  gear.push({ icon: "📱", name: "Phone" });
  gear.push({ icon: "💳", name: "Wallet/Money" });
  gear.push({ icon: "🔑", name: "Keys" });
  gear.push({ icon: "💧", name: "Water bottle" });

  // Weather-specific gear
  if (desc.includes("rain") || desc.includes("drizzle")) {
    gear.push({ icon: "👟", name: "Waterproof footwear" });
    gear.push({ icon: "👝", name: "Waterproof bag" });
  } else if (desc.includes("snow")) {
    gear.push({ icon: "🧤", name: "Extra pair of gloves" });
    gear.push({ icon: "🔦", name: "Flashlight (shorter daylight)" });
  } else if (desc.includes("clear") && temp > 25) {
    gear.push({ icon: "🧴", name: "Sunscreen" });
    gear.push({ icon: "👓", name: "Sunglasses" });
    gear.push({ icon: "💧", name: "Extra water" });
  } else if (temp < 5) {
    gear.push({ icon: "☕", name: "Thermos with hot drink" });
    gear.push({ icon: "🔋", name: "Portable charger (cold drains batteries)" });
  }

  return gear;
}

export default React.memo(SelectedTimeWeather); 
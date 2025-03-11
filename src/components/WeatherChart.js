import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

/**
 * WeatherChart component for visualizing hourly weather data
 * @param {Object[]} hourlyData - Array of hourly weather data
 * @param {string} unit - Temperature unit ('metric' or 'imperial')
 */
function WeatherChart({ hourlyData, unit }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Function to convert temperature based on unit
  const convertTemp = (temp) => {
    if (temp === null || temp === undefined) {
      return null;
    }
    
    if (unit === "metric") {
      return Math.round(temp);
    }
    return Math.round((temp * 9) / 5 + 32);
  };

  // Initialize and update chart when data or unit changes
  useEffect(() => {
    if (!hourlyData || hourlyData.length === 0 || !chartRef.current) {
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

    // Prepare data for chart
    const labels = todayData.map(hour => {
      const date = new Date(hour.dt * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });

    const temperatures = todayData.map(hour => convertTemp(hour.temp));

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    try {
      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: `Temperature (°${unit === "metric" ? "C" : "F"})`,
              data: temperatures,
              borderColor: "#6B73FF",
              backgroundColor: "rgba(107, 115, 255, 0.2)",
              borderWidth: 2,
              pointBackgroundColor: "#6B73FF",
              pointBorderColor: "#fff",
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: {
                color: "rgba(255, 255, 255, 0.7)",
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              titleColor: "#fff",
              bodyColor: "#fff",
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
              padding: 10,
              titleFont: {
                family: "'Inter', sans-serif",
                size: 14,
              },
              bodyFont: {
                family: "'Inter', sans-serif",
                size: 13,
              },
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.raw}`;
                }
              }
            },
          },
          scales: {
            x: {
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.7)",
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
            y: {
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
              ticks: {
                color: "rgba(255, 255, 255, 0.7)",
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Error initializing chart:", error);
    }

    // Cleanup function to destroy chart when component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [hourlyData, unit]);

  return (
    <div className="chart-wrapper chart-only">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default React.memo(WeatherChart); 
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

function HourlyChart({ hourlyData }) {
  const chartRef = useRef(null);
  let chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (hourlyData.length === 0) return;

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: hourlyData.map((hour) => hour.time),
        datasets: [
          {
            label: "Temperature (°C)",
            data: hourlyData.map((hour) => hour.temp),
            borderColor: "#ffcc00",
            backgroundColor: "rgba(255, 204, 0, 0.3)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: "white",
            },
          },
          y: {
            ticks: {
              color: "white",
            },
          },
        },
      },
    });

    return () => chartInstance.current.destroy();
  }, [hourlyData]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default HourlyChart;

"use client";
import React from "react";
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default function ChakraChart({ scores }) {
  const data = {
    labels: ["Wurzel", "Sakral", "Solarplexus", "Herz", "Hals", "Stirn", "Krone"],
    datasets: [
      {
        label: "Chakra Stärke",
        data: scores,
        backgroundColor: [
          "#e63946",
          "#ffb703",
          "#f77f00",
          "#06d6a0",
          "#118ab2",
          "#8338ec",
          "#7209b7",
        ],
        borderRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return <Bar data={data} options={options} />;
}
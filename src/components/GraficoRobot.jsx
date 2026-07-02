import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function GraficoRobot({ lecturas }) {
  const datos = {
    labels: lecturas.map((l) => new Date(l.timestamp).toLocaleString()),
    datasets: [
      {
        label: "CO (ppm)",
        data: lecturas.map((l) => l.co),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        tension: 0.3,
      },
      {
        label: "Calidad del aire (MQ135)",
        data: lecturas.map((l) => l.mq135),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.3,
      },
      {
        label: "PM (µg/m³)",
        data: lecturas.map((l) => l.pm),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        tension: 0.3,
      },
    ],
  };

  const opciones = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#f1f5f9" } },
    },
    scales: {
      x: { ticks: { color: "#94a3b8", maxTicksLimit: 8 } },
      y: { ticks: { color: "#94a3b8" } },
    },
  };

  return <Line data={datos} options={opciones} />;
}

export default GraficoRobot;
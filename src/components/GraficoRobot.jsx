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

const opcionesBase = {
  responsive: true,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: { ticks: { color: "#94a3b8", maxTicksLimit: 6, font: { size: 10 } } },
    y: { ticks: { color: "#94a3b8" } },
  },
};

function GraficoRobot({ lecturas }) {
  const labels = lecturas.map((l) => new Date(l.timestamp).toLocaleString());

  const datosCO = {
    labels,
    datasets: [
      {
        label: "CO (ppm)",
        data: lecturas.map((l) => l.co),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        tension: 0.3,
      },
    ],
  };

  const datosMQ135 = {
    labels,
    datasets: [
      {
        label: "Calidad del aire (MQ135)",
        data: lecturas.map((l) => l.mq135),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.3,
      },
    ],
  };

  const datosPM = {
    labels,
    datasets: [
      {
        label: "PM (µg/m³)",
        data: lecturas.map((l) => l.pm),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600, margin: "0 0 8px 0" }}>
          CO — Monóxido de carbono
        </p>
        <Line data={datosCO} options={opcionesBase} />
      </div>

      <div>
        <p style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600, margin: "0 0 8px 0" }}>
          Calidad del aire (MQ135)
        </p>
        <Line data={datosMQ135} options={opcionesBase} />
      </div>

      <div>
        <p style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600, margin: "0 0 8px 0" }}>
          PM — Material particulado
        </p>
        <Line data={datosPM} options={opcionesBase} />
      </div>
    </div>
  );
}

export default GraficoRobot;
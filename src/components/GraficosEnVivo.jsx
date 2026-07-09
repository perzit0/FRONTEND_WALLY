import { useEffect, useState } from "react";
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
  Filler,
} from "chart.js";
import client from "../api/client";
import "../styles/GraficosEnVivo.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function GraficosEnVivo() {
  const [lecturas, setLecturas] = useState([]);

  useEffect(() => {
    const cargarLecturas = async () => {
      try {
        const res = await client.get("/dispositivos");
        const maxLecturas = 30;
        const ultimasLecturas = res.data
          .filter((d) => d.ultima_lectura)
          .flatMap((d) =>
            [...Array(2)].map((_, i) => ({
              ...d.ultima_lectura,
              device_id: d.device_id,
              nombre: d.nombre,
              tipo: ["co", "mq135"][i],
            }))
          );

        setLecturas((prev) => {
          const nuevas = [...prev, ...ultimasLecturas].slice(-maxLecturas);
          return nuevas;
        });
      } catch (err) {
        console.error("Error cargando lecturas:", err);
      }
    };

    cargarLecturas();
    const intervalo = setInterval(cargarLecturas, 1000);
    return () => clearInterval(intervalo);
  }, []);

  const getMarcasTiempo = () => {
    return lecturas.slice(-20).map((_, i) => i);
  };

  const getDatosGrafico = (tipo) => {
    const colores = {
      co: { border: "#fb7185", bg: "rgba(251, 113, 133, 0.1)" },
      mq135: { border: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)" },
    };

    const datos = lecturas
      .slice(-20)
      .map((l) => {
        if (tipo === "co") return l.co ?? null;
        if (tipo === "mq135") return l.mq135 ?? null;
      });

    return {
      labels: getMarcasTiempo(),
      datasets: [
        {
          label: tipo === "co" ? "CO (ppm)" : "MQ135 (ADC)",
          data: datos,
          borderColor: colores[tipo].border,
          backgroundColor: colores[tipo].bg,
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: colores[tipo].border,
          pointBorderWidth: 0,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const opcionesGrafico = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#cbd5e1",
          font: { size: 12, weight: "600" },
        },
      },
      tooltip: {
        backgroundColor: "rgba(6, 13, 28, 0.9)",
        padding: 10,
        titleColor: "#e2e8f0",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(125, 211, 252, 0.3)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { color: "rgba(125, 211, 252, 0.08)" },
      },
      x: {
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { color: "rgba(125, 211, 252, 0.08)" },
      },
    },
  };

  return (
    <div className="graficos-en-vivo">
      <h3>Métricas en vivo</h3>
      <div className="graficos-grid">
        <div className="grafico-card">
          <Line data={getDatosGrafico("co")} options={opcionesGrafico} />
        </div>
        <div className="grafico-card">
          <Line data={getDatosGrafico("mq135")} options={opcionesGrafico} />
        </div>
      </div>
    </div>
  );
}

export default GraficosEnVivo;

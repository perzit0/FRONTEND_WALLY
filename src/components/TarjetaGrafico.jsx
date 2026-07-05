import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/GraficoRobot.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

function crearGradiente(ctx, chartArea, colorDesde, colorHasta) {
  if (!chartArea) return colorDesde;
  const gradiente = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradiente.addColorStop(0, colorDesde);
  gradiente.addColorStop(1, colorHasta);
  return gradiente;
}

const tooltipEstilo = {
  backgroundColor: "#0f172a",
  titleColor: "#38bdf8",
  bodyColor: "#f1f5f9",
  borderColor: "#334155",
  borderWidth: 1,
  padding: 10,
  titleFont: { size: 12, weight: "600" },
  bodyFont: { size: 13, weight: "600" },
  cornerRadius: 8,
  displayColors: false,
};

export function opcionesBase(unidad) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipEstilo,
        callbacks: {
          label: (item) => `${item.formattedValue} ${unidad}`,
        },
      },
    },
    elements: {
      point: { radius: 0, hoverRadius: 5, hoverBorderWidth: 2 },
      line: { borderWidth: 2.5 },
    },
    scales: {
      x: {
        grid: { color: "rgba(148, 163, 184, 0.08)", drawTicks: false },
        border: { display: false },
        ticks: { color: "#64748b", maxTicksLimit: 6, font: { size: 10 } },
      },
      y: {
        grid: { color: "rgba(148, 163, 184, 0.08)", drawTicks: false },
        border: { display: false },
        ticks: { color: "#64748b", font: { size: 10 } },
      },
    },
  };
}

/**
 * Tarjeta de gráfico con relleno degradado, usada tanto en el perfil de
 * usuario (GraficoRobot) como en el dashboard de administrador, para que
 * ambos se vean iguales y profesionales.
 */
function TarjetaGrafico({ titulo, subtitulo, color, unidad, labels, valores, valorActual, alto = 160 }) {
  const chartRef = useRef(null);
  const [dataset, setDataset] = useState(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const gradienteRelleno = crearGradiente(chart.ctx, chart.chartArea, `${color}40`, `${color}00`);

    setDataset({
      labels,
      datasets: [
        {
          data: valores,
          borderColor: color,
          backgroundColor: gradienteRelleno,
          fill: true,
          tension: 0.35,
        },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labels, valores, color]);

  return (
    <div className="tarjeta-grafico" style={{ borderTop: `3px solid ${color}` }}>
      <div className="tarjeta-grafico-header">
        <div>
          <p className="tarjeta-grafico-titulo">{titulo}</p>
          <p className="tarjeta-grafico-subtitulo">{subtitulo}</p>
        </div>
        {valorActual !== undefined && (
          <div className="tarjeta-grafico-valor-actual" style={{ color }}>
            {valorActual !== null ? `${Math.round(valorActual * 100) / 100}` : "—"}
            <span className="tarjeta-grafico-unidad">{unidad}</span>
          </div>
        )}
      </div>
      <div style={{ height: alto }}>
        {dataset && <Line ref={chartRef} data={dataset} options={opcionesBase(unidad)} />}
        {!dataset && (
          <Line
            ref={chartRef}
            data={{ labels, datasets: [{ data: valores, borderColor: color, backgroundColor: `${color}20` }] }}
            options={opcionesBase(unidad)}
          />
        )}
      </div>
    </div>
  );
}

export default TarjetaGrafico;

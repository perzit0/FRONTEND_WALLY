import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import "../styles/GraficoRobot.css";
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

function opcionesBase(unidad) {
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

function TarjetaGrafico({ titulo, subtitulo, color, colorSuave, unidad, labels, valores, valorActual }) {
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
        <div className="tarjeta-grafico-valor-actual" style={{ color }}>
          {valorActual !== null && valorActual !== undefined ? `${Math.round(valorActual * 100) / 100}` : "—"}
          <span className="tarjeta-grafico-unidad">{unidad}</span>
        </div>
      </div>
      <div style={{ height: 160 }}>
        {dataset && <Line ref={chartRef} data={dataset} options={opcionesBase(unidad)} />}
        {/* Chart oculto solo para obtener el ctx/chartArea antes del primer render con gradiente */}
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

function GraficoRobot({ lecturas }) {
  const labels = lecturas.map((l) =>
    new Date(l.timestamp).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const ultima = lecturas[lecturas.length - 1];

  return (
    <div className="grid-graficos">
      <TarjetaGrafico
        titulo="Monóxido de carbono"
        subtitulo="Sensor MQ-7"
        color="#ef4444"
        unidad="ppm"
        labels={labels}
        valores={lecturas.map((l) => l.co)}
        valorActual={ultima?.co}
      />
      <TarjetaGrafico
        titulo="Calidad del aire"
        subtitulo="Sensor MQ-135"
        color="#3b82f6"
        unidad="ppm"
        labels={labels}
        valores={lecturas.map((l) => l.mq135)}
        valorActual={ultima?.mq135}
      />
      <TarjetaGrafico
        titulo="Material particulado"
        subtitulo="Sensor Sharp PM2.5"
        color="#f59e0b"
        unidad="µg/m³"
        labels={labels}
        valores={lecturas.map((l) => l.pm)}
        valorActual={ultima?.pm}
      />
    </div>
  );
}

export default GraficoRobot;

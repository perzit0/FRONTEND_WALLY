import { useEffect, useState } from "react";
import client from "../api/client";
import "../styles/SensorStrips.css";

function nivelCO(co) {
  if (co === null || co === undefined) return "sin datos";
  if (co < 9) return "bueno";
  if (co < 35) return "moderado";
  if (co < 60) return "malo";
  return "critico";
}

function nivelMQ135(valor) {
  if (valor === null || valor === undefined) return "sin datos";
  if (valor < 800) return "bueno";
  if (valor < 1200) return "moderado";
  if (valor < 1500) return "malo";
  return "critico";
}

function nivelPM(pm) {
  if (pm === null || pm === undefined) return "sin datos";
  if (pm < 12) return "bueno";
  if (pm < 35.4) return "moderado";
  if (pm < 55) return "malo";
  return "critico";
}

const sensores = [
  {
    key: "mq7",
    nombre: "MQ-7",
    campo: "co",
    unidad: "ppm",
    descripcion: "Monóxido de carbono",
    nivelFn: nivelCO,
  },
  {
    key: "mq135",
    nombre: "MQ-135",
    campo: "mq135",
    unidad: "ppm",
    descripcion: "Calidad del aire / COV",
    nivelFn: nivelMQ135,
  },
  {
    key: "sharp",
    nombre: "Sharp",
    campo: "pm",
    unidad: "µg/m³",
    descripcion: "Partículas PM2.5",
    nivelFn: nivelPM,
  },
];

function colorPorNivel(nivel) {
  switch (nivel) {
    case "bueno":
      return "#4ade80";
    case "moderado":
      return "#fbbf24";
    case "malo":
      return "#fb7185";
    case "critico":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
}

const ESCALAS = { mq7: 60, mq135: 1500, sharp: 55 };
const ETIQUETAS = { bueno: "Bueno", moderado: "Moderado", malo: "Malo", critico: "Crítico", "sin datos": "Sin datos" };

function SensorStrips() {
  const [robotsActivos, setRobotsActivos] = useState(0);
  const [niveles, setNiveles] = useState({
    mq7: { valor: null, nivel: "sin datos" },
    mq135: { valor: null, nivel: "sin datos" },
    sharp: { valor: null, nivel: "sin datos" },
  });

  const calcularNiveles = (dispositivos) => {
    const coValores = dispositivos
      .map((d) => d.ultima_lectura?.co)
      .filter((v) => v !== null && v !== undefined);
    const mq135Valores = dispositivos
      .map((d) => d.ultima_lectura?.mq135)
      .filter((v) => v !== null && v !== undefined);
    const pmValores = dispositivos
      .map((d) => d.ultima_lectura?.pm)
      .filter((v) => v !== null && v !== undefined);

    return {
      mq7: {
        valor: coValores.length ? Math.max(...coValores) : null,
        nivel: nivelCO(coValores.length ? Math.max(...coValores) : null),
      },
      mq135: {
        valor: mq135Valores.length ? Math.max(...mq135Valores) : null,
        nivel: nivelMQ135(mq135Valores.length ? Math.max(...mq135Valores) : null),
      },
      sharp: {
        valor: pmValores.length ? Math.max(...pmValores) : null,
        nivel: nivelPM(pmValores.length ? Math.max(...pmValores) : null),
      },
    };
  };

  const cargarDispositivos = async () => {
    try {
      const res = await client.get("/dispositivos");
      setNiveles(calcularNiveles(res.data));
      setRobotsActivos(res.data.filter((d) => d.ultima_lectura).length);
    } catch (err) {
      console.error("Error cargando datos de sensores para franjas:", err);
    }
  };

  useEffect(() => {
    cargarDispositivos();
    const intervalo = setInterval(cargarDispositivos, 3500);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="sensor-panel">
      <div className="sensor-panel-header">
        <h2>Sensores en vivo</h2>
        <span className="sensor-panel-vivo">
          <span className="punto-vivo" aria-hidden="true"></span>
          {robotsActivos > 0 ? `${robotsActivos} robot${robotsActivos === 1 ? "" : "s"} activo${robotsActivos === 1 ? "" : "s"}` : "Buscando robots…"}
        </span>
      </div>

      {sensores.map((sensor) => {
        const estado = niveles[sensor.key];
        const color = colorPorNivel(estado.nivel);
        const tieneValor = estado.valor !== null && estado.valor !== undefined;
        const porcentaje = tieneValor ? Math.min((estado.valor / ESCALAS[sensor.key]) * 100, 100) : 0;

        return (
          <article
            key={sensor.key}
            className={`sensor-card sensor-card--${estado.nivel.replace(/\s+/g, "-")}`}
            style={{ "--nivel-color": color }}
          >
            <header className="sensor-card-header">
              <span className="sensor-card-nombre">{sensor.nombre}</span>
              <span className="sensor-card-desc">{sensor.descripcion}</span>
            </header>
            <div className="sensor-card-valor">
              {tieneValor ? estado.valor.toFixed(1) : "—"}
              <span className="sensor-card-unidad">{sensor.unidad}</span>
            </div>
            <div className="sensor-card-barra">
              <span style={{ width: `${porcentaje}%` }}></span>
            </div>
            <span className="sensor-card-estado">
              <span className="sensor-card-estado-punto" aria-hidden="true"></span>
              {ETIQUETAS[estado.nivel]}
            </span>
          </article>
        );
      })}

      <p className="sensor-panel-nota">Se muestra el valor más alto reportado por los robots activos.</p>
    </div>
  );
}

export default SensorStrips;

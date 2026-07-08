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
      return "#22c55e";
    case "moderado":
      return "#f59e0b";
    case "malo":
      return "#ef4444";
    case "critico":
      return "#991b1b";
    default:
      return "#64748b";
  }
}

function SensorStrips() {
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
    <div className="sensor-strips-overlay" aria-hidden="true">
      {sensores.map((sensor) => {
        const estado = niveles[sensor.key];
        const color = colorPorNivel(estado.nivel);
        const textoValor = estado.valor !== null && estado.valor !== undefined
          ? `${estado.valor.toFixed(1)} ${sensor.unidad}`
          : "S/D";

        return (
          <div
            key={sensor.key}
            className={`sensor-strip sensor-strip--${estado.nivel.replace(/\s+/g, "-")}`}
            style={{ "--stripe-color": color }}
          >
            <div className="sensor-strip-head">
              <span className="sensor-strip-badge">{sensor.nombre}</span>
              <span className="sensor-strip-status">{estado.nivel.toUpperCase()}</span>
            </div>
            <div className="sensor-strip-content">
              <span className="sensor-strip-name">{sensor.descripcion}</span>
              <span className="sensor-strip-value">{textoValor}</span>
            </div>
            <span className="sensor-strip-hint">Actualización en tiempo real</span>
          </div>
        );
      })}
    </div>
  );
}

export default SensorStrips;

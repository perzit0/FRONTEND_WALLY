import { useEffect, useState } from "react";
import client from "../api/client";
import "../styles/IndiceCalidadAire.css";

function calcularIndiceGeneral(dispositivos) {
  const activos = dispositivos.filter((d) => d.ultima_lectura);
  if (activos.length === 0) return null;

  const promedio = (campo) => {
    const valores = activos.map((d) => d.ultima_lectura[campo]).filter((v) => v !== null && v !== undefined);
    if (valores.length === 0) return null;
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  };

  const co = promedio("co");
  const mq135 = promedio("mq135");
  const pm = promedio("pm");

  const nivelCO = co === null ? -1 : co < 9 ? 0 : co < 35 ? 1 : co < 60 ? 2 : 3;
  const nivelMQ = mq135 === null ? -1 : mq135 < 800 ? 0 : mq135 < 1200 ? 1 : mq135 < 1500 ? 2 : 3;
  const nivelPM = pm === null ? -1 : pm < 12 ? 0 : pm < 35.4 ? 1 : pm < 55 ? 2 : 3;

  const peor = Math.max(nivelCO, nivelMQ, nivelPM);
  const etiquetas = ["Buena", "Moderada", "Mala", "Crítica"];
  const colores = ["#22c55e", "#f59e0b", "#ef4444", "#991b1b"];
  const recomendaciones = [
    "Excelente momento para actividades al aire libre.",
    "Personas sensibles (asma, adultos mayores) deberían evitar esfuerzo prolongado al aire libre.",
    "Se recomienda usar mascarilla y limitar el tiempo de exposición al aire libre.",
    "Evita salir si no es necesario. Usa mascarilla y mantén ventanas cerradas.",
  ];

  if (peor === -1) return null;

  return {
    etiqueta: etiquetas[peor],
    color: colores[peor],
    recomendacion: recomendaciones[peor],
    robotsActivos: activos.length,
  };
}

function IndiceCalidadAire() {
  const [indice, setIndice] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await client.get("/dispositivos");
        setIndice(calcularIndiceGeneral(res.data));
      } catch (err) {
        console.error("Error cargando índice general:", err);
      }
    };
    cargar();
    const intervalo = setInterval(cargar, 15000);
    return () => clearInterval(intervalo);
  }, []);

  if (!indice) return null;

  return (
    <div className="indice-calidad-card" style={{ borderColor: indice.color }}>
      <div className="indice-calidad-badge" style={{ backgroundColor: indice.color }}>
        {indice.etiqueta}
      </div>
      <div className="indice-calidad-texto">
        <p className="indice-calidad-titulo">Calidad del aire en Lima ahora</p>
        <p className="indice-calidad-recomendacion">{indice.recomendacion}</p>
        <p className="indice-calidad-fuente">
          Calculado en vivo con {indice.robotsActivos} robot{indice.robotsActivos > 1 ? "s" : ""} WALLY activo
          {indice.robotsActivos > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

export default IndiceCalidadAire;

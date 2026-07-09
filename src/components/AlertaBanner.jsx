import { useEffect, useRef, useState } from "react";
import client from "../api/client";
import "../styles/AlertaBanner.css";

const NOMBRES = { co: "CO", mq135: "MQ135" };
const TIMEOUT_ALERTA = 10000; // 10 segundos sin datos = ocultar

function AlertaBanner() {
  const [alertas, setAlertas] = useState([]);
  const [visible, setVisible] = useState(true);
  const tiempoUltimaActividadRef = useRef(Date.now());

  const cargarAlertas = async () => {
    try {
      const res = await client.get("/alertas/activas");
      if (res.data && res.data.length > 0) {
        tiempoUltimaActividadRef.current = Date.now();
        setAlertas(res.data);
      } else {
        const tiempoSinActividad = Date.now() - tiempoUltimaActividadRef.current;
        if (tiempoSinActividad > TIMEOUT_ALERTA) {
          setAlertas([]);
        }
      }
    } catch (err) {
      console.error("Error al cargar alertas:", err);
    }
  };

  useEffect(() => {
    cargarAlertas();
    const intervalo = setInterval(cargarAlertas, 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (alertas.length === 0 || !visible) return null;

  return (
    <div className="alerta-banner">
      <div className="alerta-banner-contenido">
        <span className="alerta-icono">⚠️</span>
        <span className="alerta-texto">
          {alertas.length} {alertas.length === 1 ? "zona supera" : "zonas superan"} niveles seguros:{" "}
          {alertas.map((a, i) => (
            <span key={a.device_id}>
              {a.nombre} ({a.superados.map((s) => NOMBRES[s.tipo]).join(", ")})
              {i < alertas.length - 1 ? " · " : ""}
            </span>
          ))}
        </span>
      </div>
      <button className="alerta-cerrar" onClick={() => setVisible(false)}>
        ✕
      </button>
    </div>
  );
}

export default AlertaBanner;
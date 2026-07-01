import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import client from "../api/client";

const CENTRO_LIMA = [-12.07, -77.06];

function crearIconoRobot(color, enAlerta) {
  const svg = `
    <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="16" fill="${color}" stroke="#fff" stroke-width="2"/>
      <rect x="10" y="13" width="16" height="12" rx="3" fill="#fff"/>
      <circle cx="14.5" cy="19" r="1.8" fill="${color}"/>
      <circle cx="21.5" cy="19" r="1.8" fill="${color}"/>
      <rect x="15" y="9" width="6" height="4" rx="1" fill="#fff"/>
      <line x1="18" y1="6" x2="18" y2="9" stroke="#fff" stroke-width="2"/>
    </svg>
  `;

  return new L.DivIcon({
    html: svg,
    className: enAlerta ? "icono-robot marcador-alerta" : "icono-robot",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

function nivelCO(co) {
  if (co === null || co === undefined) return "sin datos";
  if (co < 30) return "bueno";
  if (co < 50) return "moderado";
  return "malo";
}

function colorPorNivel(nivel) {
  switch (nivel) {
    case "bueno": return "#22c55e";
    case "moderado": return "#f59e0b";
    case "malo": return "#ef4444";
    default: return "#9ca3af";
  }
}

function Mapa() {
  const [dispositivos, setDispositivos] = useState([]);

  const cargarDispositivos = async () => {
    try {
      const res = await client.get("/dispositivos");
      setDispositivos(res.data);
    } catch (err) {
      console.error("Error al cargar dispositivos:", err);
    }
  };

  useEffect(() => {
    cargarDispositivos();
    const intervalo = setInterval(cargarDispositivos, 30000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <MapContainer
      center={CENTRO_LIMA}
      zoom={12}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {dispositivos.map((d) => {
        if (!d.ultima_lectura || d.ultima_lectura.lat === null) return null;

        const nivel = nivelCO(d.ultima_lectura.co);
        const icono = crearIconoRobot(d.color || "#38bdf8", nivel === "malo");

        return (
          <Marker
            key={d.device_id}
            position={[d.ultima_lectura.lat, d.ultima_lectura.lng]}
            icon={icono}
          >
            <Popup>
              <div>
                <strong>{d.nombre || d.device_id}</strong>
                <p style={{ margin: "6px 0" }}>
                  CO:{" "}
                  <span style={{ color: colorPorNivel(nivel), fontWeight: 600 }}>
                    {d.ultima_lectura.co ?? "S/D"} ppm ({nivel})
                  </span>
                </p>
                <p style={{ margin: "2px 0" }}>MQ135: {d.ultima_lectura.mq135 ?? "S/D"}</p>
                <p style={{ margin: "2px 0" }}>PM: {d.ultima_lectura.pm ?? "S/D"} µg/m³</p>
                <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "#6b7280" }}>
                  Última lectura: {new Date(d.ultima_lectura.timestamp).toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default Mapa;
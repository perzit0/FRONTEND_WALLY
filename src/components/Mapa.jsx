import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import PanelMonitoreoZonal from "./PanelMonitoreoZonal";

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

  // IMPORTANTE: el className del DivIcon se aplica al MISMO elemento que Leaflet
  // usa para posicionar el marcador (transform: translate3d(...)). Si la animación
  // de alerta pone su propio "transform: scale(...)" sobre ese elemento, pisa el
  // transform de posición de Leaflet y el ícono se desalinea/parece moverse al
  // hacer zoom o pan. Por eso la animación va en un <div> interno, no en el
  // elemento raíz del ícono.
  return new L.DivIcon({
    html: `<div class="${enAlerta ? "icono-robot-inner marcador-alerta" : "icono-robot-inner"}">${svg}</div>`,
    className: "icono-robot",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

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


function colorPorNivel(nivel) {
  switch (nivel) {
    case "bueno": return "#22c55e";
    case "moderado": return "#f59e0b";
    case "malo": return "#ef4444";
    case "critico": return "#991b1b";
    default: return "#9ca3af";
  }
}

function Mapa() {
  const [dispositivos, setDispositivos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [monitoreoAbierto, setMonitoreoAbierto] = useState(null);
  const { estaAutenticado } = useAuth();

  const cargarDispositivos = async () => {
    try {
      const res = await client.get("/dispositivos");
      setDispositivos(res.data);
    } catch (err) {
      console.error("Error al cargar dispositivos:", err);
    }
  };

  const cargarZonas = async () => {
    try {
      const res = await client.get("/monitoreo/publico/zonas");
      setZonas(res.data);
    } catch (err) {
      console.error("Error al cargar zonas monitoreadas:", err);
    }
  };

  useEffect(() => {
    cargarDispositivos();
    cargarZonas();
    const intervaloDispositivos = setInterval(cargarDispositivos, 1000);
    const intervaloZonas = setInterval(cargarZonas, 20000);
    return () => {
      clearInterval(intervaloDispositivos);
      clearInterval(intervaloZonas);
    };
  }, []);

  return (
    <>
    <MapContainer
      center={CENTRO_LIMA}
      zoom={12}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      {zonas.map((z) => (
        <Circle
          key={`zona-${z.id}`}
          center={[z.centro_lat, z.centro_lng]}
          radius={z.radio_metros || 15}
          pathOptions={{
            color: z.color_hex || "#9ca3af",
            fillColor: z.color_hex || "#9ca3af",
            fillOpacity: 0.32,
            weight: 1.5,
          }}
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong>{z.nombre || "Zona monitoreada"}</strong>
              <p style={{ margin: "6px 0 2px 0" }}>
                <span style={{ fontWeight: 600, color: colorPorNivel(z.nivel_color) }}>
                  {z.nivel_color ? z.nivel_color.toUpperCase() : "SIN DATOS"}
                </span>
              </p>
              <p style={{ margin: "2px 0", fontSize: 12 }}>CO: {z.promedio_co ?? "S/D"} ppm</p>
              <p style={{ margin: "2px 0", fontSize: 12 }}>MQ135: {z.promedio_mq135 ?? "S/D"}</p>
              <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "#9ca3af" }}>
                {z.hora_fin ? new Date(z.hora_fin).toLocaleString("es-PE", { timeZone: "America/Lima" }) : ""}
              </p>
            </div>
          </Popup>
        </Circle>
      ))}

      {dispositivos.map((d) => {
        if (!d.ultima_lectura || d.ultima_lectura.lat === null) return null;

        const nivelCOActual = nivelCO(d.ultima_lectura.co);
        const nivelGases = nivelMQ135(d.ultima_lectura.mq135);

        const enAlerta = ["malo", "critico"].includes(nivelCOActual) ||
                          ["malo", "critico"].includes(nivelGases);

        const icono = crearIconoRobot(d.color || "#38bdf8", enAlerta);

        return (
          <Marker
            key={d.device_id}
            position={[d.ultima_lectura.lat, d.ultima_lectura.lng]}
            icon={icono}
          >
            <Popup>
  <div style={{ minWidth: 210 }}>
    <strong>{d.nombre || d.device_id}</strong>

    <p style={{ margin: "8px 0 2px 0" }}>
      <span style={{ fontWeight: 600, color: "#374151" }}>CO: </span>
      <span style={{ color: colorPorNivel(nivelCOActual), fontWeight: 600 }}>
        {d.ultima_lectura.co ?? "S/D"} ppm ({nivelCOActual})
      </span>
    </p>

    <p style={{ margin: "2px 0" }}>
      <span style={{ fontWeight: 600, color: "#374151" }}>Calidad del aire: </span>
      <span style={{ color: colorPorNivel(nivelGases), fontWeight: 600 }}>
        {nivelGases === "bueno" ? "Buena calidad" : nivelGases === "moderado" ? "Calidad moderada" : nivelGases === "malo" ? "Mala calidad" : nivelGases === "critico" ? "Calidad crítica" : "Sin datos"}
      </span>
    </p>

    <p style={{ margin: "8px 0 2px 0", fontSize: 11, color: "#9ca3af" }}>
      Lat: {d.ultima_lectura.lat?.toFixed(6)} | Lng: {d.ultima_lectura.lng?.toFixed(6)}
    </p>

    <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "#6b7280" }}>
      Última lectura: {new Date(d.ultima_lectura.timestamp).toLocaleString("es-PE", { timeZone: "America/Lima" })}
    </p>

    <button
      className="popup-btn-monitoreo"
      onClick={() => {
        if (!estaAutenticado) {
          alert("Inicia sesión para poder usar el monitoreo zonal.");
          return;
        }
        setMonitoreoAbierto(d.device_id);
      }}
    >
      Monitoreo zonal
    </button>
  </div>
</Popup>
          </Marker>
        );
      })}
    </MapContainer>

    {monitoreoAbierto && (
      <div className="modal-monitoreo-overlay" onClick={() => setMonitoreoAbierto(null)}>
        <div className="modal-monitoreo-contenido" onClick={(e) => e.stopPropagation()}>
          <button className="modal-monitoreo-cerrar" onClick={() => setMonitoreoAbierto(null)}>
            ✕
          </button>
          <PanelMonitoreoZonal deviceId={monitoreoAbierto} />
        </div>
      </div>
    )}
    </>
  );
}

export default Mapa;
import { useEffect, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Polyline, Circle, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import client from "../api/client";
import "../styles/PanelMonitoreoZonal.css";

const iconoInicio = new L.DivIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,.4)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const iconoActual = new L.DivIcon({
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 6px rgba(59,130,246,.8)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function formatearTiempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PanelMonitoreoZonal({ deviceId }) {
  const [estadoGps, setEstadoGps] = useState(null); // null | {listo, razon, lat, lng}
  const [verificando, setVerificando] = useState(false);
  const [monitoreo, setMonitoreo] = useState(null); // objeto monitoreo activo
  const [trazo, setTrazo] = useState([]);
  const [segundosRestantes, setSegundosRestantes] = useState(null);
  const [nombreMonitoreo, setNombreMonitoreo] = useState("");
  const [resultadoFinal, setResultadoFinal] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const intervaloRef = useRef(null);
  const resultadoRef = useRef(null);

  const detenerPolling = useCallback(() => {
    if (intervaloRef.current) {
      clearInterval(intervaloRef.current);
      intervaloRef.current = null;
    }
  }, []);

  const consultarActivo = useCallback(async () => {
    try {
      const res = await client.get(`/monitoreo/activo/${deviceId}`);
      if (res.data.activo) {
        setMonitoreo(res.data.monitoreo);
        setTrazo(res.data.trazo || []);
        setSegundosRestantes(res.data.segundos_restantes);
      } else {
        // Se cerró (manual o automáticamente)
        detenerPolling();
        if (res.data.cerrado_automaticamente) {
          setResultadoFinal(res.data.monitoreo);
        }
        setMonitoreo(null);
      }
    } catch (err) {
      console.error("Error consultando monitoreo activo:", err);
    }
  }, [deviceId, detenerPolling]);

  useEffect(() => {
    return () => detenerPolling();
  }, [detenerPolling]);

  const verificarGps = async () => {
    setVerificando(true);
    setError("");
    try {
      const res = await client.get(`/monitoreo/verificar-gps/${deviceId}`);
      setEstadoGps(res.data);
    } catch (err) {
      setError("No se pudo verificar el GPS. Revisa tu conexión.");
    } finally {
      setVerificando(false);
    }
  };

  const iniciarMonitoreo = async () => {
    setCargando(true);
    setError("");
    try {
      const res = await client.post("/monitoreo/iniciar", {
        device_id: deviceId,
        nombre: nombreMonitoreo || undefined,
      });
      setMonitoreo(res.data.monitoreo);
      setTrazo([]);
      setResultadoFinal(null);
      intervaloRef.current = setInterval(consultarActivo, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "No se pudo iniciar el monitoreo.");
    } finally {
      setCargando(false);
    }
  };

  const terminarMonitoreo = async () => {
    if (!monitoreo) return;
    setCargando(true);
    try {
      const res = await client.post(`/monitoreo/${monitoreo.id}/finalizar`);
      detenerPolling();
      setMonitoreo(null);
      setResultadoFinal(res.data.monitoreo);
    } catch (err) {
      setError("No se pudo finalizar el monitoreo.");
    } finally {
      setCargando(false);
    }
  };

  const descargarExcel = () => {
    if (!resultadoFinal) return;
    const token = localStorage.getItem("wally_token");
    const url = `${import.meta.env.VITE_API_URL}/monitoreo/${resultadoFinal.id}/exportar`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `monitoreo_zonal_${resultadoFinal.id}.xlsx`;
        link.click();
      });
  };

  const descargarPdf = async () => {
    if (!resultadoRef.current) return;
    const canvas = await html2canvas(resultadoRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const imagen = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const anchoPagina = pdf.internal.pageSize.getWidth();
    const altoImagen = (canvas.height * anchoPagina) / canvas.width;
    pdf.setFontSize(14);
    pdf.text("Reporte de Monitoreo Zonal - WALLY", 40, 30);
    pdf.addImage(imagen, "PNG", 0, 45, anchoPagina, altoImagen);
    pdf.save(`monitoreo_zonal_${resultadoFinal.id}.pdf`);
  };

  const puntoActual = trazo.length > 0 ? trazo[trazo.length - 1] : null;
  const centro = puntoActual
    ? [puntoActual.lat, puntoActual.lng]
    : estadoGps?.lat
    ? [estadoGps.lat, estadoGps.lng]
    : [-12.07, -77.06];

  return (
    <div className="panel-monitoreo">
      <div className="panel-monitoreo-header">
        <h3>Monitoreo zonal</h3>
        {monitoreo && (
          <span className="badge-activo">
            ● En curso — {segundosRestantes !== null ? formatearTiempo(segundosRestantes) : "--:--"} restantes
          </span>
        )}
      </div>

      {error && <p className="panel-monitoreo-error">{error}</p>}

      {!monitoreo && !resultadoFinal && (
        <div className="panel-monitoreo-inicio">
          <input
            type="text"
            placeholder="Nombre del monitoreo (ej: Miraflores - Av. Larco)"
            value={nombreMonitoreo}
            onChange={(e) => setNombreMonitoreo(e.target.value)}
            className="input-nombre-monitoreo"
          />

          <button className="btn-verificar-gps" onClick={verificarGps} disabled={verificando}>
            {verificando ? "Verificando..." : "Verificar señal GPS"}
          </button>

          {estadoGps && (
            <div className={`estado-gps ${estadoGps.listo ? "gps-ok" : "gps-mal"}`}>
              {estadoGps.listo
                ? "✓ GPS con señal fresca. Listo para iniciar."
                : `✗ ${estadoGps.razon}`}
            </div>
          )}

          <button
            className="btn-iniciar-monitoreo"
            onClick={iniciarMonitoreo}
            disabled={!estadoGps?.listo || cargando}
          >
            {cargando ? "Iniciando..." : "Iniciar monitoreo zonal"}
          </button>
        </div>
      )}

      {monitoreo && (
        <div className="panel-monitoreo-activo">
          <div className="mapa-monitoreo-wrapper">
            <MapContainer center={centro} zoom={16} style={{ height: 260, width: "100%", borderRadius: 8 }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              {trazo.length > 1 && (
                <Polyline
                  positions={trazo.map((p) => [p.lat, p.lng])}
                  pathOptions={{ color: "#3b82f6", weight: 4 }}
                />
              )}
              {monitoreo.lat_inicio && (
                <Marker position={[monitoreo.lat_inicio, monitoreo.lng_inicio]} icon={iconoInicio}>
                  <Popup>Inicio del monitoreo</Popup>
                </Marker>
              )}
              {puntoActual && (
                <Marker position={[puntoActual.lat, puntoActual.lng]} icon={iconoActual}>
                  <Popup>Posición actual</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          <p className="info-puntos">{trazo.length} puntos registrados</p>

          <button className="btn-terminar-monitoreo" onClick={terminarMonitoreo} disabled={cargando}>
            {cargando ? "Finalizando..." : "Terminar monitoreo zonal"}
          </button>
        </div>
      )}

      {resultadoFinal && (
        <div className="panel-monitoreo-resultado" ref={resultadoRef}>
          <h4>Resultado del monitoreo</h4>
          <div className="resultado-mapa-wrapper">
            <MapContainer
              center={[resultadoFinal.centro_lat || -12.07, resultadoFinal.centro_lng || -77.06]}
              zoom={15}
              style={{ height: 240, width: "100%", borderRadius: 8 }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              {resultadoFinal.centro_lat && (
                <Circle
                  center={[resultadoFinal.centro_lat, resultadoFinal.centro_lng]}
                  radius={resultadoFinal.radio_metros || 15}
                  pathOptions={{
                    color: resultadoFinal.color_hex || "#9ca3af",
                    fillColor: resultadoFinal.color_hex || "#9ca3af",
                    fillOpacity: 0.35,
                  }}
                />
              )}
            </MapContainer>
          </div>

          <div className="resultado-metricas">
            <div className="metrica-card" style={{ borderColor: resultadoFinal.color_hex }}>
              <span className="metrica-label">Nivel de aire</span>
              <span className="metrica-valor" style={{ color: resultadoFinal.color_hex }}>
                {resultadoFinal.nivel_color?.toUpperCase() || "SIN DATOS"}
              </span>
            </div>
            <div className="metrica-card">
              <span className="metrica-label">CO promedio</span>
              <span className="metrica-valor">{resultadoFinal.promedio_co ?? "S/D"} ppm</span>
            </div>
            <div className="metrica-card">
              <span className="metrica-label">MQ135 promedio</span>
              <span className="metrica-valor">{resultadoFinal.promedio_mq135 ?? "S/D"}</span>
            </div>
            <div className="metrica-card">
              <span className="metrica-label">PM promedio</span>
              <span className="metrica-valor">{resultadoFinal.promedio_pm ?? "S/D"} µg/m³</span>
            </div>
            <div className="metrica-card">
              <span className="metrica-label">Distancia recorrida</span>
              <span className="metrica-valor">{resultadoFinal.distancia_total_m ?? "S/D"} m</span>
            </div>
            <div className="metrica-card">
              <span className="metrica-label">Velocidad promedio</span>
              <span className="metrica-valor">{resultadoFinal.velocidad_promedio_kmh ?? "S/D"} km/h</span>
            </div>
          </div>

          <div className="resultado-botones">
            <button className="btn-descargar-excel" onClick={descargarExcel}>
              Descargar Excel
            </button>
            <button className="btn-descargar-pdf" onClick={descargarPdf}>
              Descargar PDF
            </button>
            <button
              className="btn-nuevo-monitoreo"
              onClick={() => {
                setResultadoFinal(null);
                setEstadoGps(null);
                setNombreMonitoreo("");
              }}
            >
              Nuevo monitoreo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PanelMonitoreoZonal;

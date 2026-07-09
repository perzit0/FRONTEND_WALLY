import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import TarjetaGrafico from "../components/TarjetaGrafico";
import "../styles/AdminDashboard.css";

const SECCIONES = {
  RESUMEN: "resumen",
  GRAFICOS: "graficos",
  USUARIOS: "usuarios",
  DISPOSITIVOS: "dispositivos",
  METRICAS_ADC: "metricas_adc",
  MONITOREOS: "monitoreos",
};

function AdminDashboard() {
  const [seccion, setSeccion] = useState(SECCIONES.RESUMEN);
  const [resumen, setResumen] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [deviceSeleccionado, setDeviceSeleccionado] = useState(null);
  const [lecturas, setLecturas] = useState([]);
  const [metricasAdc, setMetricasAdc] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [generandoPdf, setGenerandoPdf] = useState(false);

  const graficosRef = useRef(null);

  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const cargarResumen = async () => {
    try {
      const res = await client.get("/admin/resumen");
      setResumen(res.data);
    } catch (err) {
      setError("Error al cargar el resumen");
    }
  };

  const cargarUsuarios = async () => {
    try {
      const res = await client.get("/admin/usuarios");
      setUsuarios(res.data);
    } catch (err) {
      setError("Error al cargar usuarios");
    }
  };

  const cargarDispositivos = async () => {
    try {
      const res = await client.get("/admin/dispositivos");
      setDispositivos(res.data);
      if (res.data.length > 0 && !deviceSeleccionado) {
        setDeviceSeleccionado(res.data[0].device_id);
      }
    } catch (err) {
      setError("Error al cargar dispositivos");
    }
  };

  const cargarGraficos = async (deviceId) => {
    if (!deviceId) return;
    try {
      const res = await client.get(`/admin/graficos/${deviceId}`);
      setLecturas(res.data);
    } catch (err) {
      setError("Error al cargar gráficos");
    }
  };

  const cargarMetricasAdc = async (deviceId) => {
    if (!deviceId) return;
    try {
      const res = await client.get(`/admin/metricas-adc/${deviceId}`);
      setMetricasAdc(res.data);
    } catch (err) {
      setError("Error al cargar métricas ADC");
    }
  };

  useEffect(() => {
    const cargarTodo = async () => {
      setCargando(true);
      await Promise.all([cargarResumen(), cargarUsuarios(), cargarDispositivos()]);
      setCargando(false);
    };
    cargarTodo();
  }, []);

  useEffect(() => {
    if (deviceSeleccionado) {
      cargarGraficos(deviceSeleccionado);
      cargarMetricasAdc(deviceSeleccionado);
    }
  }, [deviceSeleccionado]);

  const descargarBlob = (blob, nombreArchivo) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", nombreArchivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const exportarHistorial = async () => {
    if (!deviceSeleccionado) return;
    try {
      const res = await client.get(`/admin/exportar/historial/${deviceSeleccionado}`, {
        responseType: "blob",
      });
      descargarBlob(res.data, `historial_${deviceSeleccionado}.xlsx`);
    } catch (err) {
      setError("Error al exportar historial");
    }
  };

  const exportarUsuarios = async () => {
    try {
      const res = await client.get("/admin/exportar/usuarios", { responseType: "blob" });
      descargarBlob(res.data, "usuarios_wally.xlsx");
    } catch (err) {
      setError("Error al exportar usuarios");
    }
  };

  const exportarGraficosPdf = async () => {
    if (!graficosRef.current) return;
    setGenerandoPdf(true);
    try {
      const canvas = await html2canvas(graficosRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const imagen = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const anchoPagina = pdf.internal.pageSize.getWidth();
      const altoImagen = (canvas.height * anchoPagina) / canvas.width;
      pdf.setFontSize(14);
      pdf.text(`Reporte de sensores - ${deviceSeleccionado}`, 40, 30);
      pdf.addImage(imagen, "PNG", 0, 45, anchoPagina, altoImagen);
      pdf.save(`graficos_${deviceSeleccionado}.pdf`);
    } finally {
      setGenerandoPdf(false);
    }
  };

  const labelsLecturas = lecturas.map((l) =>
    new Date(l.timestamp).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  const ultimaLectura = lecturas[lecturas.length - 1];

  if (cargando) {
    return <div className="admin-loading">Cargando panel...</div>;
  }

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>WALLY Admin</h2>
          <p>{usuario?.nombre}</p>
        </div>

        <nav className="admin-nav">
          <button
            className={seccion === SECCIONES.RESUMEN ? "activo" : ""}
            onClick={() => setSeccion(SECCIONES.RESUMEN)}
          >
            Resumen
          </button>
          <button
            className={seccion === SECCIONES.GRAFICOS ? "activo" : ""}
            onClick={() => setSeccion(SECCIONES.GRAFICOS)}
          >
            Gráficos
          </button>
          <button
            className={seccion === SECCIONES.METRICAS_ADC ? "activo" : ""}
            onClick={() => setSeccion(SECCIONES.METRICAS_ADC)}
          >
            Métricas ADC
          </button>
          <button
            className={seccion === SECCIONES.DISPOSITIVOS ? "activo" : ""}
            onClick={() => setSeccion(SECCIONES.DISPOSITIVOS)}
          >
            Dispositivos
          </button>
          <button
            className={seccion === SECCIONES.USUARIOS ? "activo" : ""}
            onClick={() => setSeccion(SECCIONES.USUARIOS)}
          >
            Usuarios
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-btn-mapa" onClick={() => navigate("/")}>
            Ver mapa público
          </button>
          <button className="admin-btn-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="admin-content">
        {error && <div className="admin-error">{error}</div>}

        {seccion === SECCIONES.RESUMEN && resumen && (
          <div className="admin-resumen">
            <h1>Resumen general</h1>
            <div className="admin-cards">
              <div className="admin-card">
                <span className="admin-card-numero">{resumen.total_usuarios}</span>
                <span className="admin-card-label">Usuarios registrados</span>
              </div>
              <div className="admin-card">
                <span className="admin-card-numero">{resumen.total_dispositivos}</span>
                <span className="admin-card-label">Dispositivos activos</span>
              </div>
              <div className="admin-card">
                <span className="admin-card-numero">{resumen.total_lecturas}</span>
                <span className="admin-card-label">Lecturas totales</span>
              </div>
            </div>
          </div>
        )}

        {seccion === SECCIONES.GRAFICOS && (
          <div className="admin-graficos">
            <h1>Gráficos históricos</h1>

            <div className="admin-selector">
              <label>Dispositivo:</label>
              <select
                value={deviceSeleccionado || ""}
                onChange={(e) => setDeviceSeleccionado(e.target.value)}
              >
                {dispositivos.map((d) => (
                  <option key={d.device_id} value={d.device_id}>
                    {d.nombre || d.device_id}
                  </option>
                ))}
              </select>
              <button onClick={exportarHistorial} className="admin-btn-exportar">
                Excel
              </button>
              <button onClick={exportarGraficosPdf} className="admin-btn-exportar" disabled={generandoPdf}>
                {generandoPdf ? "Generando..." : "PDF"}
              </button>
            </div>

            {lecturas.length > 0 ? (
              <div className="admin-grid-graficos" ref={graficosRef}>
                <TarjetaGrafico
                  titulo="Monóxido de carbono"
                  subtitulo="Sensor MQ-7"
                  color="#ef4444"
                  unidad="ppm"
                  labels={labelsLecturas}
                  valores={lecturas.map((l) => l.co)}
                  valorActual={ultimaLectura?.co}
                  alto={200}
                />
                <TarjetaGrafico
                  titulo="Calidad del aire"
                  subtitulo="Sensor MQ-135"
                  color="#3b82f6"
                  unidad="ppm"
                  labels={labelsLecturas}
                  valores={lecturas.map((l) => l.mq135)}
                  valorActual={ultimaLectura?.mq135}
                  alto={200}
                />
              </div>
            ) : (
              <p className="admin-sin-datos">No hay lecturas para este dispositivo</p>
            )}
          </div>
        )}

        {seccion === SECCIONES.METRICAS_ADC && (
          <div className="admin-graficos">
            <h1>Métricas crudas ADC (0-4095)</h1>

            <div className="admin-selector">
              <label>Dispositivo:</label>
              <select
                value={deviceSeleccionado || ""}
                onChange={(e) => setDeviceSeleccionado(e.target.value)}
              >
                {dispositivos.map((d) => (
                  <option key={d.device_id} value={d.device_id}>
                    {d.nombre || d.device_id}
                  </option>
                ))}
              </select>
            </div>

            {metricasAdc ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <TablaMetricaAdc titulo="MQ-7 (CO)" stats={metricasAdc.mq7} />
                <TablaMetricaAdc titulo="MQ-135 (Calidad del aire)" stats={metricasAdc.mq135} />
              </div>
            ) : (
              <p className="admin-sin-datos">Cargando métricas...</p>
            )}
          </div>
        )}

        {seccion === SECCIONES.DISPOSITIVOS && (
          <div className="admin-tabla-seccion">
            <h1>Dispositivos</h1>
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Nombre</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {dispositivos.map((d) => (
                  <tr key={d.id}>
                    <td>{d.device_id}</td>
                    <td>{d.nombre || "-"}</td>
                    <td>
                      {d.creado_en
                        ? new Date(d.creado_en).toLocaleDateString("es-PE", { timeZone: "America/Lima" })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {seccion === SECCIONES.USUARIOS && (
          <div className="admin-tabla-seccion">
            <div className="admin-tabla-header">
              <h1>Usuarios</h1>
              <button onClick={exportarUsuarios} className="admin-btn-exportar">
                Exportar (Excel)
              </button>
            </div>
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Verificado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge ${u.rol === "admin" ? "admin-badge-admin" : ""}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td>{u.email_verificado ? "Sí" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function TablaMetricaAdc({ titulo, stats }) {
  if (!stats) {
    return (
      <div className="admin-chart-wrapper">
        <h3>{titulo}</h3>
        <p className="admin-sin-datos">Sin datos suficientes</p>
      </div>
    );
  }

  return (
    <div className="admin-chart-wrapper">
      <h3>{titulo}</h3>
      <table className="admin-tabla">
        <thead>
          <tr>
            <th>Métrica</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Media (cuentas ADC)</td>
            <td>{stats.media}</td>
          </tr>
          <tr>
            <td>Rango (min - max)</td>
            <td>{stats.minimo} - {stats.maximo}</td>
          </tr>
          <tr>
            <td>Desviación estándar</td>
            <td>±{stats.desviacion_estandar}</td>
          </tr>
          <tr>
            <td>Muestras analizadas</td>
            <td>{stats.muestras}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;

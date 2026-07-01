import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import "../styles/AdminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const SECCIONES = {
  RESUMEN: "resumen",
  MAPA: "mapa",
  GRAFICOS: "graficos",
  USUARIOS: "usuarios",
  DISPOSITIVOS: "dispositivos",
};

function AdminDashboard() {
  const [seccion, setSeccion] = useState(SECCIONES.RESUMEN);
  const [resumen, setResumen] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [deviceSeleccionado, setDeviceSeleccionado] = useState(null);
  const [lecturas, setLecturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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
    }
  }, [deviceSeleccionado]);

  const exportarHistorial = async () => {
    if (!deviceSeleccionado) return;
    try {
      const res = await client.get(`/admin/exportar/historial/${deviceSeleccionado}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `historial_${deviceSeleccionado}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Error al exportar historial");
    }
  };

  const exportarUsuarios = async () => {
    try {
      const res = await client.get("/admin/exportar/usuarios", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "usuarios_wally.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Error al exportar usuarios");
    }
  };

  const datosGrafico = {
    labels: lecturas.map((l) => new Date(l.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: "CO (ppm)",
        data: lecturas.map((l) => l.co),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        tension: 0.3,
      },
      {
        label: "MQ135",
        data: lecturas.map((l) => l.mq135),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.3,
      },
      {
        label: "PM (µg/m³)",
        data: lecturas.map((l) => l.pm),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.15)",
        tension: 0.3,
      },
    ],
  };

  const opcionesGrafico = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: "#f1f5f9" } },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" } },
      y: { ticks: { color: "#94a3b8" } },
    },
  };

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
                Exportar historial (Excel)
              </button>
            </div>

            {lecturas.length > 0 ? (
              <div className="admin-chart-wrapper">
                <Line data={datosGrafico} options={opcionesGrafico} />
              </div>
            ) : (
              <p className="admin-sin-datos">No hay lecturas para este dispositivo</p>
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
                    <td>{new Date(d.creado_en).toLocaleDateString()}</td>
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

export default AdminDashboard;
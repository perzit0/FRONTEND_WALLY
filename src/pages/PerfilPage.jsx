import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/PerfilPage.css";

const COLORES = ["#38bdf8", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];

const SECCIONES = {
  CUENTA: "cuenta",
  ROBOTS: "robots",
  SEGURIDAD: "seguridad",
};

function PerfilPage() {
  const navigate = useNavigate();
  const {
    usuario,
    estaAutenticado,
    cargando,
    logout,
    actualizarNombre,
    cambiarPassword,
    misDispositivos,
    vincularDispositivo,
    editarDispositivo,
    desvincularDispositivo,
    exportarMisDatos,
  } = useAuth();

  const [seccion, setSeccion] = useState(SECCIONES.CUENTA);

  // Cuenta
  const [nombre, setNombre] = useState("");
  const [mensajeNombre, setMensajeNombre] = useState("");
  const [errorNombre, setErrorNombre] = useState("");

  // Seguridad
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [mensajePassword, setMensajePassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  // Robots
  const [robots, setRobots] = useState([]);
  const [nuevoDeviceId, setNuevoDeviceId] = useState("");
  const [editando, setEditando] = useState(null);
  const [errorRobots, setErrorRobots] = useState("");
  const [mensajeRobots, setMensajeRobots] = useState("");

  useEffect(() => {
    if (!cargando && !estaAutenticado) {
      navigate("/");
    }
  }, [cargando, estaAutenticado]);

  useEffect(() => {
    if (usuario) setNombre(usuario.nombre);
  }, [usuario]);

  const cargarRobots = async () => {
    try {
      const data = await misDispositivos();
      setRobots(data);
    } catch (err) {
      setErrorRobots("Error al cargar tus robots");
    }
  };

  useEffect(() => {
    if (estaAutenticado) cargarRobots();
  }, [estaAutenticado]);

  const guardarNombre = async (e) => {
    e.preventDefault();
    setErrorNombre("");
    setMensajeNombre("");
    try {
      await actualizarNombre(nombre);
      setMensajeNombre("Nombre actualizado correctamente");
    } catch (err) {
      setErrorNombre(err.response?.data?.error || "Error al actualizar");
    }
  };

  const guardarPassword = async (e) => {
    e.preventDefault();
    setErrorPassword("");
    setMensajePassword("");
    try {
      await cambiarPassword(passwordActual, passwordNueva);
      setMensajePassword("Contraseña actualizada correctamente");
      setPasswordActual("");
      setPasswordNueva("");
    } catch (err) {
      setErrorPassword(err.response?.data?.error || "Error al cambiar la contraseña");
    }
  };

  const manejarVincular = async (e) => {
    e.preventDefault();
    setErrorRobots("");
    setMensajeRobots("");
    try {
      await vincularDispositivo(nuevoDeviceId.trim());
      setMensajeRobots("Robot vinculado con éxito");
      setNuevoDeviceId("");
      cargarRobots();
    } catch (err) {
      setErrorRobots(err.response?.data?.error || "Error al vincular");
    }
  };

  const guardarEdicionRobot = async (device_id, nombreRobot, color) => {
    try {
      await editarDispositivo(device_id, { nombre: nombreRobot, color });
      setEditando(null);
      cargarRobots();
    } catch (err) {
      setErrorRobots(err.response?.data?.error || "Error al actualizar el robot");
    }
  };

  const manejarDesvincular = async (device_id) => {
    if (!confirm("¿Desvincular este robot de tu cuenta?")) return;
    try {
      await desvincularDispositivo(device_id);
      cargarRobots();
    } catch (err) {
      setErrorRobots("Error al desvincular");
    }
  };

  if (cargando || !usuario) return <div className="perfil-page-loading">Cargando...</div>;

  return (
    <div className="perfil-page">
      <header className="perfil-page-header">
        <button className="perfil-page-volver" onClick={() => navigate("/")}>
          ← Volver al mapa
        </button>
        <h1>Mi perfil</h1>
      </header>

      <div className="perfil-page-body">
        <aside className="perfil-page-nav">
          <button
            className={seccion === SECCIONES.CUENTA ? "activo" : ""}
            onClick={() => setSeccion(SECCIONES.CUENTA)}
          >
            Cuenta
          </button>
          <button
            className={seccion === SECCIONES.ROBOTS ? "activo" : ""}
            onClick={() => setSeccion(SECCIONES.ROBOTS)}
          >
            Mis robots
          </button>
          <button
            className={seccion === SECCIONES.SEGURIDAD ? "activo" : ""}
            onClick={() => setSeccion(SECCIONES.SEGURIDAD)}
          >
            Seguridad
          </button>
          {usuario.rol === "admin" && (
            <button onClick={() => navigate("/admin")} className="perfil-page-admin-link">
              Dashboard Admin
            </button>
          )}
          <button className="perfil-page-logout" onClick={logout}>
            Cerrar sesión
          </button>
        </aside>

        <main className="perfil-page-content">
          {seccion === SECCIONES.CUENTA && (
            <div className="perfil-seccion">
              <h2>Información de la cuenta</h2>
              <p className="perfil-seccion-subtexto">{usuario.email}</p>

              {errorNombre && <div className="perfil-page-error">{errorNombre}</div>}
              {mensajeNombre && <div className="perfil-page-mensaje">{mensajeNombre}</div>}

              <form onSubmit={guardarNombre} className="perfil-page-form">
                <label>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
                <button type="submit">Guardar cambios</button>
              </form>
            </div>
          )}

          {seccion === SECCIONES.ROBOTS && (
            <div className="perfil-seccion">
              <h2>Mis robots</h2>

              {errorRobots && <div className="perfil-page-error">{errorRobots}</div>}
              {mensajeRobots && <div className="perfil-page-mensaje">{mensajeRobots}</div>}

              <form onSubmit={manejarVincular} className="perfil-page-form-inline">
                <input
                  type="text"
                  placeholder="ID del robot (ej. ESP32_WALLY_01)"
                  value={nuevoDeviceId}
                  onChange={(e) => setNuevoDeviceId(e.target.value)}
                  required
                />
                <button type="submit">Vincular robot</button>
              </form>

              {robots.length === 0 && (
                <p className="perfil-seccion-subtexto">No tienes robots vinculados todavía</p>
              )}

              <div className="perfil-page-robots-lista">
                {robots.map((r) => (
                  <div key={r.device_id} className="perfil-page-robot-card">
                    {editando === r.device_id ? (
                      <EditorRobotPage
                        robot={r}
                        onGuardar={(n, c) => guardarEdicionRobot(r.device_id, n, c)}
                        onCancelar={() => setEditando(null)}
                      />
                    ) : (
                      <>
                        <div className="perfil-page-robot-info">
                          <span
                            className="perfil-page-robot-color"
                            style={{ backgroundColor: r.color }}
                          ></span>
                          <div>
                            <p className="perfil-page-robot-nombre">{r.nombre || r.device_id}</p>
                            <p className="perfil-page-robot-id">{r.device_id}</p>
                          </div>
                        </div>
                        <div className="perfil-page-robot-acciones">
                          <button onClick={() => setEditando(r.device_id)}>Editar</button>
                          <button onClick={async () => {
  try {
    await exportarMisDatos(r.device_id);
  } catch (err) {
    alert("Error al descargar: " + (err.response?.status === 403 ? "no tienes permiso sobre este robot" : "intenta de nuevo"));
    console.error(err);
  }
}}>
  Descargar datos
</button>
                          <button
                            onClick={() => manejarDesvincular(r.device_id)}
                            className="perfil-page-btn-quitar"
                          >
                            Desvincular
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {seccion === SECCIONES.SEGURIDAD && (
            <div className="perfil-seccion">
              <h2>Cambiar contraseña</h2>

              {errorPassword && <div className="perfil-page-error">{errorPassword}</div>}
              {mensajePassword && <div className="perfil-page-mensaje">{mensajePassword}</div>}

              <form onSubmit={guardarPassword} className="perfil-page-form">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  required
                />
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="submit">Actualizar contraseña</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function EditorRobotPage({ robot, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(robot.nombre || "");
  const [color, setColor] = useState(robot.color);

  return (
    <div className="perfil-page-editor-robot">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del robot"
      />
      <div className="perfil-page-colores">
        {COLORES.map((c) => (
          <button
            key={c}
            type="button"
            className={`perfil-page-swatch ${color === c ? "seleccionado" : ""}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>
      <div className="perfil-page-editor-botones">
        <button onClick={() => onGuardar(nombre, color)}>Guardar</button>
        <button onClick={onCancelar} className="perfil-page-btn-cancelar">Cancelar</button>
      </div>
    </div>
  );
}

export default PerfilPage;
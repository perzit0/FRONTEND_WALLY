import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/PerfilPanel.css";

const COLORES = ["#38bdf8", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#ec4899"];

function PerfilPanel({ onClose }) {
  const { usuario, logout, misDispositivos, vincularDispositivo, editarDispositivo, desvincularDispositivo } = useAuth();
  const [robots, setRobots] = useState([]);
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [nuevoDeviceId, setNuevoDeviceId] = useState("");
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const cargarRobots = async () => {
    try {
      const data = await misDispositivos();
      setRobots(data);
    } catch (err) {
      setError("Error al cargar tus robots");
    }
  };

  useEffect(() => {
    cargarRobots();
  }, []);

  const manejarVincular = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");
    try {
      await vincularDispositivo(nuevoDeviceId.trim());
      setMensaje("¡Robot vinculado con éxito!");
      setNuevoDeviceId("");
      setMostrarAgregar(false);
      cargarRobots();
    } catch (err) {
      setError(err.response?.data?.error || "Error al vincular el robot");
    }
  };

  const manejarGuardarEdicion = async (device_id, nombre, color) => {
    setError("");
    try {
      await editarDispositivo(device_id, { nombre, color });
      setEditando(null);
      cargarRobots();
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el robot");
    }
  };

  const manejarDesvincular = async (device_id) => {
    if (!confirm("¿Desvincular este robot de tu cuenta?")) return;
    try {
      await desvincularDispositivo(device_id);
      cargarRobots();
    } catch (err) {
      setError("Error al desvincular");
    }
  };

  return (
    <div className="perfil-panel" onClick={(e) => e.stopPropagation()}>
      <div className="perfil-header">
        <p className="perfil-nombre">{usuario.nombre}</p>
        <p className="perfil-email">{usuario.email}</p>
      </div>

      {usuario.rol === "admin" && (
        <a href="/admin" className="perfil-link-admin">Ir al Dashboard Admin</a>
      )}

      {error && <div className="perfil-error">{error}</div>}
      {mensaje && <div className="perfil-mensaje">{mensaje}</div>}

      <div className="perfil-robots">
        <div className="perfil-robots-titulo">
          <span>Mis robots</span>
          <button onClick={() => setMostrarAgregar(!mostrarAgregar)}>+ Añadir robot</button>
        </div>

        {mostrarAgregar && (
          <form onSubmit={manejarVincular} className="perfil-form-vincular">
            <input
              type="text"
              placeholder="ID del robot (ej. ESP32_WALLY_01)"
              value={nuevoDeviceId}
              onChange={(e) => setNuevoDeviceId(e.target.value)}
              required
            />
            <button type="submit">Vincular</button>
          </form>
        )}

        {robots.length === 0 && <p className="perfil-sin-robots">No tienes robots vinculados</p>}

        {robots.map((r) => (
          <div key={r.device_id} className="perfil-robot-item">
            {editando === r.device_id ? (
              <EditorRobot
                robot={r}
                onGuardar={(nombre, color) => manejarGuardarEdicion(r.device_id, nombre, color)}
                onCancelar={() => setEditando(null)}
              />
            ) : (
              <>
                <div className="perfil-robot-info">
                  <span className="perfil-robot-color" style={{ backgroundColor: r.color }}></span>
                  <span>{r.nombre || r.device_id}</span>
                </div>
                <div className="perfil-robot-acciones">
                  <button onClick={() => setEditando(r.device_id)}>Editar</button>
                  <button onClick={() => manejarDesvincular(r.device_id)} className="perfil-btn-quitar">
                    Quitar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <button className="perfil-logout" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}

function EditorRobot({ robot, onGuardar, onCancelar }) {
  const [nombre, setNombre] = useState(robot.nombre || "");
  const [color, setColor] = useState(robot.color);

  return (
    <div className="editor-robot">
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del robot"
      />
      <div className="editor-robot-colores">
        {COLORES.map((c) => (
          <button
            key={c}
            className={`editor-color-swatch ${color === c ? "seleccionado" : ""}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
            type="button"
          />
        ))}
      </div>
      <div className="editor-robot-botones">
        <button onClick={() => onGuardar(nombre, color)}>Guardar</button>
        <button onClick={onCancelar} className="editor-btn-cancelar">Cancelar</button>
      </div>
    </div>
  );
}

export default PerfilPanel;
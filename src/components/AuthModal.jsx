import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/AuthModal.css";

const VISTAS = {
  LOGIN: "login",
  REGISTRO: "registro",
  VERIFICAR: "verificar",
  OLVIDE: "olvide",
  RESET: "reset",
};

function AuthModal({ onClose }) {
  const [vista, setVista] = useState(VISTAS.LOGIN);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    codigo: "",
    nuevaPassword: "",
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const { login, registro, verificarCodigo, reenviarCodigo, olvidePassword, resetearPassword } = useAuth();
  const navigate = useNavigate();

  const actualizar = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const limpiarMensajes = () => {
    setError("");
    setMensaje("");
  };

  const manejarLogin = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    setCargando(true);
    try {
      const usuarioData = await login(form.email, form.password);
      onClose();
      if (usuarioData.rol === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    setCargando(true);
    try {
      await registro(form.nombre, form.email, form.password);
      setMensaje("Te enviamos un código a tu correo");
      setVista(VISTAS.VERIFICAR);
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar");
    } finally {
      setCargando(false);
    }
  };

  const manejarVerificar = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    setCargando(true);
    try {
      await verificarCodigo(form.email, form.codigo);
      setMensaje("Cuenta verificada. Ahora inicia sesión");
      setVista(VISTAS.LOGIN);
    } catch (err) {
      setError(err.response?.data?.error || "Código inválido");
    } finally {
      setCargando(false);
    }
  };

  const manejarReenviar = async () => {
    limpiarMensajes();
    try {
      await reenviarCodigo(form.email);
      setMensaje("Código reenviado");
    } catch (err) {
      setError(err.response?.data?.error || "Espera antes de reenviar");
    }
  };

  const manejarOlvide = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    setCargando(true);
    try {
      await olvidePassword(form.email);
      setMensaje("Si el correo existe, recibirás un código");
      setVista(VISTAS.RESET);
    } catch (err) {
      setError("Error al procesar la solicitud");
    } finally {
      setCargando(false);
    }
  };

  const manejarReset = async (e) => {
    e.preventDefault();
    limpiarMensajes();
    setCargando(true);
    try {
      await resetearPassword(form.email, form.codigo, form.nuevaPassword);
      setMensaje("Contraseña actualizada. Ahora inicia sesión");
      setVista(VISTAS.LOGIN);
    } catch (err) {
      setError(err.response?.data?.error || "Código inválido o expirado");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
      {error && <div className="auth-modal-error">{error}</div>}
      {mensaje && <div className="auth-modal-mensaje">{mensaje}</div>}

      {vista === VISTAS.LOGIN && (
        <form onSubmit={manejarLogin} className="auth-form">
          <h3>Iniciar sesión</h3>
          <input
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={(e) => actualizar("email", e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => actualizar("password", e.target.value)}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
          <div className="auth-links">
            <span onClick={() => { limpiarMensajes(); setVista(VISTAS.REGISTRO); }}>Crear cuenta</span>
            <span onClick={() => { limpiarMensajes(); setVista(VISTAS.OLVIDE); }}>Olvidé mi contraseña</span>
          </div>
        </form>
      )}

      {vista === VISTAS.REGISTRO && (
        <form onSubmit={manejarRegistro} className="auth-form">
          <h3>Crear cuenta</h3>
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={(e) => actualizar("email", e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={(e) => actualizar("password", e.target.value)}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarme"}
          </button>
          <div className="auth-links">
            <span onClick={() => { limpiarMensajes(); setVista(VISTAS.LOGIN); }}>Ya tengo cuenta</span>
          </div>
        </form>
      )}

      {vista === VISTAS.VERIFICAR && (
        <form onSubmit={manejarVerificar} className="auth-form">
          <h3>Verifica tu correo</h3>
          <p className="auth-form-subtexto">Enviamos un código a {form.email}</p>
          <input
            type="text"
            placeholder="Código de 6 dígitos"
            value={form.codigo}
            onChange={(e) => actualizar("codigo", e.target.value)}
            maxLength={6}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? "Verificando..." : "Verificar"}
          </button>
          <div className="auth-links">
            <span onClick={manejarReenviar}>Reenviar código</span>
          </div>
        </form>
      )}

      {vista === VISTAS.OLVIDE && (
        <form onSubmit={manejarOlvide} className="auth-form">
          <h3>Recuperar contraseña</h3>
          <input
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={(e) => actualizar("email", e.target.value)}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? "Enviando..." : "Enviar código"}
          </button>
          <div className="auth-links">
            <span onClick={() => { limpiarMensajes(); setVista(VISTAS.LOGIN); }}>Volver a iniciar sesión</span>
          </div>
        </form>
      )}

      {vista === VISTAS.RESET && (
        <form onSubmit={manejarReset} className="auth-form">
          <h3>Nueva contraseña</h3>
          <input
            type="text"
            placeholder="Código recibido"
            value={form.codigo}
            onChange={(e) => actualizar("codigo", e.target.value)}
            maxLength={6}
            required
          />
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={form.nuevaPassword}
            onChange={(e) => actualizar("nuevaPassword", e.target.value)}
            required
          />
          <button type="submit" disabled={cargando}>
            {cargando ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AuthModal;
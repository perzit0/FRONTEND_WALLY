import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/ConfiguracionPage.css";

function redimensionarImagen(archivo, maxAncho = 300) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, maxAncho / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * escala;
        canvas.height = img.height * escala;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

function ConfiguracionPage() {
  const navigate = useNavigate();
  const {
    usuario,
    actualizarNombre,
    actualizarFoto,
    eliminarFoto,
    solicitarCambioPassword,
    confirmarCambioPassword,
  } = useAuth();

  const inputFotoRef = useRef(null);

  const [nombre, setNombre] = useState(usuario?.nombre || "");
  const [mensajeNombre, setMensajeNombre] = useState("");
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState("");

  const [pasoPassword, setPasoPassword] = useState("inicial"); // inicial | codigo_enviado
  const [codigo, setCodigo] = useState("");
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [mensajePassword, setMensajePassword] = useState("");

  const manejarCambioFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setErrorFoto("");
    setSubiendoFoto(true);
    try {
      const dataUrl = await redimensionarImagen(archivo);
      await actualizarFoto(dataUrl);
    } catch (err) {
      setErrorFoto(err.response?.data?.error || "No se pudo subir la foto");
    } finally {
      setSubiendoFoto(false);
    }
  };

  const manejarEliminarFoto = async () => {
    try {
      await eliminarFoto();
    } catch (err) {
      setErrorFoto("No se pudo eliminar la foto");
    }
  };

  const guardarNombre = async (e) => {
    e.preventDefault();
    setMensajeNombre("");
    try {
      await actualizarNombre(nombre);
      setMensajeNombre("Nombre actualizado correctamente");
    } catch (err) {
      setMensajeNombre(err.response?.data?.error || "No se pudo actualizar el nombre");
    }
  };

  const enviarCodigoPassword = async () => {
    setMensajePassword("");
    try {
      await solicitarCambioPassword();
      setPasoPassword("codigo_enviado");
      setMensajePassword("Te enviamos un código a tu correo");
    } catch (err) {
      setMensajePassword(err.response?.data?.error || "No se pudo enviar el código");
    }
  };

  const confirmarPassword = async (e) => {
    e.preventDefault();
    setMensajePassword("");
    try {
      await confirmarCambioPassword(codigo, passwordActual, passwordNueva);
      setMensajePassword("Contraseña actualizada correctamente");
      setPasoPassword("inicial");
      setCodigo("");
      setPasswordActual("");
      setPasswordNueva("");
    } catch (err) {
      setMensajePassword(err.response?.data?.error || "No se pudo actualizar la contraseña");
    }
  };

  return (
    <div className="config-page">
      <header className="config-page-header">
        <button className="config-page-volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1>Configuración</h1>
        <p>Administra tu cuenta y tu perfil</p>
      </header>

      <div className="config-page-grid">
        {/* Foto de perfil */}
        <section className="config-card">
          <h2>Foto de perfil</h2>
          <div className="config-foto-wrapper">
            <div className="config-foto-preview">
              {usuario?.foto_base64 ? (
                <img src={usuario.foto_base64} alt="Foto de perfil" />
              ) : (
                <span>{usuario?.nombre?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="config-foto-acciones">
              <button
                className="config-btn-primario"
                onClick={() => inputFotoRef.current?.click()}
                disabled={subiendoFoto}
              >
                {subiendoFoto ? "Subiendo..." : "Cambiar foto"}
              </button>
              {usuario?.foto_base64 && (
                <button className="config-btn-secundario" onClick={manejarEliminarFoto}>
                  Quitar foto
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={inputFotoRef}
                onChange={manejarCambioFoto}
                style={{ display: "none" }}
              />
            </div>
          </div>
          {errorFoto && <p className="config-mensaje-error">{errorFoto}</p>}
        </section>

        {/* Nombre */}
        <section className="config-card">
          <h2>Datos de la cuenta</h2>
          <form onSubmit={guardarNombre} className="config-form">
            <label>Nombre</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <button type="submit" className="config-btn-primario">
              Guardar nombre
            </button>
            {mensajeNombre && <p className="config-mensaje">{mensajeNombre}</p>}
          </form>
          <p className="config-email-fijo">{usuario?.email}</p>
        </section>

        {/* Contraseña */}
        <section className="config-card">
          <h2>Seguridad</h2>
          {pasoPassword === "inicial" ? (
            <button className="config-btn-primario" onClick={enviarCodigoPassword}>
              Cambiar contraseña
            </button>
          ) : (
            <form onSubmit={confirmarPassword} className="config-form">
              <label>Código recibido por correo</label>
              <input type="text" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
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
              />
              <button type="submit" className="config-btn-primario">
                Confirmar cambio
              </button>
            </form>
          )}
          {mensajePassword && <p className="config-mensaje">{mensajePassword}</p>}
        </section>
      </div>
    </div>
  );
}

export default ConfiguracionPage;

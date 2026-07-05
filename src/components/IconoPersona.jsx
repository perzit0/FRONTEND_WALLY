import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import PerfilPanel from "./PerfilPanel";
import "../styles/IconoPersona.css";

function IconoPersona() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const { usuario, estaAutenticado } = useAuth();

  return (
    <div className="icono-persona-wrapper">
      <button
        className="icono-persona-btn"
        onClick={() => setModalAbierto(!modalAbierto)}
        title={estaAutenticado ? usuario.nombre : "Iniciar sesión"}
      >
        {estaAutenticado && usuario.foto_base64 ? (
          <img src={usuario.foto_base64} alt={usuario.nombre} className="icono-persona-foto" />
        ) : estaAutenticado ? (
          usuario.nombre.charAt(0).toUpperCase()
        ) : (
          "👤"
        )}
      </button>

      {modalAbierto && !estaAutenticado && (
        <AuthModal onClose={() => setModalAbierto(false)} />
      )}

      {modalAbierto && estaAutenticado && (
        <PerfilPanel onClose={() => setModalAbierto(false)} />
      )}
    </div>
  );
}

export default IconoPersona;

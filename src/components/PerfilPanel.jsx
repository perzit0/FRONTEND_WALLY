import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/PerfilPanel.css";

function PerfilPanel({ onClose }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="perfil-panel" onClick={(e) => e.stopPropagation()}>
      <div className="perfil-header">
        <p className="perfil-nombre">{usuario.nombre}</p>
        <p className="perfil-email">{usuario.email}</p>
      </div>

      <button
        className="perfil-link-admin"
        onClick={() => {
          navigate("/perfil");
          onClose();
        }}
      >
        Ir a mi perfil
      </button>

      {usuario.rol === "admin" && (
        <a href="/admin" className="perfil-link-admin" style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
          Dashboard Admin
        </a>
      )}

      <button className="perfil-logout" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default PerfilPanel;
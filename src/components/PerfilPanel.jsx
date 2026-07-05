import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/PerfilPanel.css";

function PerfilPanel({ onClose }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const ir = (ruta) => {
    navigate(ruta);
    onClose();
  };

  return (
    <div className="perfil-panel" onClick={(e) => e.stopPropagation()}>
      <div className="perfil-header">
        <div className="perfil-header-foto">
          {usuario.foto_base64 ? (
            <img src={usuario.foto_base64} alt={usuario.nombre} />
          ) : (
            <span>{usuario.nombre.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div>
          <p className="perfil-nombre">{usuario.nombre}</p>
          <p className="perfil-email">{usuario.email}</p>
        </div>
      </div>

      <button className="perfil-link-admin" onClick={() => ir("/perfil")}>
        👤 Mi perfil y robots
      </button>

      <button className="perfil-link-admin" onClick={() => ir("/graficos")}>
        📊 Gráficos
      </button>

      <button className="perfil-link-admin" onClick={() => ir("/configuracion")}>
        ⚙️ Configuración
      </button>

      {usuario.rol === "admin" && (
        <button className="perfil-link-admin" onClick={() => ir("/admin")}>
          🛠 Dashboard Admin
        </button>
      )}

      <button className="perfil-logout" onClick={logout}>
        Cerrar sesión
      </button>
    </div>
  );
}

export default PerfilPanel;

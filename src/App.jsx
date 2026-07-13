import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import PerfilPage from "./pages/PerfilPage";
import GraficosPage from "./pages/GraficosPage";
import ConfiguracionPage from "./pages/ConfiguracionPage";
import AlarmasPush from "./components/AlarmasPush";

function RutaAdmin({ children }) {
  const { estaAutenticado, esAdmin, cargando } = useAuth();

  if (cargando) return <div>Cargando...</div>;

  if (!estaAutenticado || !esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RutaPrivada({ children }) {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) return <div>Cargando...</div>;

  if (!estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <>
      <AlarmasPush />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/perfil" element={<PerfilPage />} />
      <Route
        path="/graficos"
        element={
          <RutaPrivada>
            <GraficosPage />
          </RutaPrivada>
        }
      />
      <Route
        path="/configuracion"
        element={
          <RutaPrivada>
            <ConfiguracionPage />
          </RutaPrivada>
        }
      />
      <Route
        path="/admin"
        element={
          <RutaAdmin>
            <AdminDashboard />
          </RutaAdmin>
        }
      />
      </Routes>
    </>
  );
}

export default App;
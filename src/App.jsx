import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import PerfilPage from "./pages/PerfilPage";

function RutaAdmin({ children }) {
  const { estaAutenticado, esAdmin, cargando } = useAuth();

  if (cargando) return <div>Cargando...</div>;

  if (!estaAutenticado || !esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/perfil" element={<PerfilPage />} />
      <Route
        path="/admin"
        element={
          <RutaAdmin>
            <AdminDashboard />
          </RutaAdmin>
        }
      />
    </Routes>
  );
}

export default App;
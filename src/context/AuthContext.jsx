import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("wally_token");
    const usuarioGuardado = localStorage.getItem("wally_usuario");

    if (token && usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
    setCargando(false);
  }, []);

  // ==================== AUTENTICACIÓN ====================

  const login = async (email, password) => {
    const res = await client.post("/auth/login", { email, password });
    const { token, usuario: usuarioData } = res.data;

    localStorage.setItem("wally_token", token);
    localStorage.setItem("wally_usuario", JSON.stringify(usuarioData));
    setUsuario(usuarioData);

    return usuarioData;
  };

  const registro = async (nombre, email, password) => {
    const res = await client.post("/auth/registro", { nombre, email, password });
    return res.data;
  };

  const verificarCodigo = async (email, codigo) => {
    const res = await client.post("/auth/verificar-codigo", { email, codigo });
    return res.data;
  };

  const reenviarCodigo = async (email) => {
    const res = await client.post("/auth/reenviar-codigo", { email });
    return res.data;
  };

  const olvidePassword = async (email) => {
    const res = await client.post("/auth/olvide-password", { email });
    return res.data;
  };

  const resetearPassword = async (email, codigo, nueva_password) => {
    const res = await client.post("/auth/resetear-password", { email, codigo, nueva_password });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("wally_token");
    localStorage.removeItem("wally_usuario");
    setUsuario(null);
  };

  // ==================== DISPOSITIVOS / ROBOTS ====================

  const misDispositivos = async () => {
    const res = await client.get("/dispositivos/mios");
    return res.data;
  };

  const vincularDispositivo = async (device_id) => {
    const res = await client.post("/dispositivos/vincular", { device_id });
    return res.data;
  };

  const editarDispositivo = async (device_id, cambios) => {
    const res = await client.put(`/dispositivos/${device_id}`, cambios);
    return res.data;
  };

  const desvincularDispositivo = async (device_id) => {
    const res = await client.post(`/dispositivos/${device_id}/desvincular`);
    return res.data;
  };

  // ==================== PERFIL ====================

  const actualizarNombre = async (nombre) => {
    const res = await client.put("/perfil/actualizar-nombre", { nombre });
    const usuarioActualizado = res.data.usuario;
    localStorage.setItem("wally_usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
    return res.data;
  };

  const solicitarCambioPassword = async () => {
    const res = await client.post("/perfil/solicitar-cambio-password");
    return res.data;
  };

  const confirmarCambioPassword = async (codigo, password_actual, password_nueva) => {
    const res = await client.put("/perfil/confirmar-cambio-password", {
      codigo,
      password_actual,
      password_nueva,
    });
    return res.data;
  };

  const exportarMisDatos = async (device_id) => {
    const res = await client.get(`/perfil/exportar/${device_id}`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `historial_${device_id}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const graficosMiRobot = async (device_id) => {
    const res = await client.get(`/perfil/graficos/${device_id}`);
    return res.data;
  };

  const actualizarFoto = async (foto_base64) => {
    const res = await client.put("/perfil/actualizar-foto", { foto_base64 });
    const usuarioActualizado = res.data.usuario;
    localStorage.setItem("wally_usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
    return res.data;
  };

  const eliminarFoto = async () => {
    const res = await client.delete("/perfil/eliminar-foto");
    const usuarioActualizado = res.data.usuario;
    localStorage.setItem("wally_usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        graficosMiRobot,

        // Auth
        login,
        registro,
        verificarCodigo,
        reenviarCodigo,
        olvidePassword,
        resetearPassword,
        logout,

        // Dispositivos
        misDispositivos,
        vincularDispositivo,
        editarDispositivo,
        desvincularDispositivo,

        // Perfil
        actualizarNombre,
        solicitarCambioPassword,
        confirmarCambioPassword,
        exportarMisDatos,
        actualizarFoto,
        eliminarFoto,

        estaAutenticado: !!usuario,
        esAdmin: usuario?.rol === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
import { useEffect, useState } from "react";
import client from "../api/client";

// Convierte la clave pública VAPID (base64url) al formato que pide el navegador
function claveAUint8Array(base64) {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + relleno).replace(/-/g, "+").replace(/_/g, "/");
  const crudo = window.atob(b64);
  return Uint8Array.from([...crudo].map((c) => c.charCodeAt(0)));
}

const soportado =
  "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

/**
 * Botón flotante para activar/desactivar las alarmas de WALLY en este
 * dispositivo. Al activarlas, el celular recibe notificaciones con
 * vibración cuando hay variación brusca o se superan los límites,
 * incluso con la app cerrada.
 */
export default function AlarmasPush() {
  const [estado, setEstado] = useState("cargando"); // cargando | inactivo | activo | bloqueado | ocupado

  useEffect(() => {
    if (!soportado) return;
    if (Notification.permission === "denied") {
      setEstado("bloqueado");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setEstado(sub ? "activo" : "inactivo"))
      .catch(() => setEstado("inactivo"));
  }, []);

  if (!soportado || estado === "cargando") return null;

  const activar = async () => {
    setEstado("ocupado");
    try {
      const permiso = await Notification.requestPermission();
      if (permiso !== "granted") {
        setEstado(permiso === "denied" ? "bloqueado" : "inactivo");
        return;
      }
      const { data } = await client.get("/push/clave-publica");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: claveAUint8Array(data.clave),
      });
      await client.post("/push/suscribir", sub.toJSON());
      setEstado("activo");
    } catch (e) {
      console.error("No se pudo activar las alarmas:", e);
      setEstado("inactivo");
      alert("No se pudieron activar las alarmas. Revisa tu conexión e inténtalo de nuevo.");
    }
  };

  const desactivar = async () => {
    setEstado("ocupado");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await client.post("/push/desuscribir", { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setEstado("inactivo");
    } catch (e) {
      console.error("No se pudo desactivar las alarmas:", e);
      setEstado("activo");
    }
  };

  const estilos = {
    position: "fixed",
    bottom: "18px",
    right: "18px",
    zIndex: 2000,
    border: "none",
    borderRadius: "999px",
    padding: "12px 18px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,0,0,.3)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  if (estado === "bloqueado") {
    return (
      <button
        style={{ ...estilos, background: "#666" }}
        onClick={() =>
          alert(
            "Las notificaciones están bloqueadas para esta app.\n\nActívalas en: Ajustes del navegador → Notificaciones → permitir para esta página, y vuelve a intentar."
          )
        }
      >
        🔕 Alarmas bloqueadas
      </button>
    );
  }

  if (estado === "activo") {
    return (
      <button style={{ ...estilos, background: "#2e9e5b" }} onClick={desactivar}>
        🔔 Alarmas activadas
      </button>
    );
  }

  return (
    <button
      style={{ ...estilos, background: "#863bff" }}
      onClick={activar}
      disabled={estado === "ocupado"}
    >
      🔔 Activar alarmas {estado === "ocupado" ? "..." : ""}
    </button>
  );
}

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../context/AuthContext";
import GraficoRobot from "../components/GraficoRobot";
import "../styles/GraficosPage.css";

function GraficosPage() {
  const navigate = useNavigate();
  const { misDispositivos, graficosMiRobot } = useAuth();
  const [robots, setRobots] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [lecturas, setLecturas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const contenidoRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await misDispositivos();
        setRobots(data);
        if (data.length > 0) setSeleccionado(data[0].device_id);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!seleccionado) return;
    (async () => {
      setCargandoDatos(true);
      try {
        const data = await graficosMiRobot(seleccionado);
        setLecturas(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargandoDatos(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccionado]);

  const exportarPdf = async () => {
    if (!contenidoRef.current) return;
    setGenerandoPdf(true);
    try {
      const canvas = await html2canvas(contenidoRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const imagen = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const anchoPagina = pdf.internal.pageSize.getWidth();
      const altoImagen = (canvas.height * anchoPagina) / canvas.width;
      pdf.setFontSize(14);
      pdf.text(`Gráficos de sensores - ${seleccionado}`, 40, 30);
      pdf.addImage(imagen, "PNG", 0, 45, anchoPagina, altoImagen);
      pdf.save(`graficos_${seleccionado}.pdf`);
    } finally {
      setGenerandoPdf(false);
    }
  };

  return (
    <div className="graficos-page">
      <header className="graficos-page-header">
        <button className="graficos-page-volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1>Gráficos</h1>
        <p>Historial de sensores de tus robots</p>
      </header>

      {cargando ? (
        <p className="graficos-page-mensaje">Cargando tus robots...</p>
      ) : robots.length === 0 ? (
        <p className="graficos-page-mensaje">
          Aún no tienes robots vinculados. Ve a tu perfil para vincular uno.
        </p>
      ) : (
        <>
          <div className="graficos-page-selector">
            {robots.map((r) => (
              <button
                key={r.device_id}
                className={`chip-robot ${seleccionado === r.device_id ? "chip-robot-activo" : ""}`}
                style={{ borderColor: r.color }}
                onClick={() => setSeleccionado(r.device_id)}
              >
                <span className="chip-robot-punto" style={{ backgroundColor: r.color }}></span>
                {r.nombre || r.device_id}
              </button>
            ))}
            {lecturas.length > 0 && (
              <button className="chip-robot chip-robot-pdf" onClick={exportarPdf} disabled={generandoPdf}>
                {generandoPdf ? "Generando..." : "📄 Descargar PDF"}
              </button>
            )}
          </div>

          <div className="graficos-page-contenido" ref={contenidoRef}>
            {cargandoDatos ? (
              <p className="graficos-page-mensaje">Cargando datos...</p>
            ) : lecturas.length === 0 ? (
              <p className="graficos-page-mensaje">
                Todavía no hay suficiente historial para graficar este robot.
              </p>
            ) : (
              <GraficoRobot lecturas={lecturas} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default GraficosPage;

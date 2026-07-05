import { useEffect, useState } from "react";
import client from "../api/client";
import "../styles/RankingZonas.css";

function RankingZonas() {
  const [datos, setDatos] = useState(null);
  const [vista, setVista] = useState("peores"); // peores | mejores

  useEffect(() => {
    client
      .get("/monitoreo/publico/ranking")
      .then((res) => setDatos(res.data))
      .catch((err) => console.error("Error cargando ranking de zonas:", err));
  }, []);

  if (!datos || datos.total_zonas_medidas === 0) return null;

  const lista = vista === "peores" ? datos.peores : datos.mejores;

  return (
    <div className="ranking-zonas-card">
      <div className="ranking-zonas-header">
        <div>
          <h3>Ranking de zonas monitoreadas</h3>
          <p>{datos.total_zonas_medidas} zonas medidas por el equipo hasta ahora</p>
        </div>
        <div className="ranking-zonas-tabs">
          <button
            className={vista === "peores" ? "activo" : ""}
            onClick={() => setVista("peores")}
          >
            Más contaminadas
          </button>
          <button
            className={vista === "mejores" ? "activo" : ""}
            onClick={() => setVista("mejores")}
          >
            Más limpias
          </button>
        </div>
      </div>

      <ol className="ranking-zonas-lista">
        {lista.map((z) => (
          <li key={z.id} className="ranking-zonas-item">
            <span className="ranking-zonas-color" style={{ backgroundColor: z.color_hex }}></span>
            <div className="ranking-zonas-info">
              <p className="ranking-zonas-nombre">{z.nombre}</p>
              <p className="ranking-zonas-detalle">
                CO {z.promedio_co ?? "S/D"} ppm · MQ135 {z.promedio_mq135 ?? "S/D"} · PM{" "}
                {z.promedio_pm ?? "S/D"} µg/m³
              </p>
            </div>
            <span className="ranking-zonas-nivel" style={{ color: z.color_hex }}>
              {z.nivel_color?.toUpperCase()}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default RankingZonas;

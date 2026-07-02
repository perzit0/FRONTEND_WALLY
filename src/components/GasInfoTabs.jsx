import { useState } from "react";
import "../styles/GasInfoTabs.css";

const GASES = {
  co: {
    nombre: "CO",
    nombreCompleto: "Monóxido de Carbono",
    descripcion:
      "Gas incoloro e inodoro producido por la combustión incompleta de combustibles (vehículos, quema de basura, cocinas a gas). Es peligroso porque desplaza el oxígeno en la sangre.",
    unidad: "ppm",
    niveles: [
      { rango: "0 - 9", nivel: "Bueno", color: "#22c55e", detalle: "Sin efecto, nivel típico de interior" },
      { rango: "9 - 35", nivel: "Moderado", color: "#f59e0b", detalle: "Límite permitido en ambientes laborales (OSHA)" },
      { rango: "> 35", nivel: "Malo", color: "#ef4444", detalle: "Dolor de cabeza, mareo con exposición prolongada" },
    ],
  },
  mq135: {
    nombre: "NH3 / COV",
    nombreCompleto: "Amoníaco y Compuestos Orgánicos Volátiles",
    descripcion:
      "Índice general de calidad del aire. Detecta una mezcla de gases: amoníaco, dióxido de nitrógeno, alcohol, benceno y humo. No identifica un gas específico, funciona como alarma general de contaminación.",
    unidad: "ppm",
    niveles: [
      { rango: "0 - 800", nivel: "Bueno", color: "#22c55e", detalle: "Aire bien ventilado, típico de exteriores" },
      { rango: "800 - 1200", nivel: "Moderado", color: "#f59e0b", detalle: "Ventilación reducida, aire cargado" },
      { rango: "> 1200", nivel: "Malo", color: "#ef4444", detalle: "Mala ventilación, puede causar fatiga" },
    ],
  },
  pm: {
    nombre: "PM",
    nombreCompleto: "Material Particulado (Polvo)",
    descripcion:
      "Partículas sólidas en suspensión en el aire: polvo, humo, polen, fibras. Las partículas PM2.5 son las más peligrosas porque son tan pequeñas que llegan hasta los pulmones profundos.",
    unidad: "µg/m³",
    niveles: [
      { rango: "0 - 12", nivel: "Bueno", color: "#22c55e", detalle: "Calidad de aire satisfactoria" },
      { rango: "12 - 35.4", nivel: "Moderado", color: "#f59e0b", detalle: "Grupos sensibles pueden notar síntomas leves" },
      { rango: "> 35.4", nivel: "Malo", color: "#ef4444", detalle: "No saludable, evitar exposición prolongada" },
    ],
  },
};

function GasInfoTabs() {
  const [activo, setActivo] = useState("co");
  const gas = GASES[activo];

  return (
    <div className="gas-tabs-container">
      <div className="gas-tabs-botones">
        {Object.entries(GASES).map(([key, g]) => (
          <button
            key={key}
            className={`gas-tab-btn ${activo === key ? "activo" : ""}`}
            onClick={() => setActivo(key)}
          >
            {g.nombre}
          </button>
        ))}
      </div>

      <div className="gas-tab-contenido">
        <h3>{gas.nombreCompleto}</h3>
        <p className="gas-tab-descripcion">{gas.descripcion}</p>

        <table className="gas-tab-tabla">
          <thead>
            <tr>
              <th>Rango ({gas.unidad})</th>
              <th>Nivel</th>
              <th>Interpretación</th>
            </tr>
          </thead>
          <tbody>
            {gas.niveles.map((n) => (
              <tr key={n.nivel}>
                <td>{n.rango}</td>
                <td>
                  <span className="gas-tab-badge" style={{ backgroundColor: n.color }}>
                    {n.nivel}
                  </span>
                </td>
                <td>{n.detalle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GasInfoTabs;
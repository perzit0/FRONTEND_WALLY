import TarjetaGrafico from "./TarjetaGrafico";
import "../styles/GraficoRobot.css";

function GraficoRobot({ lecturas }) {
  const labels = lecturas.map((l) =>
    new Date(l.timestamp).toLocaleString("es-PE", {
      timeZone: "America/Lima",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  const ultima = lecturas[lecturas.length - 1];

  return (
    <div className="grid-graficos">
      <TarjetaGrafico
        titulo="Monóxido de carbono"
        subtitulo="Sensor MQ-7"
        color="#ef4444"
        unidad="ppm"
        labels={labels}
        valores={lecturas.map((l) => l.co)}
        valorActual={ultima?.co}
      />
      <TarjetaGrafico
        titulo="Calidad del aire"
        subtitulo="Sensor MQ-135"
        color="#3b82f6"
        unidad="ppm"
        labels={labels}
        valores={lecturas.map((l) => l.mq135)}
        valorActual={ultima?.mq135}
      />
    </div>
  );
}

export default GraficoRobot;

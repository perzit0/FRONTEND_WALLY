import Mapa from "../components/Mapa";
import IconoPersona from "../components/IconoPersona";
import AlertaBanner from "../components/AlertaBanner";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">
      <AlertaBanner />
      <IconoPersona />

      <header className="home-header">
        <h1>WALLY</h1>
        <p>Monitoreo de calidad del aire en tiempo real</p>
      </header>

      <div className="home-mapa-wrapper">
        <Mapa />
      </div>

      <section className="home-info">
        <h2>¿Qué es el índice de CO?</h2>
        <p>
          El monóxido de carbono (CO) es un gas producido por la combustión incompleta
          de combustibles. Niveles elevados pueden ser perjudiciales para la salud.
        </p>

        <div className="home-leyenda">
          <div className="leyenda-item">
            <span className="leyenda-color" style={{ backgroundColor: "#22c55e" }}></span>
            Bueno (0-30 ppm)
          </div>
          <div className="leyenda-item">
            <span className="leyenda-color" style={{ backgroundColor: "#f59e0b" }}></span>
            Moderado (30-50 ppm)
          </div>
          <div className="leyenda-item">
            <span className="leyenda-color" style={{ backgroundColor: "#ef4444" }}></span>
            Malo (50+ ppm)
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
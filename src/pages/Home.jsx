import Mapa from "../components/Mapa";
import IconoPersona from "../components/IconoPersona";
import AlertaBanner from "../components/AlertaBanner";
import GasInfoTabs from "../components/GasInfoTabs";
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
        <GasInfoTabs />
      </section>
    </div>
  );
}

export default Home;
import { useEffect, useState } from "react";
import Mapa from "../components/Mapa";
import IconoPersona from "../components/IconoPersona";
import SensorStrips from "../components/SensorStrips";
import GasInfoTabs from "../components/GasInfoTabs";
import RankingZonas from "../components/RankingZonas";
import AlertaBanner from "../components/AlertaBanner";
import "../styles/Home.css";

function RelojEnVivo() {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="home-reloj">
      <span className="home-reloj-hora">
        {ahora.toLocaleTimeString("es-PE", { hour12: false })}
      </span>
      <span className="home-reloj-fecha">
        {ahora.toLocaleDateString("es-PE", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </span>
    </div>
  );
}

function Home() {
  return (
    <div className="home-container">
      <AlertaBanner />

      <header className="home-topbar">
        <div className="home-marca">
          <div className="home-logo" aria-hidden="true">
            <svg width="34" height="34" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="12" width="20" height="15" rx="4" fill="#eaf6ff" />
              <circle cx="14" cy="19" r="2.3" fill="#0ea5e9" />
              <circle cx="22" cy="19" r="2.3" fill="#0ea5e9" />
              <rect x="13" y="23" width="10" height="1.8" rx="0.9" fill="#0ea5e9" />
              <rect x="14.5" y="7" width="7" height="5" rx="1.5" fill="#eaf6ff" />
              <line x1="18" y1="3" x2="18" y2="7" stroke="#eaf6ff" strokeWidth="2" />
              <circle cx="18" cy="3" r="1.6" fill="#22c55e" />
            </svg>
          </div>
          <div className="home-title">
            <h1>
              WALLY
              <span className="home-badge-vivo">
                <span className="punto-vivo" aria-hidden="true"></span>
                EN VIVO
              </span>
            </h1>
            <p>Robot de monitoreo de calidad del aire · Lima, Perú</p>
          </div>
        </div>

        <div className="home-topbar-derecha">
          <RelojEnVivo />
          <IconoPersona />
        </div>
      </header>

      <main className="home-dashboard">
        <aside className="home-sensores">
          <SensorStrips />
        </aside>

        <section className="home-mapa-wrapper">
          <div className="home-mapa-marco">
            <div className="home-mapa-chip">
              <span className="punto-vivo" aria-hidden="true"></span>
              Rastreo en tiempo real · lecturas cada segundo
            </div>
            <Mapa />
          </div>
        </section>
      </main>

      <section className="home-info">
        <RankingZonas />
        <GasInfoTabs />
      </section>

      <footer className="home-footer">
        <p>
          WALLY · Robot autónomo de monitoreo ambiental — los datos del mapa y de
          los sensores se actualizan en vivo.
        </p>
      </footer>
    </div>
  );
}

export default Home;

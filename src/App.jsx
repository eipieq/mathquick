import { Routes, Route, Navigate } from "react-router-dom";
import { seedBankIfNeeded } from "./adaptive/bankSeeder.js";

// seed the question cache from the static bank on first load
seedBankIfNeeded();
import LandingScreen from "./LandingScreen";
import GameScreen from "./GameScreen";
import EndScreen from "./EndScreen";
import ResearchScreen from "./ResearchScreen";

export default function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/play/:mode" element={<GameScreen />} />
          <Route path="/results" element={<EndScreen />} />
          <Route path="/research" element={<ResearchScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

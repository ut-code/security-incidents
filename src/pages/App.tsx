import { useEffect, useReducer } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { createDefenseScenario } from "../lib/scenario";
import { initialState, type GameState } from "../lib/types";
import { reducer } from "../lib/state";
import { GameContext } from "../lib/GameContext";
import { AttackPage } from "./AttackPage";
import { DefensePage } from "./DefensePage";
import { LandingPage } from "./LandingPage";
import { NotFoundPage } from "./NotFoundPage";
import { SimulationListPage } from "./SimulationListPage";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <GameRouter />
    </BrowserRouter>
  );
}

function initialRouteState(): GameState {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = window.location.pathname.slice(basePath.length) || "/";
  const match = path.match(/^\/(\d+)\/(attack|defense)\/?$/);
  if (!match || match[1] !== "1") return initialState();
  if (match[2] === "defense") return createDefenseScenario(match[1]);
  return { ...initialState(), simulationId: match[1], mode: "attack", phase: "attack" };
}

function GameRouter() {
  const [state, dispatch] = useReducer(reducer, undefined, initialRouteState);
  const navigate = useNavigate();

  useEffect(() => {
    if (state.phase === "title") return;
    navigate(`/${state.simulationId}/${state.phase}`, { replace: true });
  }, [navigate, state.phase, state.simulationId]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/simulations" element={<SimulationListPage />} />
        <Route path="/1/attack" element={<AttackPage />} />
        <Route path="/1/defense" element={<DefensePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </GameContext.Provider>
  );
}

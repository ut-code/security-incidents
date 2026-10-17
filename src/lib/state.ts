import type { GameState } from "./types";
import { createDefenseScenario } from "./scenario";
export type Action =
  | { type: "START"; mode: GameState["mode"]; simulationId: string }
  | { type: "COMMAND"; state: GameState }
  | { type: "PHASE"; phase: GameState["phase"] }
  | { type: "EVIDENCE"; id: string }
  | { type: "WRONG" }
  | { type: "CARD"; id: string }
  | { type: "RESET" };
export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START":
      return action.mode === "defense"
        ? createDefenseScenario(action.simulationId)
        : { ...state, simulationId: action.simulationId, mode: "attack", phase: "attack" };
    case "COMMAND":
      return action.state;
    case "PHASE":
      return { ...state, phase: action.phase };
    case "EVIDENCE":
      return {
        ...state,
        logs: state.logs.map((l, i) => (String(i) === action.id ? { ...l, suspicious: true } : l)),
      };
    case "WRONG":
      return { ...state, wrongAnswers: state.wrongAnswers + 1 };
    case "CARD":
      return {
        ...state,
        cards: [...state.cards, action.id],
      };
    case "RESET":
      return {
        flags: {
          hasEnv: false,
          hasToken: false,
          idorFound: false,
          hasAdmin: false,
          exported: false,
        },
        simulationId: "simulation-1",
        stage: 1,
        clock: 0,
        logs: [],
        hintCount: 0,
        wrongAnswers: 0,
        history: [],
        cards: [],
        phase: "title",
        mode: "attack",
      };
  }
}

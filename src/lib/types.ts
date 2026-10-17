export type Flag = "hasEnv" | "hasToken" | "idorFound" | "hasAdmin" | "exported";
export type Log = {
  time: number;
  ip: string;
  method: string;
  path: string;
  status: number;
  bytes: number;
  ua: string;
  suspicious: boolean;
  stage: number;
  owasp: string;
  attack: string;
};
export type Mode = "attack" | "defense";
export type GameState = {
  simulationId: string;
  flags: Record<Flag, boolean>;
  stage: number;
  clock: number;
  logs: Log[];
  hintCount: number;
  wrongAnswers: number;
  history: string[];
  cards: string[];
  phase: "title" | "attack" | "defense";
  mode: Mode;
};
export const initialState = (): GameState => ({
  simulationId: "simulation-1",
  flags: { hasEnv: false, hasToken: false, idorFound: false, hasAdmin: false, exported: false },
  stage: 1,
  clock: 0,
  logs: [],
  hintCount: 0,
  wrongAnswers: 0,
  history: [],
  cards: [],
  phase: "title",
  mode: "attack",
});

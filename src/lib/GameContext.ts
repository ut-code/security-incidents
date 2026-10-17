import { createContext, useContext } from "react";
import type { Dispatch } from "react";
import type { Action } from "./state";
import type { GameState } from "./types";

export const GameContext = createContext<{
  state: GameState;
  dispatch: Dispatch<Action>;
} | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used inside GameContext.Provider");
  return context;
}

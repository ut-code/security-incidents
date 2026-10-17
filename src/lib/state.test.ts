import { describe, expect, it } from "vitest";
import { reducer } from "./state";
import { initialState } from "./types";

describe("simulation mode entry", () => {
  it("starts attack mode at the terminal phase", () => {
    const state = reducer(initialState(), {
      type: "START",
      mode: "attack",
      simulationId: "1",
    });
    expect(state.phase).toBe("attack");
    expect(state.mode).toBe("attack");
    expect(state.logs).toHaveLength(0);
  });

  it("starts defense mode with the complete shared incident log", () => {
    const state = reducer(initialState(), {
      type: "START",
      mode: "defense",
      simulationId: "1",
    });
    expect(state.phase).toBe("defense");
    expect(state.mode).toBe("defense");
    expect(state.simulationId).toBe("1");
    expect(state.flags.exported).toBe(true);
    expect(state.logs.filter((log) => log.suspicious)).toHaveLength(58);
  });
});

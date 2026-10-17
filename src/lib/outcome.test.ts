import { describe, expect, it } from "vitest";
import { outcome } from "./outcome";
import { createDefenseScenario } from "./scenario";

describe("defense response scoring", () => {
  it("scores each selected response card without a response-time input", () => {
    const scenario = createDefenseScenario();
    expect(outcome(scenario).leaked).toBe(12_480);
    expect(outcome({ ...scenario, cards: ["block-ip"] }).leaked).toBe(0);
    expect(outcome({ ...scenario, cards: ["fix-orders-auth"] }).leaked).toBe(0);
  });

  it("leaves an admin compromise ending when download is restricted", () => {
    const scenario = createDefenseScenario();
    const result = outcome({ ...scenario, cards: ["limit-download"] });
    expect(result.leaked).toBe(0);
    expect(result.ending).toBe("管理画面乗っ取り");
  });
});

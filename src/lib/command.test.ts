import { describe, it, expect } from "vitest";
import { initialState } from "./types";
import { runCommand } from "./command";
import { makeLogs } from "./logs";
import { outcome } from "./outcome";
import { createDefenseScenario } from "./scenario";
describe("simulation engine", () => {
  it("returns fixed scenario output and advances flags", () => {
    let s = initialState();
    let r = runCommand("curl https://shop.komaba-market.example/.env", s);
    expect(r.output).toContain("Komaba2023!");
    expect(r.state.flags.hasEnv).toBe(true);
    expect(runCommand("curl https://shop.komaba-market.example/.env", s).output).toBe(r.output);
  });
  it("serves a fixed fictional storefront at the root path", () => {
    const result = runCommand("curl https://shop.komaba-market.example", initialState());
    expect(result.output).toContain("HTTP/1.1 200 OK");
    expect(result.output).toContain("<title>駒場マーケット");
    expect(result.state.logs[0]).toMatchObject({ path: "/", status: 200, suspicious: true });
  });
  it("supports standard curl login and shell loop commands without running a shell", () => {
    let state = runCommand("curl https://shop.komaba-market.example/.env", initialState()).state;
    const login = runCommand(
      'curl -X POST -H \'Content-Type: application/json\' -d \'{"email":"staff-old@komaba-market.example","password":"Komaba2023!"}\' https://shop.komaba-market.example/api/login',
      state,
    );
    expect(login.output).toContain("demo_tok_4f2a");
    state = login.state;
    const loop = runCommand(
      'for id in {1001..1050}; do curl -H "Authorization: Bearer demo_tok_4f2a" "https://shop.komaba-market.example/api/orders/$id"; done',
      state,
    );
    expect(loop.output).toBe("50 records retrieved in 3.1s");
    expect(loop.state.logs.filter((log) => log.path.startsWith("/api/orders/")).length).toBe(50);
  });
  it("supports the admin login through curl after order IDOR discovery", () => {
    let state = runCommand("curl https://shop.komaba-market.example/.env", initialState()).state;
    state = runCommand(
      'curl -X POST -H \'Content-Type: application/json\' -d \'{"email":"staff-old@komaba-market.example","password":"Komaba2023!"}\' https://shop.komaba-market.example/api/login',
      state,
    ).state;
    state = runCommand(
      'for id in {1001..1050}; do curl -H "Authorization: Bearer demo_tok_4f2a" "https://shop.komaba-market.example/api/orders/$id"; done',
      state,
    ).state;
    const result = runCommand(
      'curl -X POST -H \'Content-Type: application/json\' -d \'{"username":"admin","password":"admin123"}\' https://shop.komaba-market.example/admin/login',
      state,
    );
    expect(result.output).toContain('"role":"admin"');
    expect(result.state.flags.hasAdmin).toBe(true);
  });
  it("builds a repeatable complete incident fixture for defense mode", () => {
    const scenario = createDefenseScenario();
    expect(scenario.phase).toBe("defense");
    expect(scenario.flags.exported).toBe(true);
    expect(scenario.logs.filter((log) => log.suspicious)).toHaveLength(58);
    expect(scenario).toEqual(createDefenseScenario());
  });
  it("mixes reproducible normal logs without inventing attack events", () => {
    const a = makeLogs([]);
    expect(a).toEqual(makeLogs([]));
    expect(a.filter((x) => x.suspicious)).toHaveLength(0);
  });
  it("penalizes hints and reports the ending", () => {
    const s = { ...initialState(), hintCount: 1 };
    expect(outcome(s).score).toBe(95);
    expect(outcome(s).ending).toBe("未遂");
  });
});
